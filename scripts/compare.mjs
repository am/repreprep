// Refactor safety net: builds another version of the site (main by default) next to this one and
// compares them. Every built page's HTML is compared, then a set of pages, some after a click or with saved progress, is screenshotted
// in both (desktop and phone, dark and light) and compared pixel by pixel. Run with `npm run compare [git ref] [--no-scripts] [--no-styles] [--fonts]`.
// A refactor that keeps the site the same reports no differences. Differing screenshots are saved in
// .compare/shots (before, after and a diff image with the changed pixels in red).
import { execSync, spawn } from "node:child_process";
import {
  existsSync,
  lstatSync,
  unlinkSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { chromium } from "@playwright/test";

/* --no-scripts and --no-styles leave script tags, or style tags and stylesheet links, out of the HTML
   comparison, for changes that only move browser code or CSS (the screenshots still compare the result).
   --fonts lets the pages load fonts from Google Fonts, and waits for every font, for changes to how fonts are served */
const args = process.argv.slice(2),
  noScripts = args.includes("--no-scripts"),
  noStyles = args.includes("--no-styles"),
  fonts = args.includes("--fonts");
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];
const ref = args.find((a) => !a.startsWith("--")) || "origin/main";
const ROOT = new URL("..", import.meta.url).pathname;
const WORK = join(ROOT, ".compare"),
  BASE = join(WORK, "base"),
  SHOTS = join(WORK, "shots");
const sh = (cmd, cwd = ROOT) =>
  execSync(cmd, { cwd, stdio: ["ignore", "pipe", "inherit"] })
    .toString()
    .trim();

/* ---------- build both ---------- */
mkdirSync(WORK, { recursive: true });
rmSync(SHOTS, { recursive: true, force: true });
/* unlink the shared node_modules first, so removing the worktree can never reach into ours */
const dropBase = () => {
  try {
    if (lstatSync(join(BASE, "node_modules")).isSymbolicLink()) unlinkSync(join(BASE, "node_modules"));
  } catch {}
  if (existsSync(BASE)) sh(`git worktree remove --force "${BASE}"`);
};
dropBase();
sh("git worktree prune");
sh(`git worktree add --detach "${BASE}" ${ref}`);
const sameDeps =
  readFileSync(join(ROOT, "package-lock.json"), "utf8") === readFileSync(join(BASE, "package-lock.json"), "utf8");
if (sameDeps) symlinkSync(join(ROOT, "node_modules"), join(BASE, "node_modules"));
else sh("npm ci --no-audit --no-fund", BASE);
console.log(`Building ${ref} (${sh(`git rev-parse --short ${ref}`)}) and this checkout…`);
sh("npx astro build", BASE);
sh("npx astro build");

/* ---------- HTML of every page ---------- */
/* bundle hashes, comments in inline scripts, whitespace layout, self-closing tags, Astro's style-scope attributes and how a quote is written
   don't change what a visitor gets (the screenshots below catch any whitespace that shows); nor does the key order of a grid's JSON */
const unesc = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
const sortKeys = (v) =>
  Array.isArray(v)
    ? v.map(sortKeys)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, sortKeys(v[k])])
        )
      : v;
const normalize = (html) =>
  [
    [noScripts, /<script\b[\s\S]*?<\/script>/g],
    [noStyles, /<style\b[\s\S]*?<\/style>|<link rel="stylesheet"[^>]*>/g],
  ]
    .reduce((h, [on, re]) => (on ? h.replace(re, "") : h), html)
    .replace(/\/_astro\/([\w.-]+?)\.[\w-]{8}\.(css|js)/g, "/_astro/$1.$2")
    .replace(
      /(<script\b[^>]*>)([\s\S]*?)(<\/script>)/g,
      (m, a, js, b) =>
        a +
        js
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/^\s*\/\/.*$/gm, "")
          .replace(/\n\s*\n/g, "\n") +
        b
    )
    .replace(/<(area|br|hr|img|input|link|meta)\b([^>]*?)\s*\/>/g, "<$1$2>")
    .replace(/<([\w-]+)\b([^>]*?)\s*\/>/g, "<$1$2></$1>")
    .replace(/ data-astro-cid-\w+(="[^"]*")?/g, "")
    .replace(
      / data-spec="([^"]*)"/g,
      (m, j) =>
        ` data-spec="${JSON.stringify(sortKeys(JSON.parse(unesc(j))))
          .replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")}"`
    )
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .replace(/> </g, "><");
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
const before = pagesIn(join(BASE, "dist/client")),
  after = pagesIn(join(ROOT, "dist/client"));
