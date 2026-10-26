// Build a project from a JSON description. See README.md for the format.
import { readFileSync } from "node:fs";
import { MACHINES, Project, patternIndex } from "./project.mjs";
import { validate } from "./schema.mjs";

export const TEMPLATE = new URL("../template/empty.mcprj", import.meta.url);

/** The bundled empty project: every pattern and kit as the unit leaves them. */
export const emptyProject = () => Project.parse(readFileSync(TEMPLATE));

/**
 * Apply `spec` to a copy of `base` (the empty project when left out). Every
 * pattern the spec names is cleared first, so it holds only what the spec says.
 * Throws, listing every problem, when the spec doesn't fit spec.schema.json.
 */
export function build(spec, base = emptyProject()) {
  const problems = validate(spec);
  if (problems.length) throw new Error(`the spec doesn't fit spec.schema.json:\n  ${problems.join("\n  ")}`);
  const project = Project.parse(base.toBytes());
  const clean = emptyProject();
  if (spec.name) project.name = spec.name;
  if (spec.tempo) project.tempo = spec.tempo;
  if (spec.muted) project.muted = spec.muted;
  const names = Object.keys(spec.patterns ?? {});
  project.activePattern = spec.activePattern ?? names[0] ?? project.activePattern;
  for (const name of names) buildPattern(project, clean, name, spec.patterns[name], spec.tempo);
  return project;
}

function buildPattern(project, clean, name, spec, projectTempo) {
  const index = patternIndex(name);
  project.clearPattern(index, clean);
  const pattern = project.pattern(index);
  const at = (what, fn) => {
    try {
      fn();
    } catch (e) {
      throw new Error(`${name} ${what}: ${e.message}`);
    }
  };
  if (spec.title) at("title", () => (pattern.title = spec.title));
  if (spec.tempo ?? projectTempo) pattern.tempo = spec.tempo ?? projectTempo;
  if (spec.speed) at("speed", () => (pattern.speed = spec.speed));
  const tracks = spec.tracks ?? {};
  const longest = Math.max(0, ...Object.values(tracks).map((t) => stepString(t.steps).length));
  pattern.length = spec.length ?? (longest > 16 ? longest : 16);
  for (const [k, v] of Object.entries(spec.fx ?? {})) at("fx", () => pattern.kit.setFx(k, v));
  for (const [t, track] of Object.entries(tracks)) at(`T${t}`, () => buildTrack(pattern, clean, Number(t), track));
}

function buildTrack(pattern, clean, t, spec) {
  if (!(t >= 1 && t <= 6)) throw new Error("tracks are 1 to 6");
  const track = pattern.tracks[t - 1];
  const sound = pattern.kit.sounds[t - 1];
  if (spec.machine) {
    // start from the factory sound of that machine, as the unit does
    const m = MACHINES.indexOf(spec.machine);
    if (m < 0) throw new Error(`unknown machine ${spec.machine}; known: ${MACHINES.join(", ")}`);
    const factory = clean.pattern(0).kit.sounds[m];
    for (let w = 0; w < 32; w++) sound.setWord(w, factory.word(w));
  }
  for (const [k, v] of Object.entries(spec.params ?? {})) sound.setParam(k, v);
  if (spec.vdep != null) sound.vdep = spec.vdep;
  if (spec.level != null) pattern.kit.setLevel(t, spec.level);
  if (spec.swing != null) track.swing = spec.swing - 50;
  if (spec.length != null) track.stepCount = spec.length;
  [...stepString(spec.steps)].forEach((c, s) => c !== "." && track.setTrig(s));
  for (const [step, trig] of Object.entries(spec.trigs ?? {})) {
    const s = Number(step) - 1;
    if (!(s >= 0 && s < 64)) throw new Error(`step ${step} is outside 1 to 64`);
    if (trig.trig !== false) track.setTrig(s);
    if (trig.note != null) track.setNote(s, trig.note);
    if (trig.velocity != null) track.setVelocity(s, trig.velocity);
    if (trig.length != null) track.setLength(s, trig.length);
    if (trig.micro != null) track.setMicro(s, trig.micro);
    if (trig.condition != null) track.setCondition(s, trig.condition);
    if (trig.retrig) track.setRetrig(s, trig.retrig === true ? {} : trig.retrig);
    for (const [param, value] of Object.entries(trig.locks ?? {})) pattern.setLock(t, param, s + 1, value);
  }
}

/** "x...x...|x...x..." -> one character per step; spaces and bars are only for reading */
function stepString(steps = "") {
  const s = steps.replace(/[\s|]/g, "");
  if (s.length > 64) throw new Error("a track has at most 64 steps");
  return s;
}
