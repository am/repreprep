// The server routes with sign-in switched on (SIGN_IN=true), using the local test account:
// signing in and out, saving progress, the account download and deleting the account.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { startWorker, client } from "./worker.mjs";

let w;
before(async () => {
  execSync("npx astro build --outDir dist-signin", { env: { ...process.env, SIGN_IN: "true" }, stdio: "ignore" });
  /* made-up Google keys: enough to start a Google sign-in, which the tests stop at Google's door */
  w = await startWorker({
    dist: "dist-signin",
    port: 8792,
    vars: { ALLOW_TEST_SIGNIN: "1", GOOGLE_CLIENT_ID: "test-client", GOOGLE_CLIENT_SECRET: "test-secret" },
  });
});
after(() => w?.stop());

const signIn = async (c, next = "/model-cycles") => {
  const r = await c.req(`/auth/dev?next=${encodeURIComponent(next)}`);
  assert.equal(r.status, 302);
  return r.headers.get("location");
};
/* the local runtime doesn't send email; the site logs each link instead (localhost only).
   Waits for link number `n` (counting from 1) sent to that address. */
const emailed = async (what, email, n = 1) => {
  const re = new RegExp(`${what} for ${email.replace(/[.+]/g, "\\$&")}: (\\S+)`, "g");
  for (let i = 0; i < 50; i++) {
    const link = [...w.log().matchAll(re)][n - 1]?.[1];
    if (link) return new URL(link);
    await new Promise((ok) => setTimeout(ok, 100));
  }
  assert.fail(`${what} number ${n} for ${email} logged`);
};
/* each test counts as its own visitor, so Better Auth's per-visitor limits don't carry over between tests */
let visitor = 10;
const asVisitor = () => ({ "cf-connecting-ip": `198.51.100.${visitor++}` });
const progress = (updatedAt) => ({
  data: { updatedAt, inst: { cycles: { steps: { "w01:0": true }, done: {}, notes: { w01: "hi" }, active: {} } } },
});

test("the pages offer sign-in", async () => {
  const c = client(w.origin);
  assert.match(await (await c.req("/account")).text(), /<title>Log in/);
  assert.match(await (await c.req("/account/signup")).text(), /<title>Sign up/);
  assert.match(await (await c.req("/account/data")).text(), /<title>Your data/);
});

test("the local test account signs in, and is sent back only to this site", async () => {
  const c = client(w.origin);
  assert.deepEqual((await c.action("account.me")).data.providers, [
    { id: "google", name: "Google" },
    { id: "email", name: "email" },
    { id: "password", name: "password" },
    { id: "dev", name: "a local test account" },
  ]);
  assert.equal(await signIn(c, "//evil.example"), "/account");
  assert.equal(await signIn(c), "/model-cycles");
  assert.ok(c.jar.get("rrr.session_token"));
  assert.deepEqual((await c.action("account.me")).data.user, {
    name: "Local tester",
    email: "local-tester@example.invalid",
  });
  /* GitHub sign-in is gone */
  assert.equal((await c.req("/auth/github")).status, 404);
});

test("progress is saved to the account and read back", async () => {
  const c = client(w.origin);
  await signIn(c);
  await c.action("account.delete"); /* start from an empty account */
  await signIn(c);
  assert.deepEqual((await c.action("progress.load")).data, { data: null, updatedAt: 0 });
  assert.deepEqual((await c.action("progress.save", progress(1234))).data, { ...progress(1234), updatedAt: 1234 });
  assert.deepEqual((await c.action("progress.load")).data, { ...progress(1234), updatedAt: 1234 });
  assert.equal(
    (
      await c.req("/_actions/progress.save", {
        method: "POST",
        body: "{nope",
        headers: { "Content-Type": "application/json" },
      })
    ).status >= 400,
    true
  );
  assert.equal((await c.action("progress.save", { data: [1] })).status, 400);
  assert.equal((await c.action("progress.save", { data: { inst: 3 } })).status, 400);
  assert.equal((await c.action("progress.save", { data: { inst: {}, pad: "x".repeat(600000) } })).status, 413);
  assert.equal((await c.action("progress.save", progress(1), { origin: null })).status, 403);
});

