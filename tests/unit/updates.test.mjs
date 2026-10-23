// Versions and lesson updates (src/course/shared/updates.js), and the changelog itself
// (src/content/changelog.yaml): it matches package.json and only names lessons that exist. Also step ids, and
// turning progress saved with numbered steps into them (src/course/shared/numbered-steps.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  FIRST_VERSION,
  cmpVersion,
  newestFirst,
  lessonUpdates,
  started,
  unseen,
  isNew,
} from "../../src/course/shared/updates.js";
import { NUMBERED_STEPS, numbersToIds } from "../../src/course/shared/numbered-steps.js";
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

test("progress saved with numbered steps gets step ids once, and ticks on removed steps are dropped", () => {
  const table = { cycles: { w01: ["intro", "kick", "snare"] } };
  const s = {
    inst: { cycles: { steps: { "w01:0": true, "w01:2": true, "w01:7": true, "w09:1": true }, active: { w01: 2 } } },
  };
  numbersToIds(s, table);
  assert.deepEqual(s.inst.cycles.steps, { "w01:intro": true, "w01:snare": true });
  assert.equal(s.inst.cycles.active.w01, 2);
  assert.equal(s.stepIds, 1);
  /* already converted: left alone, even where a step id looks like a number */
  s.inst.cycles.steps["w01:2"] = true;
  numbersToIds(s, table);
  assert.ok(s.inst.cycles.steps["w01:2"]);
});

test("every step has an id, and the numbered steps of old progress name lessons that exist", () => {
  for (const I of COURSES) {
    for (const L of I.lessons) {
      assert.equal(L.steps[0].id, "intro");
      assert.equal(new Set(L.steps.map((st) => st.id)).size, L.steps.length, `${L.id} has two steps with one id`);
    }
    for (const id of Object.keys(NUMBERED_STEPS[I.key] || {}))
      assert.ok(
        I.lessons.some((L) => L.id === id),
        `numbered-steps.js names ${id}`
      );
  }
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

test("a release is news after you started and after the version you last saw on What's new", () => {
  assert.ok(isNew("0.3.0", "0.2.0", undefined));
  assert.ok(isNew("0.3.0", undefined, undefined));
  assert.ok(!isNew("0.3.0", "0.3.0", undefined));
  assert.ok(!isNew("0.3.0", "0.2.0", "0.3.0"));
  assert.ok(isNew("0.4.0", "0.2.0", "0.3.0"));
});

test("the changelog: package.json has its newest version, versions are unique and dates run with them", () => {
  const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.version, RELEASES[0].id);
  assert.equal(new Set(RELEASES.map((r) => r.id)).size, RELEASES.length);
  RELEASES.slice(1).forEach((r, i) => assert.ok(r.date <= RELEASES[i].date, `${r.id} is dated after a newer version`));
  assert.equal(RELEASES.at(-1).id, FIRST_VERSION);
});

test("the changelog only names lessons that exist", () => {
  for (const r of RELEASES)
    for (const c of r.lessons || []) {
      const [slug, id] = c.lesson.split("/");
      const L = COURSES.find((I) => I.slug === slug)?.lessons.find((l) => l.id === id);
      assert.ok(L, `${r.id}: no lesson ${c.lesson}`);
    }
});
