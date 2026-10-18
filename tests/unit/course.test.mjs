// The course data and the page markup built from it (src/course/index.js, views.js, shared/*).
import { test } from "node:test";
import assert from "node:assert/strict";
import { INSTRUMENTS, instrumentBySlug, lessonLabel, pad2, stepPath, nextLesson, renderFig } from "../../src/course/index.js";
import { player, lessonText, panelGuide, machines, shortcuts, courseMap } from "../../src/course/views.js";
import { esc, hits, svgFig, T } from "../../src/course/shared/html.js";
import { renderGrid, gridPreset } from "../../src/course/shared/grid.js";
import { SONGS, linkSongs } from "../../src/course/shared/songs.js";

const I = instrumentBySlug("model-cycles");
const count = (html, re) => (html.match(re) || []).length;

test("esc escapes the four HTML characters", () => {
  assert.equal(esc(`<a href="x">&</a>`), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
  assert.equal(esc(5), "5");
});

test("hits turns a step list into 16 velocities", () => {
  assert.deepEqual(hits("1,5,9,13"), [.85, 0, 0, 0, .85, 0, 0, 0, .85, 0, 0, 0, .85, 0, 0, 0]);
  assert.deepEqual(hits("2:.4,16", 1).filter(Boolean), [.4, 1]);
  assert.equal(hits("").filter(Boolean).length, 0);
});

test("svgFig and T build SVG pieces", () => {
  assert.equal(svgFig("0 0 10 10", "<g/>", 'a "fig"'), '<svg class="fig" viewBox="0 0 10 10" role="img" aria-label="a &quot;fig&quot;"><g/></svg>');
  assert.equal(T(1, 2, "hi", "fh", "start"), '<text x="1" y="2" text-anchor="start" class="fh">hi</text>');
});

test("instruments: only the ready ones have lessons; slugs find them", () => {
  assert.equal(I.name, "Model:Cycles");
  assert.ok(INSTRUMENTS.filter((x) => !x.ready).every((x) => !x.lessons));
  assert.equal(instrumentBySlug("nope"), undefined);
  assert.equal(pad2(3), "03");
});

test("lessons: ids, addresses and short names are unique and stable", () => {
  const ids = I.lessons.map((l) => l.id), paths = I.lessons.map((l) => l.path), shorts = I.lessons.map((l) => l.short);
  for (const list of [ids, paths, shorts]) assert.equal(new Set(list).size, list.length);
  const w05 = I.lessons.find((l) => l.id === "w05");
  assert.deepEqual([w05.slug, w05.path, w05.short, lessonLabel(w05)], ["05", "/model-cycles/lessons/05", "L05", "Lesson 5"]);
  const s01 = I.lessons.find((l) => l.id === "s01");
  assert.deepEqual([s01.slug, s01.path, s01.short, lessonLabel(s01)], ["looped", "/model-cycles/songs/looped", "S01", "Song study"]);
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
  assert.deepEqual(JSON.parse(html.match(/data-spec="([^"]*)"/)[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")), grid);
});

test("renderGrid: 16 steps per row, steps past a short row's length are off", () => {
  const G = { title: "Beat", rows: [{ n: "Kick", s: "kick", v: hits("1,5") }, { n: "Hat", s: "hat", v: hits("1,2,3"), len: 3 }], bpm: 100, swingCtl: true };
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
  const a = { name: "A", rows: [{ n: "Kick", s: "kick", v: hits("1") }], bpm: 90 }, b = { name: "B", rows: [{ n: "Kick", s: "kick", v: hits("1,2") }], bpm: 120 };
  const G = { presets: [a, b], cur: 1 };
  assert.equal(gridPreset(G), b);
  const html = renderGrid(G, "g2");
  assert.match(html, /data-gpre="0" data-g="g2" aria-pressed="false">A<.*data-gpre="1" data-g="g2" aria-pressed="true">B</);
  assert.match(html, /120 BPM/);
});

test("songs: every song has a Spotify track and is linked from quotes", () => {
  for (const [t, [artist, id]] of Object.entries(SONGS)) { assert.ok(artist, t); assert.match(id, /^[A-Za-z0-9]{22}$/, t); }
  const html = linkSongs("Hear &quot;Looped&quot; and &quot;La Femme d&#39;Argent&quot; and &quot;Nope&quot;");
  assert.equal(count(html, /class="song"/g), 2);
  assert.match(html, /title="Open Air, La Femme d'Argent in the Spotify app"/);
});