test("saves from two devices are combined, removals included", async () => {
  const c = client(w.origin);
  await signIn(c);
  await c.action("account.delete");
  await signIn(c);
  const cycles = (steps, notes = {}) => ({ lesson: null, steps, done: {}, notes, active: {} });
  /* the phone ticks a step of lesson 1 and writes a note */
  await c.action("progress.save", {
    data: {
      updatedAt: 10,
      stamps: { "cycles/steps/w01:0": 10, "cycles/notes/w01": 10 },
      inst: { cycles: cycles({ "w01:0": true }, { w01: "phone" }) },
    },
  });
  /* the laptop, which never saw that, ticks a step of lesson 2 later */
  const r = await c.action("progress.save", {
    data: { updatedAt: 20, stamps: { "cycles/steps/w02:0": 20 }, inst: { cycles: cycles({ "w02:0": true }) } },
  });
  assert.deepEqual(r.data.data.inst.cycles.steps, { "w01:0": true, "w02:0": true });
  assert.deepEqual(r.data.data.inst.cycles.notes, { w01: "phone" });
  /* the laptop deletes the note after that: the removal wins over the older note */
  await c.action("progress.save", {
    data: {
      updatedAt: 30,
      stamps: { "cycles/steps/w02:0": 20, "cycles/notes/w01": 30 },
      inst: { cycles: cycles({ "w02:0": true }) },
    },
  });
  const { data } = (await c.action("progress.load")).data;
  assert.deepEqual(data.inst.cycles.steps, { "w01:0": true, "w02:0": true });
  assert.deepEqual(data.inst.cycles.notes, {});
  assert.equal(data.updatedAt, 30);
});

test("the account download has everything kept about you", async () => {
  const c = client(w.origin);
  await signIn(c);
  await c.action("account.delete"); /* start from an empty account */
  await signIn(c);
  await c.action("progress.save", progress(99));
  await c.req("/api/contact", {
    method: "POST",
    body: c.form({ message: "From a signed-in person", reply_to: "a@b.co" }),
  });
  await c.req("/api/contact", { method: "POST", body: c.form({ message: "bot", website: "x" }) });
  const r = await c.req("/api/export");
  assert.equal(r.headers.get("content-disposition"), 'attachment; filename="repreprep-account.json"');
  const body = await r.json();
  assert.equal(body.account.name, "Local tester");
  assert.deepEqual(body.signInWith, [{ provider: "dev", providerUserId: "local" }]);
  assert.equal(body.sessions.length >= 1, true);
  assert.deepEqual(body.progress.data, progress(99).data);
  assert.deepEqual(body.messages.map((m) => [m.message, m.replyTo]).at(-1), ["From a signed-in person", "a@b.co"]);
  assert.ok(!body.messages.some((m) => m.message === "bot"));
});

test("signing out ends the session", async () => {
  const c = client(w.origin);
  await signIn(c);
  assert.equal((await c.action("account.signOut")).status, 204);
  assert.equal(c.jar.get("rrr.session_token"), undefined);
  assert.equal((await c.action("account.me")).data.user, null);
  assert.equal((await c.action("progress.load")).status, 401);
});

test("deleting the account removes its progress and signs you out", async () => {
  const c = client(w.origin);
  await signIn(c);
  await c.action("progress.save", progress(5));
  assert.equal((await c.action("account.delete", undefined, { origin: null })).status, 403);
  assert.equal((await c.action("account.delete")).status, 204);
  assert.equal((await c.action("account.me")).data.user, null);
  await signIn(c);
  assert.deepEqual((await c.action("progress.load")).data, { data: null, updatedAt: 0 });
  const body = await (await c.req("/api/export")).json();
  assert.equal(body.messages.length, 0);
});

