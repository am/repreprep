// The Model:Cycles lesson projects (src/course/model-cycles/projects.js): each one builds, starts where the
// last lesson ended, and holds the trigs its lesson's Get ready map shows.
import { test } from "node:test";
import assert from "node:assert/strict";
import { build, validate } from "../../tools/mcprj/src/index.mjs";
import { lessonProjects, lessonFiles, projectFile } from "../../src/course/model-cycles/projects.js";
import { COURSES } from "../../src/course/files.js";

const files = lessonProjects();
const cycles = COURSES.find((I) => I.key === "cycles");
const lessons = cycles.lessons.filter((L) => L.number);

test("every lesson project fits the build schema and has a name the unit takes", () => {
  for (const { file, name, spec } of files) {
    assert.deepEqual(validate(spec), [], file);
    assert.ok(name.length <= 15, `${name} is longer than 15 characters`);
  }
});

test("a lesson starts from the project the lesson before it finished", () => {
  for (const { lesson, kind, spec } of files) {
    if (kind !== "start") continue;
    const before = files.find((f) => f.lesson === lesson - 1 && f.kind === "done");
    const strip = ({ name, activePattern, ...rest }) => rest;
    assert.deepEqual(strip(spec), strip(before.spec), `lesson ${lesson}`);
  }
});

test("every lesson after the first offers a start, and the lessons that change the project a finished one", () => {
  for (const L of lessons) {
    const offered = lessonFiles(L.number);
    assert.equal(offered.start, L.number > 1 ? projectFile(L.number, "start") : undefined);
    assert.equal(Boolean(offered.done), L.number < 16, `lesson ${L.number}`);
  }
  assert.deepEqual(lessonFiles(undefined), {});
});

/* the map's velocity (0-1, 0.85 for a plain trig) for a trig's VEL (empty = the default 100) */
const mapVelocity = (vel) => (vel == null ? 0.85 : vel / 127);

test("each start project holds the trigs, velocities, conditions and track lengths its Get ready map shows", () => {
  for (const L of lessons) {
    const ready = L.steps.find((s) => s.k === "ready");
    if (!ready) continue;
    const start = files.find((f) => f.lesson === L.number && f.kind === "start");
    assert.ok(start, `lesson ${L.number} has a Get ready step but no start project`);
    const project = build(start.spec);
    const map = ready.fig.pattern;
    // a list of patterns shows each one's first page; otherwise one pattern, bar by bar
    const views = map.slots
      ? map.slots.map((s) => ({ slot: s.slot, bars: [s.rows] }))
      : [{ slot: map.slot, bars: map.bars ?? [map.rows] }];
    for (const { slot, bars } of views) {
      const p = project.pattern(slot);
      bars.forEach((rows, b) =>
        rows.forEach((row, t) => {
          const track = p.tracks[t];
          const where = `lesson ${L.number} ${slot} bar ${b + 1} T${t + 1}`;
          const steps = row.len ?? 16;
          const got = [];
          const want = [];
          for (let s = 1; s <= steps; s++) {
            // a track shorter than the pattern loops, and the map draws its own steps in every bar
            const i = row.len ? s - 1 : (b * 16 + s - 1) % track.stepCount;
            if (track.trig(i)) got.push(s);
            if (row.v[s - 1]) want.push(s);
            if (!track.trig(i) || !row.v[s - 1]) continue;
            const off = Math.abs(mapVelocity(track.velocity(i)) - row.v[s - 1]);
            assert.ok(off < 0.04, `${where} step ${s}: VEL ${track.velocity(i)}, the map draws ${row.v[s - 1]}`);
            assert.equal(track.condition(i) ?? "", row.cd?.[s - 1] ?? "", `${where} step ${s}`);
          }
          assert.deepEqual(got, want, where);
          if (row.len) assert.equal(track.stepCount, row.len, where);
        })
      );
    }
  }
});
