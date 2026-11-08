import { betterAuth } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { env } from "cloudflare:workers";
import { SIGN_IN } from "astro:env/client";
import { BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ALLOW_TEST_SIGNIN } from "astro:env/server";

/* Sign-in runs on Better Auth (https://better-auth.com), mounted at /api/auth/* (src/pages/api/auth/[...all].js).
   Users, sessions, linked sign-in methods, one-time tokens and rate-limit counters live in the D1 database
   (tables in migrations/). Sessions are an HttpOnly cookie that lasts 30 days and renews once a day when used. */
const DAY = 86400;

/* a test account for running on your own computer only: never on a real domain */
export const testSignIn = (url) =>
  SIGN_IN && ["localhost", "127.0.0.1"].includes(url.hostname) && (import.meta.env.DEV || ALLOW_TEST_SIGNIN === "1");
/* without its own secret, sign-in only works on your computer, with a fixed secret nobody relies on */
const secretFor = (url) => BETTER_AUTH_SECRET || (testSignIn(url) ? "local-only-secret-not-for-a-real-domain" : null);

/* /api/auth/dev/sign-in: signs in the local test account (only offered on localhost, see testSignIn) */
const devSignIn = {
  id: "dev-sign-in",
  endpoints: {
    devSignIn: createAuthEndpoint("/dev/sign-in", { method: "POST" }, async (ctx) => {
      const adapter = ctx.context.internalAdapter;
      const email = "local-tester@example.invalid";
      let user = (await adapter.findUserByEmail(email))?.user;
      if (!user) {
        user = await adapter.createUser({ email, name: "Local tester", emailVerified: false });
        await adapter.linkAccount({ userId: user.id, providerId: "dev", accountId: "local" });
      }
      const session = await adapter.createSession(user.id);
      await setSessionCookie(ctx, { session, user });
      return ctx.json({ ok: true });
    }),
  },
};

/* one Better Auth instance per site address (production, a preview, or localhost in tests) */
const cache = new Map();
export function auth(url) {
  if (!SIGN_IN) return null;
  const secret = secretFor(url);
  if (!secret) return null;
  let a = cache.get(url.origin);
  if (a) return a;
  const google = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET;
  a = betterAuth({
    appName: "Rep Rep Rep",
    baseURL: url.origin,
    basePath: "/api/auth",
    secret,
    database: env.DB,
    trustedOrigins: [url.origin],
    session: { expiresIn: 30 * DAY, updateAge: DAY },
    socialProviders: google
      ? { google: { clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, prompt: "select_account" } }
      : {},
    account: { accountLinking: { enabled: true, trustedProviders: ["google"] } },
    /* counters in D1: a Worker's memory isn't shared between requests, and KV can't count atomically */
    rateLimit: { enabled: true, storage: "database" },
    verification: { storeInDatabase: true },
    advanced: {
      cookiePrefix: "rrr",
      /* the visitor's address as Cloudflare saw it; X-Forwarded-For can be set by anyone */
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
    },
    plugins: testSignIn(url) ? [devSignIn] : [],
  });
  cache.set(url.origin, a);
  return a;
}

/* ---------- what the rest of the site uses ---------- */
export function providers(url) {
  const a = auth(url);
  if (!a) return [];
  const list = [];
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) list.push({ id: "google", name: "Google" });
  if (testSignIn(url)) list.push({ id: "dev", name: "a local test account" });
  return list;
}

/* where to land after signing in: only paths on this site */
export const safeNext = (p) =>
  typeof p === "string" && p.startsWith("/") && !p.startsWith("//") && !p.includes("\\") ? p : "/account";

/* the signed-in user ({id, name, email}), or null */
export async function currentUser(request, url) {
  const a = auth(url);
  if (!a) return null;
  const s = await a.api.getSession({ headers: request.headers }).catch(() => null);
  return s ? { id: s.user.id, name: s.user.name, email: s.user.email } : null;
}

/* a Better Auth answer as a redirect: its cookies, with the browser sent to `to` */
export function redirectWith(res, to) {
  const headers = new Headers({ Location: to, "Cache-Control": "no-store" });
  for (const c of res.headers.getSetCookie()) headers.append("Set-Cookie", c);
  return new Response(null, { status: 302, headers });
}

/* ends this browser's session and removes its cookies (through Astro's cookies, for actions) */
export async function endSession(request, url, cookies) {
  const a = auth(url);
  if (!a) return;
  const res = await a.api.signOut({ headers: request.headers, asResponse: true }).catch(() => null);
  const names = new Set((res?.headers.getSetCookie() || []).map((c) => c.split("=")[0]));
  const ctx = await a.$context;
  for (const c of Object.values(ctx.authCookies)) names.add(c.name);
  for (const n of names) if (cookies.has(n)) cookies.delete(n, { path: "/" });
}

/* ---------- small response helpers ---------- */
export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
