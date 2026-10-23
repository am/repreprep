// Versions and lesson updates (src/course/shared/updates.js), and the changelog itself
// (src/content/changelog.yaml): it matches package.json and only names lessons and steps that exist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  FIRST_VERSION,
  cmpVersion,
  newestFirst,
  lessonUpdates,
  stepMoves,
  movedIndex,
  moveSteps,
  started,
  unseen,
} from "../../src/course/shared/updates.js";
import { COURSES, RELEASES } from "../../src/course/files.js";

const rel = (id, lessons) => ({ id, date: "2026-10-23", title: id, lessons });

test("versions compare part by part, as numbers", () => {
  assert.ok(cmpVersion("0.10.0", "0.9.0") > 0);
  assert.ok(cmpVersion("0.2.1", "0.3.0") < 0);
  assert.equal(cmpVersion("1.0.0", "1.0.0"), 0);
  assert.deepEqual(
    newestFirst([rel("0.2.0"), rel("0.10.0"), rel("0.3.0")]).map((r) => r.id),
    ["0.10.0", "0.3.0", "0.2.0"]
  );
});

test("lesson updates are grouped by lesson, newest first, for one instrument", () => {
  const rs = [
    rel("0.2.0", [{ lesson: "model-cycles/w08", what: "a" }]),
    rel("0.3.0", [
      { lesson: "model-cycles/w08", what: "b" },
      { lesson: "microfreak/w01", what: "c" },
    ]),
  ];
  assert.deepEqual(lessonUpdates(rs, "model-cycles"), {
    w08: [
      { v: "0.3.0", date: "2026-10-23", what: "b" },
      { v: "0.2.0", date: "2026-10-23", what: "a" },
    ],
  });
});

test("step moves list the added steps by progress key, oldest release first", () => {
  const rs = [
    rel("0.4.0", [{ lesson: "model-cycles/w08", what: "x", added: [9, 3] }]),
    rel("0.3.0", [{ lesson: "model-cycles/w05", what: "y", added: [2] }]),
    rel("0.2.0", [{ lesson: "model-cycles/w01", what: "no steps added" }]),
  ];
  assert.deepEqual(stepMoves(rs, { "model-cycles": "cycles" }), [
    { v: "0.3.0", add: { cycles: { w05: [2] } } },
    { v: "0.4.0", add: { cycles: { w08: [3, 9] } } },
  ]);
});

test("an old step moves past every step added at or before it", () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((i) => movedIndex(i, [2])),
    [0, 1, 3, 4]
  );
  assert.deepEqual(
    [0, 1, 2, 3].map((i) => movedIndex(i, [2, 3])),
    [0, 1, 4, 5]
  );
  assert.deepEqual(
    [0, 1, 2].map((i) => movedIndex(i, [5])),
    [0, 1, 2]
  );
});

test("saved ticks and the open step follow the steps a newer release added", () => {
  const moves = [
    { v: "0.2.0", add: { cycles: { w08: [1] } } },
    { v: "0.3.0", add: { cycles: { w08: [3] } } },
  ];
  const s = {
    ver: "0.2.0",
    inst: { cycles: { steps: { "w08:0": true, "w08:2": true, "w08:3": true, "w05:3": true }, active: { w08: 3 } } },
  };
  moveSteps(s, moves, "0.3.0");
  assert.deepEqual(s.inst.cycles.steps, { "w08:0": true, "w08:2": true, "w08:4": true, "w05:3": true });
  assert.equal(s.inst.cycles.active.w08, 4);
  assert.equal(s.ver, "0.3.0");
  /* already up to date: nothing moves again */
  moveSteps(s, moves, "0.3.0");
  assert.deepEqual(s.inst.cycles.steps, { "w08:0": true, "w08:2": true, "w08:4": true, "w05:3": true });
  /* progress that doesn't say its version is from before the changelog, so every release applies */
  const old = { inst: { cycles: { steps: { "w08:1": true }, active: {} } } };
  moveSteps(old, moves, "0.3.0");
  assert.deepEqual(old.inst.cycles.steps, { "w08:2": true });
});

test("a note shows only on lessons you started, for updates newer than your start and your last read", () => {
  const s = { steps: { "w08:0": true }, done: {}, active: {} };
  assert.ok(started(s, "w08"));
  assert.ok(!started(s, "w05"));
  assert.ok(!started({ steps: {}, done: {}, active: { w05: 0 } }, "w05"));
  assert.ok(started({ steps: {}, done: { w05: 1 }, active: {} }, "w05"));
  const ups = [{ v: "0.4.0" }, { v: "0.3.0" }, { v: "0.2.0" }];
  assert.deepEqual(
    unseen(ups, undefined, undefined).map((u) => u.v),
    ["0.4.0", "0.3.0", "0.2.0"]
  );
  assert.equal(FIRST_VERSION, "0.1.0");
  assert.deepEqual(
    unseen(ups, "0.2.0", undefined).map((u) => u.v),
    ["0.4.0", "0.3.0"]
  );
  assert.deepEqual(
    unseen(ups, "0.2.0", "0.3.0").map((u) => u.v),
    ["0.4.0"]
  );
  assert.deepEqual(unseen(ups, "0.2.0", "0.4.0"), []);
  assert.deepEqual(unseen(undefined, "0.1.0"), []);
});

test("the changelog: package.json has its newest version, versions are unique and dates run with them", () => {
  const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.version, RELEASES[0].id);
  assert.equal(new Set(RELEASES.map((r) => r.id)).size, RELEASES.length);
  RELEASES.slice(1).forEach((r, i) => assert.ok(r.date <= RELEASES[i].date, `${r.id} is dated after a newer version`));
  assert.equal(RELEASES.at(-1).id, FIRST_VERSION);
});

test("the changelog only names lessons and steps that exist", () => {
  for (const r of RELEASES)
    for (const c of r.lessons || []) {
      const [slug, id] = c.lesson.split("/");
      const L = COURSES.find((I) => I.slug === slug)?.lessons.find((l) => l.id === id);
      assert.ok(L, `${r.id}: no lesson ${c.lesson}`);
      for (const a of c.added || []) assert.ok(a < L.steps.length, `${r.id}: ${c.lesson} has no step ${a}`);
    }
});
