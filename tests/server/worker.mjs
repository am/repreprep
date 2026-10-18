// Runs a built site in Cloudflare's local runtime (wrangler dev): the server routes (/api, /auth) with a
// fresh, empty local D1 database, so the tests can sign in, save progress and send messages. The site sees the
// address it is called on (localhost), not the production domain wrangler would otherwise pass along.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function startWorker({ dist = "dist", port, vars = {} }) {
  const persist = mkdtempSync(join(tmpdir(), "rrr-worker-"));
  const args = ["wrangler", "dev", "--config", `${dist}/server/wrangler.json`, "--port", String(port), "--ip", "127.0.0.1",
    "--local", "--local-upstream", `localhost:${port}`, "--persist-to", persist, "--show-interactive-dev-session=false",
    ...Object.entries(vars).flatMap(([k, v]) => ["--var", `${k}:${v}`])];
  const proc = spawn("npx", args, { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, WRANGLER_SEND_METRICS: "false" }, detached: true });
  let log = "";
  await new Promise((ok, fail) => {
    const timer = setTimeout(() => fail(new Error(`wrangler dev did not start:\n${log}`)), 60000);
    const read = (d) => { log += d; if (/Ready on/.test(log)) { clearTimeout(timer); ok(); } };
    proc.stdout.on("data", read);
    proc.stderr.on("data", read);
    proc.on("exit", (code) => { clearTimeout(timer); fail(new Error(`wrangler dev exited (${code}):\n${log}`)); });
  });
  const origin = `http://localhost:${port}`;
  return {
    origin,
    log: () => log,
    stop() { try { process.kill(-proc.pid); } catch {} rmSync(persist, { recursive: true, force: true }); },
  };
}

/* a browser-like client: keeps cookies, never follows redirects, and sends this site's Origin on writes
   unless told otherwise ({ origin: null } leaves it out, a string sends that one) */
export function client(origin) {
  const jar = new Map();
  async function req(path, { method = "GET", body, json, origin: o = origin, headers = {} } = {}) {
    const h = { ...headers };
    if (method !== "GET" && o) h.Origin = o;
    if (jar.size) h.Cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
    if (json !== undefined) { h["Content-Type"] = "application/json"; body = JSON.stringify(json); }
    const r = await fetch(origin + path, { method, body, headers: h, redirect: "manual" });
    for (const c of r.headers.getSetCookie()) {
      const [kv, ...attrs] = c.split(";"), [k, v] = kv.split("=");
      if (/max-age=0\b|expires=thu, 01 jan 1970/i.test(attrs.join(";")) || v === "") jar.delete(k.trim()); else jar.set(k.trim(), v);
    }
    return r;
  }
  return { req, jar, form: (fields) => { const f = new FormData(); for (const [k, v] of Object.entries(fields)) f.set(k, v); return f; } };
}