test("Google sign-in goes to Google with a one-time state, and a forged return is turned away", async () => {
  const c = client(w.origin);
  const r = await c.req("/auth/google?next=/model-cycles");
  assert.equal(r.status, 302);
  const to = new URL(r.headers.get("location"));
  assert.equal(to.origin, "https://accounts.google.com");
  assert.equal(to.searchParams.get("client_id"), "test-client");
  assert.equal(to.searchParams.get("redirect_uri"), `${w.origin}/api/auth/callback/google`);
  assert.equal(to.searchParams.get("code_challenge_method"), "S256");
  assert.ok(to.searchParams.get("state"));
  /* coming back with a state this browser never got is an error, not a sign-in */
  const cb = await client(w.origin).req("/api/auth/callback/google?code=x&state=made-up");
  assert.equal(cb.status, 302);
  assert.match(cb.headers.get("location"), /error/);
  /* only paths on this site are accepted as where to go next */
  assert.equal((await c.req("/auth/google?next=https://evil.example")).status, 302);
});

test("the session cookie can't be read by scripts or sent from other sites", async () => {
  const c = client(w.origin);
  const r = await c.req("/auth/dev");
  const cookie = r.headers.getSetCookie().find((h) => h.startsWith("rrr.session_token="));
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Lax/i);
  assert.match(cookie, /Max-Age=2592000/i);
});

test("Better Auth refuses sign-out from another site, and counts requests per visitor", async () => {
  const c = client(w.origin);
  await signIn(c);
  const evil = await c.req("/api/auth/sign-out", { method: "POST", origin: "https://evil.example", json: {} });
  assert.equal(evil.status, 403);
  assert.ok((await c.action("account.me")).data.user, "still signed in");
  /* the dev sign-in is limited like any sign-in: past the limit it answers 429 */
  let limited = false;
  for (let i = 0; i < 120 && !limited; i++) {
    const r = await client(w.origin).req("/api/auth/get-session", { headers: { "cf-connecting-ip": "203.0.113.9" } });
    limited = r.status === 429;
  }
  assert.ok(limited, "rate limit reached");
});

test("a sign-in link by email signs you in once, and only for this site", async () => {
  const c = client(w.origin);
  const email = `learner-${Date.now()}@example.com`;
  const ask = (body, opts) => c.req("/api/auth/sign-in/magic-link", { method: "POST", json: body, ...opts });
  assert.equal((await ask({ email, callbackURL: "/model-cycles" }, { origin: "https://evil.example" })).status, 403);
  const r = await ask({ email, callbackURL: "/model-cycles", errorCallbackURL: "/account?error=signin" });
  assert.equal(r.status, 200);
  const u = await emailed("sign-in link", email);
  assert.equal(u.origin, w.origin);
  const open = await c.req(u.pathname + u.search);
  assert.equal(open.status, 302);
  assert.equal(new URL(open.headers.get("location"), w.origin).href, `${w.origin}/model-cycles`);
  assert.equal(open.headers.get("referrer-policy"), "no-referrer");
  assert.equal((await c.action("account.me")).data.user.email, email);
  /* the same link a second time is turned away */
  const again = await client(w.origin).req(u.pathname + u.search);
  assert.equal(again.status, 302);
  assert.match(again.headers.get("location"), /error/);
  /* a link that sends you to another site is refused when it is asked for */
  assert.equal((await ask({ email, callbackURL: "https://evil.example/" })).status, 403);
});

