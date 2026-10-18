// The server routes of the site as it is deployed now, with sign-in switched off (run after `astro build`).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startWorker, client } from "./worker.mjs";

let w, c;
before(async () => {
  w = await startWorker({ port: 8791, vars: { ALLOW_TEST_SIGNIN: "1" } });
  c = client(w.origin);
});
after(() => w?.stop());

test("pages are served, unknown addresses get the not-found page", async () => {
  assert.equal((await c.req("/model-cycles/lessons/05/3")).status, 200);
  const r = await c.req("/model-cycles/lessons/99");
  assert.equal(r.status, 404);
  assert.match(await r.text(), /That page isn't here/);
});

test("nobody is signed in and there are no sign-in options", async () => {
  assert.deepEqual((await c.action("account.me")).data, { user: null, providers: [] });
  for (const p of ["/auth/dev", "/auth/google", "/auth/github"]) assert.equal((await c.req(p)).status, 404, p);
  const cb = await c.req("/auth/github/callback?code=x&state=y");
  assert.equal(cb.status, 302);
  assert.equal(cb.headers.get("location"), "/account?error=signin");
});

test("account actions need a signed-in person", async () => {
  assert.equal((await c.action("progress.load")).status, 401);
  assert.equal((await c.action("progress.save", { data: { inst: {} } })).status, 401);
  assert.equal((await c.req("/api/export")).status, 401);
  assert.equal((await c.action("account.delete")).status, 401);
  assert.equal((await c.action("account.signOut")).status, 204);
});

test("writes from another site are refused", async () => {
  for (const [path, method] of [
    ["/_actions/progress.save", "POST"],
    ["/_actions/account.delete", "POST"],
    ["/_actions/account.signOut", "POST"],
    ["/api/contact", "POST"],
  ]) {
    for (const origin of [null, "https://evil.example"]) {
      /* a small JSON body for every route: the local runtime can drop the connection when a refused form isn't read */
      const r = await c.req(path, { method, origin, json: {} });
      assert.equal(r.status, 403, `${method} ${path} from ${origin}`);
    }
  }
});

test("contact form: each outcome comes back to the privacy page", async () => {
  const send = async (fields) => {
    const r = await c.req("/api/contact", { method: "POST", body: c.form(fields) });
    assert.equal(r.status, 303);
    return r.headers.get("location");
  };
  assert.equal(await send({ message: "  " }), "/privacy?error=empty#contact");
  assert.equal(await send({ message: "x".repeat(4001) }), "/privacy?error=long#contact");
  assert.equal(await send({ message: "spam", website: "http://spam" }), "/privacy?sent=1#contact");
  assert.equal(await send({ message: "Hello", reply_to: "me@example.com" }), "/privacy?sent=1#contact");
});
