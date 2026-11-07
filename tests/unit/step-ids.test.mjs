// Step ids (scripts/step-ids.mjs): new steps get ids nobody wrote by hand, the register keeps every id a
// lesson has ever used, and the check catches ids that were dropped, reused or never registered.
import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "yaml";
import { slug, newId, fillIds, updateRegister, problems, readRegister, REGISTER } from "../../scripts/step-ids.mjs";
import { COURSES } from "../../src/course/files.js";
import { NUMBERED_STEPS } from "../../src/course/shared/numbered-steps.js";

test("an id is a few words from the step, without key caps, and never one the lesson has used", () => {
  assert.equal(slug("Make B01 four bars long: hold [FUNC] and press [PAGE]"), "make-b01-four-bars");
  assert.equal(slug("Press [PLAY] and listen to the loop"), "press-listen-loop");
  assert.equal(slug(""), "step");
  assert.equal(newId("Add a kick", new Set(["add-kick"])), "add-kick-2");
  assert.equal(newId("Add a kick", new Set(["add-kick", "add-kick-2"])), "add-kick-3");
});

test("steps without an id get one in the file's own text; steps with one keep it", () => {
  const text = [
    "id: w99",
    "steps:",
    "  - id: first-one",
    "    k: learn",
    "    t: First one.",
    "  - k: play",
    "    t: 'Add a kick: on [TRIG 1].'",
    "  - k: check",
    "    t: Which?",
    "    q: [a, '!b']",
    "challenge: Go on.",
  ].join("\n");
  const taken = new Set(["first-one", "add-kick"]);
  const r = fillIds(text, taken);
  assert.deepEqual(r.ids, ["first-one", "add-kick-2", "which"]);
  assert.deepEqual(
    parse(r.text).steps.map((s) => [s.id, s.k]),
    [
      ["first-one", "learn"],
      ["add-kick-2", "play"],
      ["which", "check"],
    ]
  );
  assert.equal(parse(r.text).challenge, "Go on.");
});

test("the register keeps every id: a step taken out retires its id, and a retired id never comes back", () => {
  const reg = {};
  updateRegister(reg, "w99", ["a", "b", "c"]);
  assert.deepEqual(reg.w99, { used: ["a", "b", "c"], retired: [] });
  updateRegister(reg, "w99", ["c", "a", "d"]); /* b taken out, d added, order changed */
  assert.deepEqual(reg.w99, { used: ["a", "c", "d"], retired: ["b"] });
  updateRegister(reg, "w99", ["a", "b", "c", "d"]); /* b put back by hand */
  assert.deepEqual(reg.w99, { used: ["a", "c", "d"], retired: ["b"] });
  assert.deepEqual(problems({ w99: ["a", "b", "c", "d"] }, reg), ["w99: b was used by a step that was taken out"]);
});

test("the check: every step has a registered id, and no id main has is dropped", () => {
  const reg = { w99: { used: ["a", "b"], retired: ["x"] } };
  assert.deepEqual(problems({ w99: ["a", "b"] }, reg), []);
  assert.deepEqual(problems({ w99: ["a", "b", undefined] }, reg), ["w99: step 3 has no id"]);
  assert.deepEqual(problems({ w99: ["a", "b", "new"] }, reg), ["w99: new is not in the register"]);
  assert.deepEqual(problems({ w99: ["a"] }, reg), ["w99: b is gone from the lesson"]);
  assert.deepEqual(problems({ w99: ["a", "a", "b"] }, reg), ["w99: two steps have the id a"]);
  assert.deepEqual(problems({ w99: ["a", "b"] }, reg, { w99: { used: ["a", "b", "y"], retired: ["x"] } }), [
    "w99: y was dropped from the register",
  ]);
  assert.deepEqual(problems({ w99: ["a", "b"] }, reg, null, { w99: ["intro", "a", "z"] }), [
    "w99: z (numbered-steps.js) is missing from the register",
  ]);
});

test("the repo's lessons match the register", () => {
  const lessons = Object.fromEntries(
    COURSES.flatMap((I) => I.lessons.map((L) => [L.id, L.steps.slice(1).map((s) => s.id)]))
  );
  assert.deepEqual(
    problems(lessons, readRegister(), null, Object.assign({}, ...Object.values(NUMBERED_STEPS))),
    [],
    `${REGISTER} is out of date: run npm run ids`
  );
});