test("email and password: an account starts only once its address is confirmed", async () => {
  const c = client(w.origin);
  const headers = asVisitor();
  const email = `pw-${Date.now()}@example.com`;
  const post = (path, json) => c.req(`/api/auth/${path}`, { method: "POST", json, headers });
  const password = "a long and fresh passphrase";
  /* too short */
  const short = await post("sign-up/email", { email, password: "short", name: "pw" });
  assert.equal(short.status, 400);
  assert.equal((await short.json()).code, "PASSWORD_TOO_SHORT");
  /* signing up sends a confirm link and doesn't sign you in */
  assert.equal(
    (await post("sign-up/email", { email, password, name: "pw", callbackURL: "/model-cycles" })).status,
    200
  );
  assert.equal(c.jar.get("rrr.session_token"), undefined);
  const first = await emailed("confirm link", email);
  /* signing in before confirming is refused, and sends a fresh link */
  const early = await post("sign-in/email", { email, password, callbackURL: "/model-cycles" });
  assert.equal(early.status, 403);
  assert.equal((await early.json()).code, "EMAIL_NOT_VERIFIED");
  const link = await emailed("confirm link", email, 2);
  assert.ok(first);
  /* the confirm link signs you in and sends you on, on this site only */
  const open = await c.req(link.pathname + link.search);
  assert.equal(open.status, 302);
  assert.equal(new URL(open.headers.get("location"), w.origin).href, `${w.origin}/model-cycles`);
  assert.equal((await c.action("account.me")).data.user.email, email);
  /* afterwards the password works, a wrong one doesn't */
  const other = client(w.origin);
  const otherPost = (json) => other.req("/api/auth/sign-in/email", { method: "POST", json, headers: asVisitor() });
  const wrong = await otherPost({ email, password: "not the right password" });
  assert.equal(wrong.status, 401);
  assert.equal((await wrong.json()).code, "INVALID_EMAIL_OR_PASSWORD");
  assert.equal((await otherPost({ email, password })).status, 200);
  assert.equal((await other.action("account.me")).data.user.email, email);
  /* signing up again with the same address gives nothing away */
  assert.equal((await post("sign-up/email", { email, password: "another long passphrase", name: "x" })).status, 200);
  /* from another site, refused */
  const evil = await c.req("/api/auth/sign-in/email", {
    method: "POST",
    json: { email, password },
    origin: "https://evil.example",
    headers: asVisitor(),
  });
  assert.equal(evil.status, 403);
});

test("a forgotten password is reset by email, once, and signs out every device", async () => {
  const c = client(w.origin);
  const email = `reset-${Date.now()}@example.com`;
  const password = "the first long passphrase";
  const post = (path, json, who = c) => who.req(`/api/auth/${path}`, { method: "POST", json, headers: asVisitor() });
  await post("sign-up/email", { email, password, name: "reset" });
  const confirm = await emailed("confirm link", email);
  await c.req(confirm.pathname + confirm.search);
  assert.equal((await c.action("account.me")).data.user.email, email);
  /* an address with no account gets the same answer */
  const nobody = await post("request-password-reset", { email: "nobody@example.com", redirectTo: "/account/reset" });
  assert.equal(nobody.status, 200);
  /* only a page on this site can receive the reset link */
  assert.equal((await post("request-password-reset", { email, redirectTo: "https://evil.example/reset" })).status, 403);
  assert.equal((await post("request-password-reset", { email, redirectTo: "/account/reset" })).status, 200);
  const link = await emailed("password reset link", email);
  /* the emailed link lands on the reset page with its token */
  const open = await client(w.origin).req(link.pathname + link.search);
  assert.equal(open.status, 302);
  const landing = new URL(open.headers.get("location"), w.origin);
  assert.equal(landing.pathname, "/account/reset");
  const token = landing.searchParams.get("token");
  assert.ok(token);
  const newPassword = "the second long passphrase";
  const reset = (json) => post("reset-password", json, client(w.origin));
  assert.equal((await reset({ newPassword: "short", token })).status, 400);
  assert.equal((await reset({ newPassword, token })).status, 200);
  /* the same link twice is refused */
  assert.equal((await reset({ newPassword: "a third long passphrase", token })).status, 400);
  /* every session ended, the old password stopped working, the new one works */
  assert.equal((await c.action("account.me")).data.user, null);
  assert.equal((await post("sign-in/email", { email, password }, client(w.origin))).status, 401);
  assert.equal((await post("sign-in/email", { email, password: newPassword }, client(w.origin))).status, 200);
  /* the reset page itself is there */
  assert.match(await (await c.req("/account/reset")).text(), /Choose a new password/);
});
