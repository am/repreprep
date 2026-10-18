// Refactor safety net: builds another version of the site (main by default) next to this one and
// compares them. Every built page's HTML is compared, then a set of pages is screenshotted in both
// (desktop and phone, dark and light) and compared pixel by pixel. Run with `npm run compare [git ref]`.
// A refactor that keeps the site the same reports no differences. Differing screenshots are saved in
// .compare/shots (before, after and a diff image with the changed pixels in red).
import { execSync, spawn } from "node:child_process";
import { existsSync, lstatSync, unlinkSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "@playwright/test";

const ref = process.argv[2] || "origin/main";
const ROOT = new URL("..", import.meta.url).pathname;
const WORK = join(ROOT, ".compare"), BASE = join(WORK, "base"), SHOTS = join(WORK, "shots");
const sh = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();

/* ---------- build both ---------- */
mkdirSync(WORK, { recursive: true });
rmSync(SHOTS, { recursive: true, force: true });
/* unlink the shared node_modules first, so removing the worktree can never reach into ours */
const dropBase = () => { try { if (lstatSync(join(BASE, "node_modules")).isSymbolicLink()) unlinkSync(join(BASE, "node_modules")); } catch {} if (existsSync(BASE)) sh(`git worktree remove --force "${BASE}"`); };
dropBase();
sh("git worktree prune");
sh(`git worktree add --detach "${BASE}" ${ref}`);
const sameDeps = readFileSync(join(ROOT, "package-lock.json"), "utf8") === readFileSync(join(BASE, "package-lock.json"), "utf8");
if (sameDeps) symlinkSync(join(ROOT, "node_modules"), join(BASE, "node_modules"));
else sh("npm ci --no-audit --no-fund", BASE);
console.log(`Building ${ref} (${sh(`git rev-parse --short ${ref}`)}) and this checkout…`);
sh("npx astro build", BASE);
sh("npx astro build");

/* ---------- HTML of every page ---------- */
/* bundle hashes and comments in inline scripts don't change what a visitor gets */
const normalize = (html) => html
  .replace(/\/_astro\/([\w-]+?)\.[\w-]{8}\.(css|js)/g, "/_astro/$1.$2")
  .replace(/(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g, (m, a, js, b) => a + js.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/\n\s*\n/g, "\n") + b);
const pagesIn = (dir) => {
  const out = new Map();
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".html")) out.set(relative(dir, p), normalize(readFileSync(p, "utf8")));
    }
  })(dir);
  return out;
};
const before = pagesIn(join(BASE, "dist/client")), after = pagesIn(join(ROOT, "dist/client"));
const added = [...after.keys()].filter((p) => !before.has(p)), removed = [...before.keys()].filter((p) => !after.has(p));
const changed = [...after.keys()].filter((p) => before.has(p) && before.get(p) !== after.get(p));
function firstDiff(a, b) {
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  return `    before: …${a.slice(Math.max(0, i - 60), i + 80)}…\n    after:  …${b.slice(Math.max(0, i - 60), i + 80)}…`;
}
console.log(`\nHTML: ${after.size} pages, ${changed.length} changed, ${added.length} added, ${removed.length} removed.`);
for (const p of added) console.log(`  + ${p}`);
for (const p of removed) console.log(`  - ${p}`);
for (const p of changed.slice(0, 15)) console.log(`  ~ ${p}\n${firstDiff(before.get(p), after.get(p))}`);
if (changed.length > 15) console.log(`  … and ${changed.length - 15} more`);

/* ---------- screenshots ---------- */
const PAGES = ["/", "/model-cycles", "/model-cycles/lessons/01", "/model-cycles/lessons/01/1", "/model-cycles/lessons/01/2", "/model-cycles/lessons/01/5",
  "/model-cycles/lessons/01/13", "/model-cycles/lessons/01/14", "/model-cycles/songs/looped/3", "/model-cycles/panel", "/model-cycles/panel/tempo",
  "/model-cycles/machines", "/model-cycles/shortcuts", "/account", "/privacy", "/model-cycles/nope"];
