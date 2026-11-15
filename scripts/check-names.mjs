// Names written out in full (see Code conventions in CONTRIBUTING.md). Older short names stay until someone
// changes that code, so this only looks at lines added or changed since main: a name there shorter than
// MIN_LENGTH letters fails `npm run lint`, unless it is a real word or a usual short name (EXCEPTIONS).
// Object keys are skipped, since lessons and outside APIs name those.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const BASE = process.env.NAMES_BASE ?? "origin/main";
const MIN_LENGTH = 3;
const EXCEPTIONS = ["_", "i", "j", "x", "y", "id", "ok", "on", "to", "at", "up", "go", "db"];
const LINTED = /\.(js|mjs|ts|astro)$/;

/** Line numbers added or changed in one file, from `git diff -U0` output. */
export function changedLines(diff) {
  const lines = new Set();
  for (const [, start, count] of diff.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    for (let line = Number(start); line < Number(start) + Number(count ?? 1); line++) lines.add(line);
  }
  return lines;
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

async function main() {
  try {
    git("rev-parse", "--verify", "--quiet", BASE);
  } catch {
    console.log(`Names: skipped, ${BASE} not found (run git fetch origin main).`);
    return;
  }
  const changed = git("diff", "--name-only", "--diff-filter=AM", BASE).split("\n");
  const untracked = git("ls-files", "--others", "--exclude-standard").split("\n");
  const eslint = new ESLint({
    overrideConfig: [
      { rules: { "id-length": ["error", { min: MIN_LENGTH, properties: "never", exceptions: EXCEPTIONS }] } },
    ],
  });
  const files = [];
  for (const file of [...changed, ...untracked]) {
    if (LINTED.test(file) && !(await eslint.isPathIgnored(file))) files.push(file);
  }
  const problems = new Set();
  for (const result of await eslint.lintFiles(files)) {
    const file = result.filePath.slice(process.cwd().length + 1);
    const lines = untracked.includes(file)
      ? new Set(
          readFileSync(file, "utf8")
            .split("\n")
            .map((_, index) => index + 1)
        )
      : changedLines(git("diff", "-U0", BASE, "--", file));
    for (const message of result.messages) {
      if (message.ruleId !== "id-length" || !lines.has(message.line)) continue;
      const name = message.message.match(/'(.+?)'/)?.[1];
      problems.add(`${file}:${message.line}  "${name}": write the name out in full`);
    }
  }
  if (problems.size) {
    console.error(`Short names on changed lines (CONTRIBUTING.md, Names):\n${[...problems].join("\n")}`);
    process.exit(1);
  }
  console.log(`Names OK: ${files.length} changed files.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