const added = [...after.keys()].filter((p) => !before.has(p)),
  removed = [...before.keys()].filter((p) => !after.has(p));
const changed = [...after.keys()].filter((p) => before.has(p) && before.get(p) !== after.get(p));
function firstDiff(a, b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return `    before: …${a.slice(Math.max(0, i - 60), i + 80)}…\n    after:  …${b.slice(Math.max(0, i - 60), i + 80)}…`;
}
console.log(
  `\nHTML: ${after.size} pages, ${changed.length} changed, ${added.length} added, ${removed.length} removed.`
);
for (const p of added) console.log(`  + ${p}`);
for (const p of removed) console.log(`  - ${p}`);
for (const p of changed.slice(0, 15)) console.log(`  ~ ${p}\n${firstDiff(before.get(p), after.get(p))}`);
if (changed.length > 15) console.log(`  … and ${changed.length - 15} more`);

/* ---------- screenshots ---------- */
const PAGES = [
  "/",
  "/model-cycles",
  "/model-cycles/lessons/01",
  "/model-cycles/lessons/01/1",
  "/model-cycles/lessons/01/2",
  "/model-cycles/lessons/01/5",
  "/model-cycles/lessons/01/13",
  "/model-cycles/lessons/01/14",
  "/model-cycles/songs/looped/3",
  "/model-cycles/panel",
  "/model-cycles/panel/tempo",
  "/model-cycles/machines",
  "/model-cycles/shortcuts",
  "/account",
  "/privacy",
  "/model-cycles/nope",
];
/* pages in a state a visitor gets to by clicking: open menus, answered questions, saved progress */
const L1 = "/model-cycles/lessons/01";
const SEEDED = {
  updatedAt: 1,
  introSteps: 1,
  inst: {
    cycles: {
      lesson: "w02",
      steps: Object.fromEntries(
        [...Array(20).keys()]
          .map((i) => [`w01:${i}`, true])
          .concat([
            ["w02:0", true],
            ["w02:1", true],
          ])
      ),
      done: { w01: 1700000000000 },
      notes: { w01: "A note" },
      active: { w02: 2 },
    },
  },
};
const STATES = [
  { name: "picker-open", path: `${L1}/3`, run: (p) => p.click("summary.ttl") },
  {
    name: "quiz-answered",
    path: `${L1}/13`,
    run: async (p) => {
      await p.click('.opt[data-opt="0"]');
      await p.click('.opt[data-opt="1"]');
    },
  },
  { name: "full-window", path: `${L1}/4`, run: (p) => p.click("[data-max]") },
  { name: "control-info", path: `${L1}/4`, run: (p) => p.click('#player svg .c[data-id="play"]') },
  { name: "grid-edited", path: `${L1}/2`, run: (p) => p.click('.gp .cell[data-r="0"][data-i="2"]') },
  { name: "note-editing", path: `${L1}/1`, run: (p) => p.click("[data-note-edit]") },
  { name: "with-progress-map", path: "/model-cycles", seed: SEEDED },
  { name: "with-progress-lesson", path: `${L1}/3`, seed: SEEDED },
  { name: "phone-menu-open", path: "/model-cycles", phone: true, run: (p) => p.click("[data-menu]") },
  { name: "contact-sent", path: "/privacy?sent=1#contact" },
  { name: "contact-error", path: "/privacy?error=long#contact" },
];
const VIEWS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const serve = (port, dir) => spawn(process.execPath, [join(ROOT, "tests/serve.mjs"), port, dir], { stdio: "ignore" });
const servers = [serve(4401, join(BASE, "dist/client")), serve(4402, join(ROOT, "dist/client"))];
await new Promise((r) => setTimeout(r, 500));

