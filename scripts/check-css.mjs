// Each component's base style lives in one place. A class like `.intro` styled in two separate
// top-level rules means two components share a name and one silently changes the other.
// Media queries and compound selectors (`.a .b`, `.a.on`) are fine. Run with `npm run check`.
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/app.css", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const seen = new Map();
let depth = 0,
  sel = "";
for (const ch of css) {
  if (ch === "{") {
    const s = sel.trim();
    if (depth === 0 && !s.startsWith("@"))
      for (const one of s.split(",").map((x) => x.trim()))
        if (/^\.[\w-]+$/.test(one)) seen.set(one, (seen.get(one) || 0) + 1);
    depth++;
    sel = "";
  } else if (ch === "}") {
    depth--;
    sel = "";
  } else if (depth === 0) sel = ch === ";" ? "" : sel + ch;
}
const dup = [...seen].filter(([, n]) => n > 1).map(([s]) => s);
if (dup.length)
  throw new Error(`Styled in more than one top-level rule (merge them, or rename one component): ${dup.join(", ")}`);
console.log(`CSS OK: ${seen.size} component classes, each styled once.`);
