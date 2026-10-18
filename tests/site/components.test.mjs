// The course components as built into the pages (src/components): the lesson player and lesson menu,
// notes, the course map, the panel guide and the reference pages.
import { test } from "node:test";
import assert from "node:assert/strict";
import { stepPath, nextLesson } from "../../src/course/index.js";
import { COURSES } from "../../src/course/files.js";
import { esc } from "../../src/course/shared/html.js";
import { page } from "./built.mjs";

const [I] = COURSES;
const count = (html, re) => (html.match(re) || []).length;
/* just the player, or just the part under it, of a lesson page */
const player = (L, i) => page(stepPath(L, i)).match(/<section class="player"[\s\S]*?<\/section>/)[0];
const below = (L) => page(L.path).match(/<div class="below">[\s\S]*?<\/main>/)[0];
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("player: dots, Back and Next on every step of every lesson", () => {
  for (const L of I.lessons) {
    const n = L.steps.length,
      total = n + (L.challenge ? 1 : 0);
    for (let act = 0; act < total; act++) {
      const html = player(L, act),
        where = `${L.id} step ${act}`;
      assert.equal(count(html, /<a [^>]*data-step="\d+"/g), total, where);
      assert.equal(count(html, /<a [^>]*data-step="\d+" aria-current="true"/g), 1, where);
      assert.match(html, new RegExp(`data-lesson="${L.id}" data-step="${act}" data-steps="${n}"`), where);
      if (act === 0)
        assert.match(html, /<button class="btn" disabled aria-label="Previous step">Back<\/button>/, where);
      else assert.match(html, new RegExp(`href="${stepPath(L, act - 1)}" data-nav="-1"`), where);
      const end = act === total - 1,
        nx = nextLesson(I, L);
      const label = end ? "Finish" : act === 0 ? "Start" : "Next";
      const href = end ? (nx ? nx.path : L.path) : stepPath(L, act + 1);
      assert.match(html, new RegExp(`href="${href}" data-nav="1"${end ? " data-end" : ""}>${label}</a>`), where);
    }
  }
});

test("player: the intro card, a quiz, an answer and the challenge", () => {
  const L = I.lessons.find((l) => l.challenge && l.steps.some((s) => s.q));
  assert.match(
    player(L, 0),
    /<div class="introhero">.*You will learn to.*<div class="introcard">.*Ideas in this lesson/s
  );
  const qi = L.steps.findIndex((s) => s.q);
  const quiz = player(L, qi);
  assert.match(quiz, /<div class="quiz">/);
  assert.deepEqual(
    [...quiz.matchAll(/data-opt="(\d)"/g)].map((m) => m[1]),
    L.steps[qi].q.map((o) => (o[0] === "!" ? "1" : "0"))
  );
  assert.match(quiz, /<p class="qexp" hidden>/);
  const ch = player(L, L.steps.length);
  assert.match(ch, /<span class="kind k-challenge">Challenge<\/span> · optional/);
  assert.match(ch, /Optional\. Try it now/);
  assert.match(ch, /<a class="opt" [^>]*aria-current="true"/);
  /* Learn steps with a drawing show it instead of the panel */
  const fi = L.steps.findIndex((s) => s.fig);
  if (fi > 0) assert.match(player(L, fi), /<div class="figwrap">/);
  /* other steps show the panel with the step's controls lit */
  const pi = L.steps.findIndex((s) => !s.fig && s.hl);
  assert.match(player(L, pi), /class="c hl-(press|hold|turn)/);
});

test("player: step text, the Listen for note and Check reminders", () => {
  const L = I.lessons[0];
  const pi = L.steps.findIndex((s) => (s.k || "play") === "play" && s.hear);
  assert.match(player(L, pi), /<p class="t-note hear"><span class="t-label">Listen for<\/span>/);
  const ci = L.steps.findIndex((s) => s.k === "check" && s.hear);
  if (ci > 0) assert.match(player(L, ci), /<p class="t-note hear done"><span class="t-label">Remember<\/span>/);
  const li = L.steps.findIndex((s) => s.k === "learn");
  assert.match(player(L, li), /<div class="ptxt">(<h3 class="t-title t-step">.*?<\/h3>)?<p class="t-lead">/);
  /* the legend shows on Play steps only */
  assert.match(player(L, pi), /<div class="legend"><span class="k press">PRESS<\/span>/);
  assert.match(player(L, li), /<div class="legend" hidden>/);
});

test("player: the lesson picker lists every lesson and marks this one", () => {
  const L = I.lessons[2],
    html = player(L, 0);
  assert.equal(count(html, /class="pm-i"/g), I.lessons.length);
  assert.match(html, new RegExp(`href="${L.path}" data-lesson="${L.id}" data-path="${L.path}" aria-current="true"`));
  assert.match(html, /<div class="pm-h">Song studies<\/div>/);
});

test("under the player: notes box and Complete button for the lesson", () => {
  const L = I.lessons[0],
    html = below(L);
  assert.match(html, new RegExp(`data-notebox="${L.id}"`));
  assert.match(html, /aria-label="Notes for lesson 1"/);
  assert.match(html, new RegExp(`data-finish="${L.id}" data-label="Complete"`));
  assert.match(html, /href="\/model-cycles">All lessons</);
});

test("course map: every lesson once, grouped by unit, song studies last", () => {
  const html = page(`/${I.slug}`);
  for (const L of I.lessons)
    assert.equal(count(html, new RegExp(`<a class="wk" [^>]*data-lesson="${L.id}"`, "g")), 1, L.id);
  const units = [...html.matchAll(/<h3 class="band-h t-eyebrow">([^<]*)/g)].map((m) => m[1]);
  assert.equal(units.at(-1), "Song studies");
  assert.equal(new Set(units).size, units.length);
});

test("reference pages: panel guide for every control, machines, shortcuts", () => {
  for (const [id, c] of Object.entries(I.controls)) {
    const html = page(`/${I.slug}/panel/${id}`);
    assert.match(html, new RegExp(`class="c[^"]* sel" data-id="${id}"`), id);
    assert.match(html, new RegExp(`<h3 class="t-title t-card">${reEsc(esc(c.name))}</h3>`), id);
  }
  assert.equal(count(page(`/${I.slug}/machines`), /<section class="band">/g), I.machines.length + 1);
  assert.equal(count(page(`/${I.slug}/shortcuts`), /<tr>/g), I.shortcuts.length);
});
