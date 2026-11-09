/* After the build, tell the browser early about the files every page needs, so it asks for them right after
   the HTML instead of one after another. On a slow connection each "one after another" step costs a full
   round trip (on 3G about 2 seconds).
   - Scripts: a page's scripts import other script files, which import more, and the browser only finds the
     next file once the one before has arrived. Every file they import gets a <link rel="modulepreload">,
     and with sign-in on also every file loaded with import("…"): the only one is the account calls
     (astro:actions), which progress.js then loads on every page to check who is logged in.
   - Fonts: the browser only asks for a font once a styled page shows text in it. The Latin files of the
     fonts in FONTS (the ones at the top of every page) get a <link rel="preload">. Astro's own font preload
     can't pick the Latin file of a local font, so it is done here from the page's @font-face rules. */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/* family, style, weight as written in the @font-face rule (see `fonts` in astro.config.mjs) */
const FONTS = [
  ["Manrope", "normal", "200 800"],
  ["Rasa", "normal", "300 700"],
  ["IBM Plex Mono", "normal", "500"],
  ["IBM Plex Mono", "normal", "700"],
];
const LATIN = "U+0000-00FF";
const STATIC = /(?:^|[^\w$.])(?:import|export)\s*(?:[\w*{}\s,$]+from\s*)?["'`](\.{1,2}\/[^"'`]+\.js)["'`]/g;
const DYNAMIC = /(?:^|[^\w$.])import\(\s*["'`](\.{1,2}\/[^"'`]+\.js)["'`]\s*\)/g;

/* the Latin font files to preload, from the page's @font-face rules */
export function fontPreloads(html) {
  const urls = [];
  for (const [, face] of html.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const get = (prop) => face.match(new RegExp(`${prop}:\\s*([^;]+)`))?.[1].trim();
    const family = get("font-family")?.replace(/^["']|["']$/g, "");
    const url = face.match(/url\(["']?(\/[^"')]+\.woff2)["']?\)/)?.[1];
    if (!url || !get("unicode-range")?.startsWith(LATIN)) continue;
    const want = FONTS.some(
      ([f, style, weight]) =>
        family?.startsWith(f + "-") && get("font-style") === style && get("font-weight") === weight
    );
    if (want && !urls.includes(url)) urls.push(url);
  }
  return urls;
}

export default function preload({ dynamic = false } = {}) {
  return {
    name: "repreprep:preload",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const deps = new Map();
        // every file a script imports, and what those import, as /_astro/… addresses
        const walk = (url, out) => {
          if (!deps.has(url)) {
            const code = readFileSync(join(root, url), "utf8");
            const base = url.slice(0, url.lastIndexOf("/") + 1);
            deps.set(
              url,
              [...code.matchAll(STATIC), ...(dynamic ? code.matchAll(DYNAMIC) : [])].map(
                (m) => new URL(m[1], "http://x" + base).pathname
              )
            );
          }
          for (const d of deps.get(url))
            if (!out.has(d)) {
              out.add(d);
              walk(d, out);
            }
          return out;
        };
        let count = 0;
        (function pages(d) {
          for (const e of readdirSync(d, { withFileTypes: true })) {
            const p = join(d, e.name);
            if (e.isDirectory()) pages(p);
            else if (e.name.endsWith(".html")) {
              const html = readFileSync(p, "utf8");
              if (!html.includes("</head>")) continue;
              const entries = [...html.matchAll(/<script type="module" src="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]);
              const scripts = new Set();
              for (const s of entries) walk(s, scripts);
              for (const s of entries) scripts.delete(s);
              const links =
                fontPreloads(html)
                  .map((u) => `<link rel="preload" href="${u}" as="font" type="font/woff2" crossorigin>`)
                  .join("") + [...scripts].map((u) => `<link rel="modulepreload" href="${u}">`).join("");
              if (!links) continue;
              writeFileSync(p, html.replace("</head>", links + "</head>"));
              count++;
            }
          }
        })(root);
        logger.info(`fonts and script imports preloaded on ${count} pages`);
      },
    },
  };
}
