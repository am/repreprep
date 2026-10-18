// The course data, the lesson schema and the shared HTML helpers (src/course/index.js, files.js, schema.js, shared/*). The pages built from them are tested in tests/site.
import { test } from "node:test";
import assert from "node:assert/strict";
import { INSTRUMENTS, lessonLabel, pad2, stepPath, nextLesson, renderFig } from "../../src/course/index.js";
import { CATALOG, COURSES } from "../../src/course/files.js";
import { lessonSchema } from "../../src/course/schema.js";
import { esc, hits, svgFig, T } from "../../src/course/shared/html.js";
import { renderGrid, gridPreset } from "../../src/course/shared/grid.js";
import { SONGS, linkSongs } from "../../src/course/shared/songs.js";

const [I] = COURSES;
const count = (html, re) => (html.match(re) || []).length;

test("esc escapes the four HTML characters", () => {
  assert.equal(esc(`<a href="x">&</a>`), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  assert.equal(esc(5), "5");
});

test("hits turns a step list into 16 velocities", () => {
  assert.deepEqual(hits("1,5,9,13"), [0.85, 0, 0, 0, 0.85, 0, 0, 0, 0.85, 0, 0, 0, 0.85, 0, 0, 0]);
  assert.deepEqual(hits("2:.4,16", 1).filter(Boolean), [0.4, 1]);
  assert.equal(hits("").filter(Boolean).length, 0);
});

test("svgFig and T build SVG pieces", () => {
  assert.equal(
    svgFig("0 0 10 10", "<g/>", 'a "fig"'),
    '<svg class="fig" viewBox="0 0 10 10" role="img" aria-label="a &quot;fig&quot;"><g/></svg>'
  );
  assert.equal(T(1, 2, "hi", "fh", "start"), '<text x="1" y="2" text-anchor="start" class="fh">hi</text>');
});

test("instruments: only the ready ones have lessons", () => {
  assert.equal(I.name, "Model:Cycles");
  assert.deepEqual(
    CATALOG.map((x) => x.key),
    INSTRUMENTS.map((x) => x.key)
  );
  assert.ok(CATALOG.filter((x) => !x.ready).every((x) => !x.lessons));
  assert.deepEqual(COURSES, [I]);
  assert.equal(I.lessons.length, 20);
  assert.equal(pad2(3), "03");
});

test("lesson schema: grid hits become 16 velocities, mistakes are caught", () => {
  const step = (fig) => ({ k: "play", t: "Play it.", fig });
  const lesson = (steps, more = {}) => ({
    id: "w99",
    number: 99,
    unit: "U",
    title: "T",
    goal: "Go",
    concepts: [],
    steps,
    ...more,
  });
  const grid = {
    bpm: 90,
    rows: [
      { n: "Kick", s: "kick", hits: "1,9", vel: 0.5 },
      { n: "Hat", s: "hat", hits: 3 },
    ],
  };
  const ok = lessonSchema.parse(lesson([step({ grid })]));
  assert.deepEqual(
    ok.steps[0].fig.grid.rows.map((r) => r.v),
    [hits("1,9", 0.5), hits("3")]
  );
  assert.ok(!("hits" in ok.steps[0].fig.grid.rows[0]));
  const bad = (l) => assert.equal(lessonSchema.safeParse(l).success, false);
  bad(lesson([step()], { typo: 1 })); /* unknown field */
  bad(lesson([step({ grid: { bpm: 90, rows: [{ n: "K", s: "nope", hits: "1" }] } })])); /* unknown sound */
  bad(lesson([step({ grid: { bpm: 90, rows: [{ n: "K", s: "kick" }] } })])); /* no hits */
  bad(lesson([{ k: "check", t: "Which?", q: ["a", "b"], a: "a" }])); /* no right answer */
  bad(lesson([step()], { song: true })); /* a song study has no number */
  bad(lesson([step()], { id: "x1" }));
});

test("lessons: ids, addresses and short names are unique and stable", () => {
  const ids = I.lessons.map((l) => l.id),
    paths = I.lessons.map((l) => l.path),
    shorts = I.lessons.map((l) => l.short);
  for (const list of [ids, paths, shorts]) assert.equal(new Set(list).size, list.length);
  const w05 = I.lessons.find((l) => l.id === "w05");
  assert.deepEqual(
    [w05.slug, w05.path, w05.short, lessonLabel(w05)],
    ["05", "/model-cycles/lessons/05", "L05", "Lesson 5"]
  );
  const s01 = I.lessons.find((l) => l.id === "s01");
  assert.deepEqual(
    [s01.slug, s01.path, s01.short, lessonLabel(s01)],
    ["looped", "/model-cycles/songs/looped", "S01", "Song study"]
  );
  /* song studies come after every lesson */
  const firstSong = I.lessons.findIndex((l) => l.song);
  assert.ok(I.lessons.slice(firstSong).every((l) => l.song));
});

test("every lesson opens with an intro step that states its goal", () => {
  for (const L of I.lessons) {
    assert.ok(L.steps[0].intro, L.id);
    assert.match(L.steps[0].t, new RegExp(`^${lessonLabel(L)}: .+\\. In this lesson you will [a-z]`), L.id);
    assert.equal(L.steps.filter((s) => s.intro).length, 1, L.id);
  }
});

test("step addresses: the intro is the lesson's own address", () => {
  const L = I.lessons[0];
  assert.equal(stepPath(L, 0), "/model-cycles/lessons/01");
  assert.equal(stepPath(L, 3), "/model-cycles/lessons/01/3");
  assert.equal(nextLesson(I, L), I.lessons[1]);
  assert.equal(nextLesson(I, I.lessons.at(-1)), undefined);
});

test("renderFig: named drawings and playable grids", () => {
  assert.equal(renderFig(I, undefined, "x"), "");
  assert.equal(renderFig(I, "no-such-drawing", "x"), "");
  const name = Object.keys(I.figs)[0];
  assert.match(renderFig(I, name, "x"), /^<svg/);
  const grid = { rows: [{ n: "Kick", s: "kick", v: hits("1,9") }], bpm: 90 };
  const html = renderFig(I, { grid }, "w01:2");
  assert.match(html, /^<div class="gridhost" data-grid="w01:2" data-spec="/);
  assert.deepEqual(
    JSON.parse(
      html
        .match(/data-spec="([^"]*)"/)[1]
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
    ),
    grid
  );
});

test("renderGrid: 16 steps per row, steps past a short row's length are off", () => {
  const G = {
    title: "Beat",
    rows: [
      { n: "Kick", s: "kick", v: hits("1,5") },
      { n: "Hat", s: "hat", v: hits("1,2,3"), len: 3 },
    ],
    bpm: 100,
    swingCtl: true,
  };
  const html = renderGrid(G, "g1");
  assert.equal(count(html, /class="cell /g), 32);
  assert.equal(count(html, /class="cell on/g), 5);
  assert.equal(count(html, / disabled /g), 13);
  assert.match(html, /<small>3 steps<\/small>/);
  assert.match(html, /100 BPM/);
  assert.match(html, /data-gswing="g1"/);
  assert.match(html, />Play</);
  assert.match(renderGrid(G, "g1", true), />Stop</);
  assert.match(renderGrid({ ...G, edit: false }, "g1"), /Press Play to hear it\./);
});

test("renderGrid: presets get tabs and the current one is shown", () => {
  const a = { name: "A", rows: [{ n: "Kick", s: "kick", v: hits("1") }], bpm: 90 },
    b = { name: "B", rows: [{ n: "Kick", s: "kick", v: hits("1,2") }], bpm: 120 };
  const G = { presets: [a, b], cur: 1 };
  assert.equal(gridPreset(G), b);
  const html = renderGrid(G, "g2");
  assert.match(
    html,
    /data-gpre="0" data-g="g2" aria-pressed="false">A<.*data-gpre="1" data-g="g2" aria-pressed="true">B</
  );
  assert.match(html, /120 BPM/);
});

test("songs: every song has a Spotify track and is linked from quotes", () => {
  for (const [t, [artist, id]] of Object.entries(SONGS)) {
    assert.ok(artist, t);
    assert.match(id, /^[A-Za-z0-9]{22}$/, t);
  }
  const html = linkSongs("Hear &quot;Looped&quot; and &quot;La Femme d&#39;Argent&quot; and &quot;Nope&quot;");
  assert.equal(count(html, /class="song"/g), 2);
  assert.match(html, /title="Open Air, La Femme d'Argent in the Spotify app"/);
});
