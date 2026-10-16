import { GitHub, Google, generateState, generateCodeVerifier, decodeIdToken } from "arctic";
import { db, env } from "./db.js";

/* Sign-in: Google or GitHub (OAuth, no passwords stored here). A random session token lives in an
   HttpOnly cookie; the database keeps only its SHA-256 hash. Sessions last 30 days and renew when used. */
export const SESSION_COOKIE = "rrr_session";
const DAY = 864e5, SESSION_DAYS = 30;

const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const randomToken = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
async function sha256(s) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const cookieOpts = (url, maxAgeDays) => ({
  path: "/", httpOnly: true, sameSite: "lax", secure: url.protocol === "https:", maxAge: Math.round(maxAgeDays * 86400),
});

/* ---------- providers ---------- */
export function providers(url) {
  const list = [];
  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) list.push({ id: "google", name: "Google" });
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) list.push({ id: "github", name: "GitHub" });
  if (testSignIn(url)) list.push({ id: "dev", name: "a local test account" });
  return list;
}
/* a test account for running on your own computer only: never on a real domain */
export const testSignIn = (url) =>
  ["localhost", "127.0.0.1"].includes(url.hostname) && (import.meta.env.DEV || env.ALLOW_TEST_SIGNIN === "1");
function client(id, url) {
  const redirect = `${url.origin}/auth/${id}/callback`;
  if (id === "github") return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET, redirect);
  if (id === "google") return new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, redirect);
  return null;
}
/* where to land after signing in: only paths on this site */
export const safeNext = (p) => (typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") ? p : "/account");

export function startSignIn(id, url, cookies) {
  const c = client(id, url);
  if (!c) return null;
  const state = generateState();
  const opts = { ...cookieOpts(url, 10 / 1440) };
  cookies.set("rrr_oauth_state", state, opts);
  cookies.set("rrr_next", safeNext(url.searchParams.get("next")), opts);
  if (id === "google") {
    const verifier = generateCodeVerifier();
    cookies.set("rrr_oauth_verifier", verifier, opts);
    return c.createAuthorizationURL(state, verifier, ["openid", "profile", "email"]);
  }
  return c.createAuthorizationURL(state, ["read:user", "user:email"]);
}

/* returns {provider_user_id, name, email} for the person who just signed in */
export async function finishSignIn(id, url, cookies) {
  const c = client(id, url);
  const state = url.searchParams.get("state"), code = url.searchParams.get("code");
  const saved = cookies.get("rrr_oauth_state")?.value;
  if (!c || !code || !state || state !== saved) throw new Error("Sign-in expired or was started elsewhere. Please try again.");
  if (id === "google") {
    const tokens = await c.validateAuthorizationCode(code, cookies.get("rrr_oauth_verifier")?.value || "");
    const claims = decodeIdToken(tokens.idToken());
    return { provider_user_id: String(claims.sub), name: claims.name || null, email: claims.email_verified ? claims.email : null };
  }
  const tokens = await c.validateAuthorizationCode(code);
  const headers = { Authorization: `Bearer ${tokens.accessToken()}`, "User-Agent": "repreprep", Accept: "application/vnd.github+json" };
  const u = await (await fetch("https://api.github.com/user", { headers })).json();
  if (!u?.id) throw new Error("GitHub did not return your account.");
  let email = u.email;
  if (!email) {
    const list = await (await fetch("https://api.github.com/user/emails", { headers })).json().catch(() => []);
    email = Array.isArray(list) ? list.find((e) => e.primary && e.verified)?.email || null : null;
  }
  return { provider_user_id: String(u.id), name: u.name || u.login, email };
}

/* ---------- users and sessions ---------- */
export async function userFor(provider, profile) {
  const d = await db();
  const found = await d.prepare("SELECT user_id FROM accounts WHERE provider=? AND provider_user_id=?").bind(provider, profile.provider_user_id).first();
  if (found) {
    await d.prepare("UPDATE users SET name=COALESCE(?,name), email=COALESCE(?,email) WHERE id=?").bind(profile.name, profile.email, found.user_id).run();
    return found.user_id;
  }
  const id = crypto.randomUUID();
  await d.batch([
    d.prepare("INSERT INTO users (id,name,email,created_at) VALUES (?,?,?,?)").bind(id, profile.name, profile.email, Date.now()),
    d.prepare("INSERT INTO accounts (provider,provider_user_id,user_id) VALUES (?,?,?)").bind(provider, profile.provider_user_id, id),
  ]);
  return id;
}
export async function createSession(userId, url, cookies) {
  const token = randomToken();
  const d = await db();
  await d.prepare("INSERT INTO sessions (id,user_id,expires_at) VALUES (?,?,?)").bind(await sha256(token), userId, Date.now() + SESSION_DAYS * DAY).run();
  cookies.set(SESSION_COOKIE, token, cookieOpts(url, SESSION_DAYS));
}
/* the signed-in user, or null */
export async function currentUser(url, cookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const d = await db();
  const id = await sha256(token);
  const row = await d.prepare("SELECT s.expires_at, u.id, u.name, u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=?").bind(id).first();
  if (!row || row.expires_at < Date.now()) {
    if (row) await d.prepare("DELETE FROM sessions WHERE id=?").bind(id).run();
    cookies.delete(SESSION_COOKIE, { path: "/" });
    return null;
  }
  if (row.expires_at - Date.now() < (SESSION_DAYS / 2) * DAY) {
    await d.prepare("UPDATE sessions SET expires_at=? WHERE id=?").bind(Date.now() + SESSION_DAYS * DAY, id).run();
    cookies.set(SESSION_COOKIE, token, cookieOpts(url, SESSION_DAYS));
  }
  return { id: row.id, name: row.name, email: row.email };
}
export async function endSession(cookies) {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (token) await (await db()).prepare("DELETE FROM sessions WHERE id=?").bind(await sha256(token)).run();
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

/* ---------- small response helpers ---------- */
export const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
/* writes must come from this site (the browser sends Origin on fetch PUT/POST/DELETE) */
export const sameOrigin = (request, url) => request.headers.get("Origin") === url.origin;
