// What search engines and link previews read from the built site: each page's canonical address, which
// pages stay out of search results, the sitemap and robots.txt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pages, ROOT } from "./built.mjs";

const SITE = "https://repreprep.studio";
const canonical = (html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
const noindex = (html) => /<meta name="robots" content="noindex"/.test(html);
/* each instrument's first control: Model:Cycles LEVEL/DATA, MicroFreak Matrix */
const FIRST = /\/panel\/(level|matrix)$/;
const isStep = (path) => /\/(lessons|songs)\/[^/]+\/\d+$/.test(path);

test("every page names its own served address as canonical, never a .html file", () => {
  const wrong = [];
  for (const [path, html] of pages) {
    // the panel guide's first control is the same page as the panel guide itself
    const want = SITE + (FIRST.test(path) ? path.replace(/\/[^/]+$/, "") : path);
    if (canonical(html) !== want) wrong.push(`${path}: ${canonical(html)}`);
  }
  assert.deepEqual(wrong, []);
});

test("lesson steps, the progress page and the 404 stay out of search results; everything else is listed", () => {
  const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
  const listed = new Set([...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].slice(SITE.length)));
  for (const [path, html] of pages) {
    const hidden = isStep(path) || path === "/account" || path === "/404";
    assert.equal(noindex(html), hidden, `${path} noindex`);
    if (FIRST.test(path)) continue;
    assert.equal(listed.has(path), !hidden, `${path} in the sitemap`);
  }
  assert.equal(
    listed.size,
    [...pages.keys()].filter((p) => !isStep(p) && !/^\/(account|404)$/.test(p) && !FIRST.test(p)).length
  );
});

test("robots.txt points at the sitemap, and every page has a link preview image", () => {
  assert.match(readFileSync(join(ROOT, "robots.txt"), "utf8"), /^Sitemap: https:\/\/repreprep\.studio\/sitemap\.xml$/m);
  for (const [path, html] of pages)
    assert.match(html, /<meta property="og:image" content="https:\/\/repreprep\.studio\/og-image\.png"/, path);
});