test("player: dots, Back and Next on every step of every lesson", () => {
  for (const L of I.lessons) {
    const n = L.steps.length, total = n + (L.challenge ? 1 : 0);
    for (let act = 0; act < total; act++) {
      const html = player(I, L, act), where = `${L.id} step ${act}`;
      assert.equal(count(html, /<a [^>]*data-step="\d+"/g), total, where);
      assert.equal(count(html, /aria-current="true"[^>]*><\/a>|aria-current="true" aria-label/g), 1, where);
      assert.match(html, new RegExp(`data-lesson="${L.id}" data-step="${act}" data-steps="${n}"`), where);
      if (act === 0) assert.match(html, /<button class="btn" disabled aria-label="Previous step">Back<\/button>/, where);
      else assert.match(html, new RegExp(`href="${stepPath(L, act - 1)}" data-nav="-1"`), where);
      const end = act === total - 1, nx = nextLesson(I, L);
      const label = end ? "Finish" : act === 0 ? "Start" : "Next";
      const href = end ? (nx ? nx.path : L.path) : stepPath(L, act + 1);
      assert.match(html, new RegExp(`href="${href}" data-nav="1"${end ? " data-end" : ""}>${label}</a>`), where);
    }
  }
});

test("player: the intro card, a quiz, an answer and the challenge", () => {
  const L = I.lessons.find((l) => l.challenge && l.steps.some((s) => s.q));
  assert.match(player(I, L, 0), /<div class="introcard">.*You will learn to/s);
  const qi = L.steps.findIndex((s) => s.q);
  assert.match(player(I, L, qi), /<div class="quiz">/);
  const ch = player(I, L, L.steps.length);
  assert.match(ch, /<span class="kind k-challenge">Challenge<\/span> · optional/);
  assert.match(ch, /Optional\. Try it now/);
  assert.match(ch, /<a class="opt" [^>]*aria-current="true"/);
  /* Learn steps with a drawing show it instead of the panel */
  const fi = L.steps.findIndex((s) => s.fig);
  if (fi > 0) assert.match(player(I, L, fi), /<div class="figwrap">/);
  /* other steps show the panel with the step's controls lit */
  const pi = L.steps.findIndex((s) => !s.fig && s.hl);
  assert.match(player(I, L, pi), /class="c hl-(press|hold|turn)/);
});

test("player: the lesson picker lists every lesson and marks this one", () => {
  const L = I.lessons[2], html = player(I, L, 0);
  assert.equal(count(html, /class="pm-i"/g), I.lessons.length);
  assert.match(html, new RegExp(`href="${L.path}" data-lesson="${L.id}" data-path="${L.path}" aria-current="true"`));
  assert.match(html, /<div class="pm-h">Song studies<\/div>/);
});

test("lessonText: notes box and Complete button for the lesson", () => {
  const L = I.lessons[0], html = lessonText(I, L);
  assert.match(html, new RegExp(`data-notebox="${L.id}"`));
  assert.match(html, new RegExp(`data-finish="${L.id}" data-label="Complete"`));
  assert.match(html, /href="\/model-cycles">All lessons</);
});

test("courseMap: every lesson once, grouped by unit, song studies last", () => {
  const html = courseMap(I);
  for (const L of I.lessons) assert.equal(count(html, new RegExp(`data-lesson="${L.id}"`, "g")), 1, L.id);
  const units = [...html.matchAll(/<h3 class="band-h t-eyebrow">([^<]*)/g)].map((m) => m[1]);
  assert.equal(units.at(-1), "Song studies");
  assert.equal(new Set(units).size, units.length);
});

test("reference pages: panel guide for every control, machines, shortcuts", () => {
  for (const id of Object.keys(I.controls)) {
    const html = panelGuide(I, id);
    assert.match(html, new RegExp(`class="c[^"]* sel" data-id="${id}"`), id);
    assert.match(html, new RegExp(`<h3 class="t-title t-card">${esc(I.controls[id].name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h3>`), id);
  }
  assert.equal(count(machines(I), /<section class="band">/g), I.machines.length + 1);
  assert.equal(count(shortcuts(I), /<tr>/g), I.shortcuts.length);
});
