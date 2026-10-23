// Step ids: saved ticks are "<lesson id>:<step id>", so a step's id must never change, and an id a lesson
// has used must never come back on another step (it would inherit that step's old ticks). Contributors don't
// write ids: `npm run ids` gives every step without one a new id and keeps the register of every id ever used,
// src/content/step-ids.yaml. `npm run check` (and so CI) runs this with --check, which changes nothing and
// fails when a lesson and the register disagree, or when the register lost an id the main branch has.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { INSTRUMENTS } from "../src/course/index.js";
import { NUMBERED_STEPS } from "../src/course/shared/numbered-steps.js";

const ROOT = new URL("../", import.meta.url);
export const REGISTER = "src/content/step-ids.yaml";
const STOP = new Set(
  "a an the to and or of on in at with your you it its is are this that for then by as from so be can into".split(" ")
);

/* a readable id from a step's text: a few of its first words, without key caps or a short "Title:" lead */
export function slug(text, words = 4) {
  let t = String(text || "").replace(/\[[^\]]*\]/g, " ");
  const c = t.indexOf(":");
  if (c > 0 && c < 40) t = t.slice(0, c);
  const w = (t.toLowerCase().match(/[a-z0-9]+/g) || []).filter((x) => !STOP.has(x));
  return w.slice(0, words).join("-") || "step";
}
/* a new id for a step: its slug, numbered on when the lesson has ever used that id */
export function newId(text, taken) {
  const base = slug(text);
  let id = base;
  for (let k = 2; taken.has(id); k++) id = `${base}-${k}`;
  return id;
}

/* gives the steps without an id a new one, in the file's own text so its formatting stays as it is.
   Returns the new text and the ids in step order. */
export function fillIds(text, taken) {
  const steps = parse(text).steps || [];
  const ids = [];
  let i = 0,
    inSteps = false;
  const out = [];
  for (const ln of text.split("\n")) {
    if (/^steps:/.test(ln)) inSteps = true;
    else if (/^\S/.test(ln)) inSteps = false;
    if (inSteps && ln.startsWith("  - ")) {
      const st = steps[i++];
      if (st.id) ids.push(st.id);
      else {
        const id = newId(st.t || (st.q && st.q[0]), taken);
        taken.add(id);
        ids.push(id);
        out.push(`  - id: ${id}`, "    " + ln.slice(4));
        continue;
      }
    }
    out.push(ln);
  }
  return { text: out.join("\n"), ids };
}

/* the register after the lessons changed: new ids join "used", ids no lesson step has any more move to
   "retired", and nothing is ever dropped. A retired id found on a step stays retired (the check reports it). */
export function updateRegister(reg, lessonId, ids) {
  const r = (reg[lessonId] ||= { used: [], retired: [] });
  r.used ||= [];
  r.retired ||= [];
  ids.forEach((id) => !r.used.includes(id) && !r.retired.includes(id) && r.used.push(id));
  r.used.filter((id) => !ids.includes(id)).forEach((id) => r.retired.push(id));
  r.used = r.used.filter((id) => ids.includes(id));
  return reg;
}

/* what's wrong between the lessons, the register and the main branch's register; empty when all is well */
export function problems(lessons, reg, base = null, numbered = {}) {
  const out = [];
  for (const [lid, ids] of Object.entries(lessons)) {
    const r = reg[lid] || { used: [], retired: [] };
    const seen = new Set();
    ids.forEach((id, i) => {
      if (!id) out.push(`${lid}: step ${i + 1} has no id`);
      else if (seen.has(id)) out.push(`${lid}: two steps have the id ${id}`);
      else if ((r.retired || []).includes(id)) out.push(`${lid}: ${id} was used by a step that was taken out`);
      else if (!(r.used || []).includes(id)) out.push(`${lid}: ${id} is not in the register`);
      seen.add(id);
    });
    (r.used || []).filter((id) => !ids.includes(id)).forEach((id) => out.push(`${lid}: ${id} is gone from the lesson`));
  }
  const all = (x) => new Set([...(x.used || []), ...(x.retired || [])]);
  for (const [lid, b] of Object.entries(base || {}))
    [...all(b)]
      .filter((id) => !all(reg[lid] || {}).has(id))
      .forEach((id) => out.push(`${lid}: ${id} was dropped from the register`));
  for (const [lid, ids] of Object.entries(numbered))
    ids
      .filter((id) => id !== "intro" && !all(reg[lid] || {}).has(id))
      .forEach((id) => out.push(`${lid}: ${id} (numbered-steps.js) is missing from the register`));
  return out;
}

