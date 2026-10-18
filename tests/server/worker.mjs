// Runs a built site in Cloudflare's local runtime (wrangler dev): the server routes (/api, /auth) with a
// fresh, empty local D1 database, so the tests can sign in, save progress and send messages. The site sees the
// address it is called on (localhost), not the production domain wrangler would otherwise pass along.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse } from "devalue";

/* own: run wrangler in its own process group, so stop() also ends the runtime it starts; serve.mjs leaves it
   in Playwright's group instead, which Playwright ends as a whole */
export async function startWorker({ dist = "dist", port, vars = {}, own = true }) {
  const persist = mkdtempSync(join(tmpdir(), "rrr-worker-"));
  const args = [
    "wrangler",
    "dev",
    "--config",
    `${dist}/server/wrangler.json`,
    "--port",
    String(port),
    "--ip",
    "127.0.0.1",
    "--local",
    "--local-upstream",
    `localhost:${port}`,
    "--persist-to",
    persist,
    "--show-interactive-dev-session=false",
    ...Object.entries(vars).flatMap(([k, v]) => ["--var", `${k}:${v}`]),
  ];
  const proc = spawn("npx", args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    detached: own,
  });
  let log = "";
  await new Promise((ok, fail) => {
    const timer = setTimeout(() => fail(new Error(`wrangler dev did not start:\n${log}`)), 60000);
    const read = (d) => {
      log += d;
      if (/Ready on/.test(log)) {
        clearTimeout(timer);
        ok();
      }
    };
    proc.stdout.on("data", read);
    proc.stderr.on("data", read);
    proc.on("exit", (code) => {
      clearTimeout(timer);
      fail(new Error(`wrangler dev exited (${code}):\n${log}`));
    });
  });
  const origin = `http://localhost:${port}`;
  return {
    origin,
    log: () => log,
    stop() {
      try {
        own ? process.kill(-proc.pid) : proc.kill();
      } catch {}
      rmSync(persist, { recursive: true, force: true });
    },
  };
}

/* a browser-like client: keeps cookies, never follows redirects, and sends this site's Origin on writes
   unless told otherwise ({ origin: null } leaves it out, a string sends that one) */
export function client(origin) {
  const jar = new Map();
  async function req(path, { method = "GET", body, json, origin: o = origin, headers = {} } = {}) {
    const h = { ...headers };
    if (method !== "GET" && o) h.Origin = o;
    /* a fresh connection for every request: the local runtime drops a connection when a route refuses a
       form without reading it, which would otherwise fail the next request sent on it */
    h.Connection = "close";
    if (jar.size) h.Cookie = [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
    if (json !== undefined) {
      h["Content-Type"] = "application/json";
      body = JSON.stringify(json);
    }
    const r = await fetch(origin + path, { method, body, headers: h, redirect: "manual" });
    for (const c of r.headers.getSetCookie()) {
      const [kv, ...attrs] = c.split(";"),
        [k, v] = kv.split("=");
      if (/max-age=0\b|expires=thu, 01 jan 1970/i.test(attrs.join(";")) || v === "") jar.delete(k.trim());
      else jar.set(k.trim(), v);
    }
    return r;
  }
  /* an Astro Action (src/actions), called the way astro:actions does: its result comes back as devalue */
  async function action(name, input, opts = {}) {
    const r = await req(`/_actions/${name}`, {
      method: "POST",
      ...(input === undefined ? { headers: { "Content-Length": "0" } } : { json: input }),
      ...opts,
    });
    const text = await r.text();
    return {
      status: r.status,
      data: r.ok && text ? parse(text) : undefined,
      error: r.ok ? undefined : JSON.parse(text || "null"),
    };
  }
  return {
    req,
    action,
    jar,
    form: (fields) => {
      const f = new FormData();
      for (const [k, v] of Object.entries(fields)) f.set(k, v);
      return f;
    },
  };
}
