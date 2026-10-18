// The built site (dist/client, after `npm run build`), read once: every page's HTML by its address.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

export const ROOT = new URL("../../dist/client/", import.meta.url).pathname;
if (!existsSync(ROOT)) throw new Error("Build the site first: npm run build");

export const pages = new Map();
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.set("/" + relative(ROOT, p).replace(/(index)?\.html$/, "").replace(/\/$/, ""), readFileSync(p, "utf8"));
  }
})(ROOT);
export const page = (path) => { const html = pages.get(path); if (html === undefined) throw new Error(`No page at ${path}`); return html; };
export const exists = (path) => pages.has(path.replace(/\/$/, "") || "/") || existsSync(join(ROOT, path));