/* ---------- reading and writing the files ---------- */
const lessonFiles = () =>
  INSTRUMENTS.filter((I) => I.ready).flatMap((I) =>
    readdirSync(new URL(`src/content/lessons/${I.slug}/`, ROOT))
      .filter((f) => f.endsWith(".yaml"))
      .map((f) => ({ I, path: `src/content/lessons/${I.slug}/${f}` }))
  );
const read = (p) => readFileSync(new URL(p, ROOT), "utf8");
export const readRegister = (text) => {
  try {
    return parse(text ?? read(REGISTER)) || {};
  } catch (e) {
    if (e.code === "ENOENT") return {};
    throw e;
  }
};
/* the main branch's register, if git has it; null on a branch made before there was one */
function baseRegister() {
  const ref = process.env.STEP_IDS_BASE || "origin/main";
  try {
    return readRegister(execFileSync("git", ["show", `${ref}:${REGISTER}`], { stdio: ["ignore", "pipe", "ignore"] }));
  } catch (e) {
    try {
      execFileSync("git", ["rev-parse", "--verify", ref], { stdio: "ignore" });
      return null; /* the ref is there but has no register yet */
    } catch (e2) {
      if (process.env.CI) throw new Error(`step ids: can't read ${ref} to compare the register with`);
      return null;
    }
  }
}
const header = `# Every step id each lesson has ever used. Written by \`npm run ids\`, never by hand: saved progress is
# stored by step id, so an id stays in "used" while its step exists and moves to "retired" when the step is
# taken out, and no id is ever given out twice. See scripts/step-ids.mjs.
`;

function main() {
  const check = process.argv.includes("--check");
  const reg = readRegister();
  const lessons = {};
  let added = 0;
  for (const f of lessonFiles()) {
    const text = read(f.path);
    const id = parse(text).id;
    if (check) {
      lessons[id] = (parse(text).steps || []).map((s) => s.id);
      continue;
    }
    const r = reg[id] || { used: [], retired: [] };
    const filled = fillIds(text, new Set([...r.used, ...r.retired]));
    if (filled.text !== text) {
      writeFileSync(new URL(f.path, ROOT), filled.text);
      added += filled.ids.filter((x) => !r.used.includes(x)).length;
    }
    updateRegister(reg, id, filled.ids);
    lessons[id] = filled.ids;
  }
  const numbered = Object.assign({}, ...Object.values(NUMBERED_STEPS));
  if (!check) {
    const sorted = Object.fromEntries(
      Object.keys(reg)
        .sort()
        .map((k) => [k, reg[k]])
    );
    writeFileSync(new URL(REGISTER, ROOT), header + stringify(sorted, { lineWidth: 0 }));
    console.log(`Step ids: ${added} new.`);
  }
  const bad = problems(lessons, check ? reg : readRegister(), baseRegister(), numbered);
  if (bad.length) {
    console.error(`Step ids don't match ${REGISTER}:\n  ${bad.join("\n  ")}`);
    console.error("Run `npm run ids` to give new steps ids and update the register. Never edit an id by hand.");
    process.exit(1);
  }
  if (check) console.log(`Step ids OK: ${Object.values(lessons).flat().length} steps.`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
