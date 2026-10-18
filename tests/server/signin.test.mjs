// The server routes with sign-in switched on (SIGN_IN=true), using the local test account:
// signing in and out, saving progress, the account download and deleting the account.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { startWorker, client } from "./worker.mjs";

let w;
before(async () => {
  execSync("npx astro build --outDir dist-signin", { env: { ...process.env, SIGN_IN: "true" }, stdio: "ignore" });
  w = await startWorker({ dist: "dist-signin", port: 8792, vars: { ALLOW_TEST_SIGNIN: "1" } });
});
after(() => w?.stop());

const signIn = async (c, next = "/model-cycles") => {
  const r = await c.req(`/auth/dev?next=${encodeURIComponent(next)}`);
  assert.equal(r.status, 302);
  return r.headers.get("location");
};
const progress = (updatedAt) => ({ data: { updatedAt, inst: { cycles: { steps: { "w01:0": true }, done: {}, notes: { w01: "hi" }, active: {} } } } });

test("the pages offer sign-in", async () => {
  const html = await (await client(w.origin).req("/account")).text();
  assert.match(html, /<title>Your account/);
});

test("the local test account signs in, and is sent back only to this site", async () => {
  const c = client(w.origin);
  assert.deepEqual((await (await c.req("/api/me")).json()).providers, [{ id: "dev", name: "a local test account" }]);
  assert.equal(await signIn(c, "//evil.example"), "/account");
  assert.equal(await signIn(c), "/model-cycles");
  assert.ok(c.jar.get("rrr_session"));
  assert.deepEqual((await (await c.req("/api/me")).json()).user, { name: "Local tester", email: null });
  /* Google and GitHub need their keys, which a local run doesn't have */
  for (const p of ["/auth/google", "/auth/github"]) assert.equal((await c.req(p)).status, 404, p);
});

test("progress is saved to the account and read back", async () => {
  const c = client(w.origin);
  await signIn(c);
  await c.req("/api/me", { method: "DELETE" }); /* start from an empty account */
  await signIn(c);
  assert.deepEqual(await (await c.req("/api/progress")).json(), { data: null, updatedAt: 0 });
  const saved = await c.req("/api/progress", { method: "PUT", json: progress(1234) });
  assert.deepEqual(await saved.json(), { ok: true, updatedAt: 1234 });
  assert.deepEqual(await (await c.req("/api/progress")).json(), { ...progress(1234), updatedAt: 1234 });
  assert.equal((await c.req("/api/progress", { method: "PUT", body: "{nope", headers: { "Content-Type": "application/json" } })).status, 400);
  assert.equal((await c.req("/api/progress", { method: "PUT", json: { data: [1] } })).status, 400);
  assert.equal((await c.req("/api/progress", { method: "PUT", json: { data: { inst: {}, pad: "x".repeat(600000) } } })).status, 413);
  assert.equal((await c.req("/api/progress", { method: "PUT", origin: null, json: progress(1) })).status, 403);
});

test("the account download has everything kept about you", async () => {
  const c = client(w.origin);
  await signIn(c);
  await c.req("/api/progress", { method: "PUT", json: progress(99) });
  await c.req("/api/contact", { method: "POST", body: c.form({ message: "From a signed-in person", reply_to: "a@b.co" }) });
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
  assert.deepEqual(await (await c.req("/auth/logout", { method: "POST" })).json(), { ok: true });
  assert.equal(c.jar.get("rrr_session"), undefined);
  assert.equal((await (await c.req("/api/me")).json()).user, null);
  assert.equal((await c.req("/api/progress")).status, 401);
});

test("deleting the account removes its progress and signs you out", async () => {
  const c = client(w.origin);
  await signIn(c);
  await c.req("/api/progress", { method: "PUT", json: progress(5) });
  assert.equal((await c.req("/api/me", { method: "DELETE", origin: null })).status, 403);
  assert.deepEqual(await (await c.req("/api/me", { method: "DELETE" })).json(), { ok: true });
  assert.equal((await (await c.req("/api/me")).json()).user, null);
  await signIn(c);
  assert.deepEqual(await (await c.req("/api/progress")).json(), { data: null, updatedAt: 0 });
  const body = await (await c.req("/api/export")).json();
  assert.equal(body.messages.length, 0);
});
