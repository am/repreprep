// Model:Cycles key icons: each key printed with an icon is drawn from one shape, the same on the panel drawing and
// in the key caps of step text (src/course/model-cycles/icons.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { COURSES } from "../../src/course/files.js";
import { keyify } from "../../src/course/shared/text.js";

const I = COURSES.find((c) => c.key === "cycles");
const C = I.controls;
/* the keys whose manual description says they carry a printed icon */
const iconKeys = Object.keys(C).filter((id) => /\bicon\b/.test(C[id].kind || ""));
/* the shape inside a key on the panel drawing, by control id */
const panel = I.draw();
const panelShape = (id) => {
  const g = panel.match(new RegExp(`<g class="c" data-id="${id}"[^>]*>([\\s\\S]*?)</text></g>`));
  const m = g && g[1].match(/<g class="keyico"[^>]*>([\s\S]*?)<\/g>/);
  return m && m[1];
};
/* the shape inside a key cap in step text */
const capShape = (name) => {
  const m = keyify(I, `[${name}]`, "").match(/<svg class="ico"[^>]*>([\s\S]*?)<\/svg>/);
  return m && m[1];
};

test("the ten keys printed with an icon are the ones that have one", () => {
  assert.deepEqual(iconKeys, [
    "machines",
    "punch",
    "gate",
    "lfo",
    "back",
    "settings",
    "tempo",
    "record",
    "play",
    "stop",
  ]);
});

for (const id of ["machines", "punch", "gate", "lfo", "back", "settings", "tempo", "record", "play", "stop"]) {
  test(`[${C[id].name}] has the same icon on the panel and in step text`, () => {
    const p = panelShape(id);
    assert.ok(p, "drawn on the panel");
    assert.equal(capShape(C[id].name), p);
  });
}

test("keys without a printed icon get none", () => {
  for (const name of ["FUNC", "RETRIG", "PATTERN", "TRIG 5", "LEVEL/DATA"])
    assert.doesNotMatch(keyify(I, `[${name}]`, ""), /<svg/, name);
});