const browser = await chromium.launch();
async function shoot(port, view, theme, path, state = {}) {
  const ctx = await browser.newContext({ ...VIEWS[view], colorScheme: theme, reducedMotion: "reduce" });
  if (state.seed)
    await ctx.addInitScript((s) => localStorage.setItem("repreprep-progress-v1", JSON.stringify(s)), state.seed);
  /* the same "random" logo every time, and no requests from outside (but Google's fonts with --fonts) */
  await ctx.addInitScript(() => {
    let s = 1;
    Math.random = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  });
  await ctx.route(/^https?:\/\//, (r) => {
    const h = new URL(r.request().url()).hostname;
    return h === "localhost" || (fonts && FONT_HOSTS.includes(h)) ? r.continue() : r.abort();
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:${port}${path}`, { waitUntil: "networkidle" });
  if (fonts)
    await page.evaluate(async () => {
      await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
      await document.fonts.ready;
    });
  if (state.run) {
    await state.run(page);
    await page.waitForTimeout(150);
  }
  const png = await page.screenshot({ fullPage: true, animations: "disabled" });
  await ctx.close();
  return png;
}
/* counts the pixels that differ and draws them in red over a faded copy of the new screenshot */
async function pixelDiff(a, b) {
  const page = await browser.newPage();
  const res = await page.evaluate(
    async ([a, b]) => {
      const load = (s) =>
        new Promise((ok) => {
          const i = new Image();
          i.onload = () => ok(i);
          i.src = "data:image/png;base64," + s;
        });
      const [A, B] = await Promise.all([load(a), load(b)]);
      const w = Math.max(A.width, B.width),
        h = Math.max(A.height, B.height);
      const data = (img) => {
        const c = new OffscreenCanvas(w, h),
          x = c.getContext("2d");
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, w, h).data;
      };
      const da = data(A),
        db = data(B),
        out = new OffscreenCanvas(w, h),
        ox = out.getContext("2d"),
        od = ox.createImageData(w, h);
      let n = 0;
      for (let i = 0; i < da.length; i += 4) {
        const diff =
          Math.abs(da[i] - db[i]) +
            Math.abs(da[i + 1] - db[i + 1]) +
            Math.abs(da[i + 2] - db[i + 2]) +
            Math.abs(da[i + 3] - db[i + 3]) >
          8;
        if (diff) {
          n++;
          od.data.set([255, 0, 0, 255], i);
        } else {
          const g = (db[i] + db[i + 1] + db[i + 2]) / 3;
          od.data.set([g, g, g, 60], i);
        }
      }
      ox.putImageData(od, 0, 0);
      const blob = await out.convertToBlob({ type: "image/png" });
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (const x of bytes) bin += String.fromCharCode(x);
      return { n, size: `${A.width}x${A.height} → ${B.width}x${B.height}`, png: btoa(bin) };
    },
    [a.toString("base64"), b.toString("base64")]
  );
  await page.close();
  return res;
}

let diffs = 0,
  shots = 0;
const JOBS = PAGES.map((path) => ({ path, name: path })).concat(
  STATES.map((st) => ({ ...st, name: `${st.path.split(/[?#]/)[0]} (${st.name})` }))
);
for (const view of Object.keys(VIEWS))
  for (const theme of ["dark", "light"])
    for (const job of JOBS) {
      if (job.phone && view !== "phone") continue;
      const { path } = job;
      const [a, b] = await Promise.all([shoot(4401, view, theme, path, job), shoot(4402, view, theme, path, job)]);
      shots++;
      if (a.equals(b)) continue;
      const d = await pixelDiff(a, b);
      if (!d.n && a.length && d.size.split(" → ")[0] === d.size.split(" → ")[1]) continue;
      diffs++;
      const name = `${view}-${theme}${job.name.replace(/[^\w-]+/g, "_")}`;
      mkdirSync(SHOTS, { recursive: true });
      writeFileSync(join(SHOTS, `${name}-before.png`), a);
      writeFileSync(join(SHOTS, `${name}-after.png`), b);
      writeFileSync(join(SHOTS, `${name}-diff.png`), Buffer.from(d.png, "base64"));
      console.log(`  ~ ${view} ${theme} ${job.name}: ${d.n} pixels differ (${d.size})`);
    }
await browser.close();
servers.forEach((s) => s.kill());
console.log(`Screenshots: ${shots} compared, ${diffs} differ${diffs ? ` (saved in ${relative(ROOT, SHOTS)})` : ""}.`);
dropBase();
process.exitCode = changed.length + added.length + removed.length + diffs ? 1 : 0;
