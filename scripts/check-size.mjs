// Keeps components small enough to read (see Code conventions in CONTRIBUTING.md): an .astro file over
// MAX_LINES, or a <script> in it over MAX_SCRIPT lines, fails `npm run check`. Split the component, or move
// the script into src/client.
import { readFileSync, readdirSync } from "node:fs";

const MAX_LINES = 400,
  MAX_SCRIPT = 100;
/* files still waiting to be split: remove each one once it is */
const PENDING = new Set(["src/components/site/AccountPage.astro"]);

const files = readdirSync("src", { recursive: true })
  .filter((f) => f.endsWith(".astro"))
  .map((f) => `src/${f}`);
const problems = [];
for (const f of files) {
  if (PENDING.has(f)) continue;
  const text = readFileSync(f, "utf8");
  const lines = text.split("\n").length;
  if (lines > MAX_LINES) problems.push(`${f}: ${lines} lines (most ${MAX_LINES})`);
  for (const [, js] of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    const n = js.trim().split("\n").length;
    if (n > MAX_SCRIPT) problems.push(`${f}: a ${n}-line script (most ${MAX_SCRIPT}, move it to src/client)`);
  }
}
if (problems.length) throw new Error(`Too big:\n${problems.join("\n")}`);
console.log(`Sizes OK: ${files.length} components.`);
