// Step text: key caps, song links, sentence splitting and how step text is laid out (src/course/shared/text.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { COURSES } from "../../src/course/files.js";
import { parseHl, keyify, keyCap, splitSent, stepParts, withHl, KIND } from "../../src/course/shared/text.js";

const [I] = COURSES;
/* the key caps in some HTML, as [label, action] pairs */
const caps = (html) => [...html.matchAll(/<span class="k ?([a-z]*) ?"[^>]*>(?:<svg[\s\S]*?<\/svg>)?([^<]*)<\/span>/g)].map((m) => [m[2], m[1]]);

test("parseHl sorts controls into press, hold and turn", () => {
  assert.deepEqual(parseHl("h:func p:s5 t:level p:back x:nope"), { press: ["s5", "back"], hold: ["func"], turn: ["level"] });
  assert.deepEqual(parseHl(""), { press: [], hold: [], turn: [] });
  assert.deepEqual(parseHl(undefined), { press: [], hold: [], turn: [] });
});

test("keyCap renders one key cap", () => {
  assert.equal(keyCap("PLAY", "press"), '<span class="k press">PLAY</span>');
  assert.match(keyCap("X", "", "<svg></svg>", 'a "key"'), /title="a &quot;key&quot;"/);
});

test("keyify turns [KEY] into caps coloured by the step's actions", () => {
  const html = keyify(I, "Hold [FUNC] and press [TRIG 5], then turn [LEVEL/DATA] and [FOO].", "h:func p:s5 t:level");
  assert.deepEqual(caps(html), [["FUNC", "hold"], ["5", "press"], ["LEVEL/DATA", "turn"], ["FOO", ""]]);
});

test("keyify knows the short names used in lessons", () => {
  for (const [name, id] of [["REC", "record"], ["LFO", "lfo"], ["VOLUME+DIST", "vol"], ["VOL+DIST", "vol"]]) {
    assert.deepEqual(caps(keyify(I, `[${name}]`, `p:${id}`)), [[name, "press"]], name);
  }
});

test("keyify draws the icon of keys printed with one", () => {
  const html = keyify(I, "[TEMPO]", "");
  assert.match(html, /<svg class="ico"/);
  assert.match(html, /title="Key \(metronome icon\)"/);
});

test("keyify escapes HTML and links known song titles", () => {
  const html = keyify(I, 'Play <b> & listen to "Looped" and "Not a song".', "");
  assert.match(html, /Play &lt;b&gt; &amp; listen/);
  assert.match(html, /<a class="song" href="spotify:track:4bwQt4sjaPe0ZU0gI8FPKP"[^>]*>&quot;Looped&quot;<svg/);
  assert.match(html, /&quot;Not a song&quot;/);
  assert.equal((html.match(/class="song"/g) || []).length, 1);
});

test("splitSent splits on sentences but not inside brackets or after e.g.", () => {
  assert.deepEqual(splitSent("Press [PLAY]. Turn it (e.g. to 60. Then stop). Hold A, then press B. Done!"),
    ["Press [PLAY].", "Turn it (e.g. to 60. Then stop).", "Hold A.", "Then press B.", "Done!"]);
  assert.deepEqual(splitSent("Use e.g. Kick. Then stop."), ["Use e.g. Kick.", "Then stop."]);
  assert.deepEqual(splitSent("One sentence only"), ["One sentence only"]);
  assert.deepEqual(splitSent('Listen. "Looped" starts.'), ["Listen.", '"Looped" starts.']);
});

test("stepParts: a Play step becomes a title and one bullet per action", () => {
  assert.deepEqual(stepParts({ k: "play", t: "Set the tempo: press [TEMPO]. Turn [LEVEL/DATA]." }), { lead: "Set the tempo", items: ["Press [TEMPO].", "Turn [LEVEL/DATA]."] });
});

test("stepParts: a one-sentence Play step is a paragraph", () => {
  assert.deepEqual(stepParts({ t: "Just listen." }), { lead: "", para: "Just listen." });
});

test("stepParts: Learn and Check steps get a lead sentence and the rest as body", () => {
  assert.deepEqual(stepParts({ k: "learn", t: "One idea. Two more words. Three." }), { lead: "", first: "One idea.", rest: "Two more words. Three." });
  assert.deepEqual(stepParts({ k: "learn", t: "Only one." }), { lead: "", first: "Only one.", rest: "" });
});

test("stepParts: a Check step never turns its question into a title", () => {
  assert.deepEqual(stepParts({ k: "check", t: "Quiz: what is it?" }), { lead: "", first: "Quiz: what is it?", rest: "" });
});

test("stepParts: a long or punctuated prefix is not a title", () => {
  assert.equal(stepParts({ k: "play", t: "This prefix is far too long to be a title: it stays." }).lead, "");
  assert.equal(stepParts({ k: "play", t: "Press [PLAY]: it starts." }).lead, "");
});

test("withHl lights the step's controls and marks the selected one", () => {
  const svg = '<g class="c" data-id="func"></g><g class="c" data-id="play"></g><g class="c" data-id="level"></g><g class="c" data-id="s1"></g>';
  assert.equal(withHl(svg, "h:func t:level p:s1", "play"),
    '<g class="c hl-hold" data-id="func"></g><g class="c sel" data-id="play"></g><g class="c hl-turn" data-id="level"></g><g class="c hl-press" data-id="s1"></g>');
});

test("every step kind has a label", () => {
  for (const L of I.lessons) for (const st of L.steps) assert.ok(KIND[st.k || "play"], `${L.id}: kind ${st.k}`);
  assert.equal(KIND.challenge, "Challenge");
});