const VIEWS = { desktop: { viewport: { width: 1440, height: 900 } }, phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const serve = (port, dir) => spawn(process.execPath, [join(ROOT, "tests/serve.mjs"), port, dir], { stdio: "ignore" });
const servers = [serve(4401, join(BASE, "dist/client")), serve(4402, join(ROOT, "dist/client"))];
await new Promise((r) => setTimeout(r, 500));

const browser = await chromium.launch();
async function shoot(port, view, theme, path) {
  const ctx = await browser.newContext({ ...VIEWS[view], colorScheme: theme, reducedMotion: "reduce" });
  /* the same "random" logo every time, and no fonts or other requests from outside */
  await ctx.addInitScript(() => { let s = 1; Math.random = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; });
  await ctx.route(/^https?:\/\//, (r) => (new URL(r.request().url()).hostname === "localhost" ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: "networkidle" });
  const png = await page.screenshot({ fullPage: true, animations: "disabled" });
  await ctx.close();
  return png;
}
/* counts the pixels that differ and draws them in red over a faded copy of the new screenshot */
async function pixelDiff(a, b) {
  const page = await browser.newPage();
  const res = await page.evaluate(async ([a, b]) => {
    const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = "data:image/png;base64," + s; });
    const [A, B] = await Promise.all([load(a), load(b)]);
    const w = Math.max(A.width, B.width), h = Math.max(A.height, B.height);
    const data = (img) => { const c = new OffscreenCanvas(w, h), x = c.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, w, h).data; };
    const da = data(A), db = data(B), out = new OffscreenCanvas(w, h), ox = out.getContext("2d"), od = ox.createImageData(w, h);
    let n = 0;
    for (let i = 0; i < da.length; i += 4) {
      const diff = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) + Math.abs(da[i + 3] - db[i + 3]) > 8;
      if (diff) { n++; od.data.set([255, 0, 0, 255], i); } else { const g = (db[i] + db[i + 1] + db[i + 2]) / 3; od.data.set([g, g, g, 60], i); }
    }
    ox.putImageData(od, 0, 0);
    const blob = await out.convertToBlob({ type: "image/png" });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let bin = ""; for (const x of bytes) bin += String.fromCharCode(x);
    return { n, size: `${A.width}x${A.height} → ${B.width}x${B.height}`, png: btoa(bin) };
  }, [a.toString("base64"), b.toString("base64")]);
  await page.close();
  return res;
}

let diffs = 0, shots = 0;
for (const view of Object.keys(VIEWS)) for (const theme of ["dark", "light"]) for (const path of PAGES) {
  const [a, b] = await Promise.all([shoot(4401, view, theme, path), shoot(4402, view, theme, path)]);
  shots++;
  if (a.equals(b)) continue;
  const d = await pixelDiff(a, b);
  if (!d.n && a.length && d.size.split(" → ")[0] === d.size.split(" → ")[1]) continue;
  diffs++;
  const name = `${view}-${theme}${path.replace(/\//g, "_") || "_home"}`;
  mkdirSync(SHOTS, { recursive: true });
  writeFileSync(join(SHOTS, `${name}-before.png`), a);
  writeFileSync(join(SHOTS, `${name}-after.png`), b);
  writeFileSync(join(SHOTS, `${name}-diff.png`), Buffer.from(d.png, "base64"));
  console.log(`  ~ ${view} ${theme} ${path}: ${d.n} pixels differ (${d.size})`);
}
await browser.close();
servers.forEach((s) => s.kill());
console.log(`Screenshots: ${shots} compared, ${diffs} differ${diffs ? ` (saved in ${relative(ROOT, SHOTS)})` : ""}.`);
dropBase();
process.exitCode = changed.length + added.length + removed.length + diffs ? 1 : 0;
