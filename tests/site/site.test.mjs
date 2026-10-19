// The built site (dist/client, after `npm run build`): every page the course needs exists,
// every link on every page goes somewhere, and no page shows "undefined" or "NaN".
import { test } from "node:test";
import assert from "node:assert/strict";
import { stepPath } from "../../src/course/index.js";
import { COURSES } from "../../src/course/files.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pages, exists, ROOT } from "./built.mjs";

test("every lesson step, challenge and reference page is built", () => {
  const want = ["/", "/account", "/privacy", "/404"];
  for (const I of COURSES) {
    want.push(`/${I.slug}`, `/${I.slug}/panel`, `/${I.slug}/machines`, `/${I.slug}/shortcuts`);
    for (const id of Object.keys(I.controls)) want.push(`/${I.slug}/panel/${id}`);
    for (const L of I.lessons)
      for (let i = 0; i < L.steps.length + (L.challenge ? 1 : 0); i++) want.push(stepPath(L, i));
  }
  const missing = want.filter((p) => !pages.has(p));
  assert.deepEqual(missing, []);
  assert.equal(
    pages.size,
    want.length,
    `unexpected pages: ${[...pages.keys()].filter((p) => !want.includes(p)).join(", ")}`
  );
});

test("every link inside the site leads to a page or file", () => {
  const broken = [];
  for (const [page, html] of pages) {
    for (const [, href] of html.matchAll(/\shref="([^"]*)"/g)) {
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const path = href.split(/[?#]/)[0];
      if (/^\/(api|auth)\//.test(path)) continue; /* run on the server */
      if (!exists(path)) broken.push(`${page} -> ${href}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("every page has a title, a description and no leftover undefined/NaN", () => {
  for (const [page, html] of pages) {
    assert.match(html, /<title>[^<]+<\/title>/, page);
    assert.match(html, /<meta name="description" content="[^"]+"/, page);
    const text = html.replace(/<script[\s\S]*?<\/script>/g, "");
    assert.doesNotMatch(text, /\bundefined\b|\bNaN\b|\[object Object\]/, page);
  }
});

test("lesson pages carry what the browser script needs", () => {
  const html = pages.get("/model-cycles/lessons/05/3");
  assert.match(html, /<body data-inst="cycles" data-sizes="\{[^"]*w05[^"]*\}"/);
  assert.match(html, /<section class="player" id="player"[^>]*data-lesson="w05" data-step="3"/);
  assert.match(html, /data-notebox="w05"/);
  assert.match(html, /<span[^>]*id="sync"/);
});

test("the home screen icons named in the manifest are all there", () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
  const missing = manifest.icons.map((i) => i.src).filter((src) => !exists(src));
  assert.deepEqual(missing, []);
  assert.ok(exists("/apple-touch-icon.png"));
});
