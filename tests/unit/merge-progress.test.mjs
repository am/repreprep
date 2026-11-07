// Combining two copies of your progress (src/lib/merge-progress.js): another tab, a loaded file, the account.
import { test } from "node:test";
import assert from "node:assert/strict";
import { entries, stamp, merge, sameProgress } from "../../src/lib/merge-progress.js";

const cycles = (v = {}) => ({ lesson: null, steps: {}, done: {}, notes: {}, active: {}, ...v });
const prog = (updatedAt, c, extra = {}) => ({ updatedAt, introSteps: 1, inst: { cycles: cycles(c) }, ...extra });

test("entries lists every ticked step, finished lesson, note, position and layout", () => {
  assert.deepEqual(
    entries(
      prog(
        1,
        { lesson: "w02", steps: { "w01:0": true }, done: { w01: 5 }, notes: { w01: "hi" }, active: { w02: 3 } },
        { stepW: 400 }
      )
    ),
    {
      "cycles/lesson": "w02",
      "cycles/steps/w01:0": true,
      "cycles/done/w01": 5,
      "cycles/notes/w01": "hi",
      "cycles/active/w02": 3,
      stepW: 400,
    }
  );
});

test("stamp marks what changed since the last save, removals included", () => {
  const s = prog(1, { steps: { "w01:0": true }, notes: { w01: "hi" } });
  let last = entries(s);
  s.inst.cycles.steps["w01:1"] = true;
  delete s.inst.cycles.notes.w01;
  last = stamp(s, last, 50);
  assert.deepEqual(s.stamps, { "cycles/steps/w01:1": 50, "cycles/notes/w01": 50 });
  stamp(s, last, 60);
  assert.deepEqual(s.stamps, { "cycles/steps/w01:1": 50, "cycles/notes/w01": 50 }, "nothing new, nothing stamped");
});

test("progress from before stamps: ticks from both copies are kept", () => {
  const a = prog(10, { lesson: "w01", steps: { "w01:0": true }, notes: { w01: "a" } });
  const b = prog(20, { lesson: "w03", steps: { "w03:0": true }, notes: { w01: "b" } });
  const m = merge(a, b);
  assert.deepEqual(m.inst.cycles.steps, { "w01:0": true, "w03:0": true });
  assert.equal(m.inst.cycles.lesson, "w03", "the newer copy wins where both have the entry");
  assert.deepEqual(m.inst.cycles.notes, { w01: "b" });
  assert.equal(m.updatedAt, 20);
  assert.deepEqual(merge(b, a).inst, m.inst, "order doesn't matter");
});

test("the newer change of each entry wins, even from the older copy", () => {
  const a = prog(
    30,
    { notes: { w01: "laptop" }, steps: { "w02:0": true } },
    { stamps: { "cycles/notes/w01": 5, "cycles/steps/w02:0": 30 } }
  );
  const b = prog(10, { notes: { w01: "phone" } }, { stamps: { "cycles/notes/w01": 10 } });
  const m = merge(a, b);
  assert.deepEqual(m.inst.cycles.notes, { w01: "phone" });
  assert.deepEqual(m.inst.cycles.steps, { "w02:0": true });
  assert.deepEqual(m.stamps, { "cycles/notes/w01": 10, "cycles/steps/w02:0": 30 });
});

test("a removal travels: a deleted note or unfinished lesson stays gone", () => {
  const phone = prog(10, { done: { w01: 3 }, notes: { w01: "x" } });
  const laptop = prog(20, {}, { stamps: { "cycles/done/w01": 20, "cycles/notes/w01": 20 } });
  assert.deepEqual(merge(phone, laptop).inst, {});
  /* but a change made after the removal comes back */
  const later = prog(30, { notes: { w01: "again" } }, { stamps: { "cycles/notes/w01": 30 } });
  assert.deepEqual(merge(laptop, later).inst.cycles.notes, { w01: "again" });
});

test("deleting all progress wins over older progress elsewhere", () => {
  const s = prog(10, { steps: { "w01:0": true, "w01:1": true } }, { focus: true });
  const before = entries(s);
  const other = structuredClone(s);
  s.inst = {};
  delete s.focus;
  stamp(s, before, 40);
  const m = merge(other, s);
  assert.deepEqual(m.inst, {});
  assert.equal(m.focus, undefined);
});

test("merge with nothing gives the other copy back, and neither input changes", () => {
  const a = prog(1, { steps: { "w01:0": true } });
  assert.equal(merge(a, null), a);
  assert.equal(merge(null, a), a);
  const b = prog(2, { steps: { "w02:0": true } });
  const copy = structuredClone([a, b]);
  merge(a, b);
  assert.deepEqual([a, b], copy);
});

test("sameProgress ignores when a copy was saved and the order of entries", () => {
  const a = prog(1, { steps: { "w01:0": true, "w01:1": true } }, { stamps: { x: 1, y: 2 } });
  const b = prog(9, { steps: { "w01:1": true, "w01:0": true } }, { stamps: { y: 2, x: 1 } });
  assert.ok(sameProgress(a, b));
  b.inst.cycles.steps["w01:2"] = true;
  assert.ok(!sameProgress(a, b));
  assert.ok(sameProgress(null, { inst: {} }));
});
