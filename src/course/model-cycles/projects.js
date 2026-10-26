/* The course project as it stands at the end of each lesson, written as mcprj build specs
   (tools/mcprj/README.md), so a lesson can offer its starting point and its finished result as
   project files to load on the unit. `npm run projects` writes them to public/projects/model-cycles;
   `npm run check` fails when the files there are out of date.

   Each lesson's function changes a copy of the previous lesson's spec, step by step as the lesson
   does it. Values are raw (tools/mcprj/FORMAT.md): PITCH, LFO SPEED and LFO DEPTH are 64 at the
   centre, REVERB TONE too, DELAY TIME and REVERB SIZE are the screen value minus 1, DELAY FEEDBACK
   is the screen value x 127 / 198. Where a lesson says "a little" or leaves the choice to you, the
   spec picks one value. Lessons 4 and 5 follow the course project of a learner who did them.

   Not in the files yet, because the bytes for them aren't mapped: GATE (lessons 8, 10), the PAD
   menu DST and DDEP (lesson 5), CHG (lessons 6, 15), pan (lesson 14), the RETRIG menu's A.ON
   (lesson 13) and the preset lock (lesson 7). */

/* The CHORD machine's SHAPE: the unison and chord list (manual appendix C), one value each,
   in the order the unit steps through them (a new project's chord, minor, is 3). */
export const CHORDS = [
  "Unison x2",
  "Unison x3",
  "Unison x4",
  "minor",
  "Major",
  "sus2",
  "sus4",
  "m7",
  "M7",
  "mMaj7",
  "Maj7",
  "7sus4",
  "dim7",
];
const chord = (name) => CHORDS.indexOf(name);
// LFO menu: DST is the sound parameter's number, WAV and MUL in the menu's order
const DST = { PITCH: 10, COLOR: 11, DECAY: 19, DIST: 20, DELAY: 21 };
const WAV = { TRI: 0, ENV: 4, RND: 6 };
const MUL = { X1: 0, "1K": 21, "2K": 22 };
const bipolar = (v) => 64 + v;

const at = (bar, step) => (bar - 1) * 16 + step;
const bars = (step) => [step, step + 16, step + 32, step + 48];

function track(spec, slot, t) {
  const p = spec.patterns[slot];
  return (p.tracks[t] ??= { params: {}, trigs: {} });
}
function trig(spec, slot, t, step, props = {}) {
  const tr = track(spec, slot, t);
  const old = tr.trigs[step] ?? {};
  tr.trigs[step] = { ...old, ...props, locks: { ...old.locks, ...props.locks } };
  if (!Object.keys(tr.trigs[step].locks).length) delete tr.trigs[step].locks;
}
const set = (spec, slot, t, params) => Object.assign(track(spec, slot, t).params, params);
const clear = (spec, slot, t) => (track(spec, slot, t).trigs = {});
const copy = (spec, from, to) => (spec.patterns[to] = structuredClone(spec.patterns[from]));
/* raising a track's length copies its trigs onto the new pages, as the unit does */
function grow(tr, from, to) {
  for (const [s, props] of Object.entries(tr.trigs))
    for (let n = Number(s) + from; n <= to; n += from) tr.trigs[n] = structuredClone(props);
  tr.length = to;
}

const B01 = "B01";

/* lesson number -> (spec) => changes it in place; the spec starts empty */
export const LESSON_CHANGES = {
  1(spec) {
    spec.tempo = 90;
    spec.patterns[B01] = { tempo: 90, length: 16, tracks: {} };
    for (const s of [1, 5, 9, 13]) trig(spec, B01, 1, s);
  },
  2(spec) {
    for (const s of [5, 13]) delete track(spec, B01, 1).trigs[s];
    trig(spec, B01, 1, 11);
    for (const s of [5, 13]) trig(spec, B01, 2, s);
    for (const s of [3, 7, 11, 15]) trig(spec, B01, 3, s);
    // B02: the one drop, then steppers
    copy(spec, B01, "B02");
    clear(spec, "B02", 1);
    clear(spec, "B02", 2);
    for (const s of [1, 5, 9, 13]) trig(spec, "B02", 1, s);
    trig(spec, "B02", 2, 9);
  },
  3(spec) {
    for (const s of [2, 4, 6, 8, 10, 12, 14, 16]) trig(spec, B01, 3, s, { velocity: 30 });
    trig(spec, B01, 2, 12, { velocity: 25, micro: 6 });
    for (const t of [1, 2, 3, 4, 5, 6]) track(spec, B01, t).swing = 58;
  },
  4(spec) {
    const p = spec.patterns[B01];
    p.length = 64;
    for (const t of Object.keys(p.tracks)) grow(p.tracks[t], 16, 64);
    trig(spec, B01, 2, at(2, 16), { velocity: 30 });
    for (const s of [14, 15, 16]) trig(spec, B01, 2, at(4, s), { velocity: 40 });
    for (const s of [14, 15]) trig(spec, B01, 2, at(4, s), { condition: "2:2" });
    for (const s of [9, 11]) trig(spec, B01, 1, at(4, s), { condition: "1:2" });
    trig(spec, B01, 2, at(4, 14), { retrig: { rate: "1/32", length: 3, fade: 100 } });
    for (const s of [9, 11]) trig(spec, B01, 2, at(4, s), { condition: "FILL" });
    p.scale = "TRACK";
    const perc = track(spec, B01, 4);
    perc.length = 12;
    for (const s of [1, 4, 7, 10]) trig(spec, B01, 4, s);
    perc.chance = 30;
  },
  5(spec) {
    set(spec, B01, 1, { SWEEP: 0, CONTOUR: 0, COLOR: 0, SHAPE: 0, PITCH: bipolar(-2), DECAY: 52 });
    set(spec, B01, 2, { SHAPE: 30, COLOR: 0, SWEEP: 0, CONTOUR: 0, PITCH: bipolar(-2), DECAY: 30 });
  },
  6(spec) {
    copy(spec, B01, "B04");
    set(spec, "B04", 3, { SHAPE: 80, CONTOUR: 40, PITCH: bipolar(3) });
    set(spec, "B04", 1, { CONTOUR: 40 });
    set(spec, "B04", 2, { SHAPE: 70 });
    set(spec, "B04", 4, { SHAPE: 70, COLOR: 50 });
    set(spec, B01, 3, { PITCH: bipolar(-7), SHAPE: 20, CONTOUR: 0, DECAY: 14 });
    set(spec, B01, 4, { SHAPE: 20, COLOR: 5 });
  },
  7(spec) {
    set(spec, B01, 2, { DECAY: 40 });
    for (const s of [...bars(5), ...bars(13)])
      trig(spec, B01, 3, s, { velocity: 50, locks: { DECAY: 5, PITCH: 70, SHAPE: 90 } });
    set(spec, B01, 4, { PITCH: bipolar(12), DECAY: 8, COLOR: 90 });
  },
  8(spec) {
    set(spec, B01, 3, { "LFO DEST": DST.DECAY, "LFO DEPTH": bipolar(16), "LFO SPEED": bipolar(16) });
    set(spec, B01, 4, { "LFO DEST": DST.COLOR, "LFO DEPTH": bipolar(10), "LFO SPEED": bipolar(2) });
    // B04: a chord that fades in, then three speeds of an LFO
    trig(spec, "B04", 6, 1, { length: 8 });
    set(spec, "B04", 6, {
      "LFO WAVE": WAV.ENV,
      "LFO MULT": MUL.X1,
      "LFO DEST": DST.DIST,
      "LFO DEPTH": 0,
      "LFO SPEED": bipolar(8),
    });
    set(spec, "B04", 1, {
      "LFO DEST": DST.DIST,
      "LFO DEPTH": bipolar(-10),
      "LFO WAVE": WAV.TRI,
      "LFO MULT": MUL.X1,
      "LFO SPEED": bipolar(32),
    });
    set(spec, "B04", 5, {
      "LFO WAVE": WAV.TRI,
      "LFO DEST": DST.PITCH,
      "LFO DEPTH": bipolar(0),
      "LFO MULT": MUL["2K"],
      "LFO SPEED": bipolar(32),
    });
  },
  9(spec) {
    set(spec, B01, 5, { DECAY: 60, REVERB: 20 });
    track(spec, B01, 5).length = 16;
    trig(spec, B01, 5, 1);
    trig(spec, B01, 5, 4, { note: 63 });
    trig(spec, B01, 5, 7, { note: 67 });
    trig(spec, B01, 5, 11, { note: 65 });
  },
  10(spec) {
    copy(spec, B01, "B11");
    clear(spec, B01, 5);
    set(spec, B01, 5, { PITCH: bipolar(-24), SHAPE: 15, DECAY: 70 });
    trig(spec, B01, 5, 1, { length: 6 });
    trig(spec, B01, 5, 11);
    trig(spec, B01, 5, 15, { locks: { PITCH: bipolar(-12) } });
    grow(track(spec, B01, 5), 16, 64);
    [
      [2, 56],
      [3, 53],
      [4, 55],
    ].forEach(([bar, note]) => [1, 11, 15].forEach((s) => trig(spec, B01, 5, at(bar, s), { note })));
    trig(spec, B01, 5, at(4, 16), { note: 58 });
  },
  11(spec) {
    set(spec, B01, 6, { SHAPE: chord("m7"), DECAY: 110, REVERB: 60 });
    track(spec, B01, 6).length = 16;
    trig(spec, B01, 6, 1);
    grow(track(spec, B01, 6), 16, 64);
    trig(spec, B01, 6, at(2, 1), { note: 56, locks: { SHAPE: chord("Maj7") } });
    trig(spec, B01, 6, at(3, 1), { note: 53, locks: { SHAPE: chord("Major") } });
    trig(spec, B01, 6, at(4, 1), { note: 55 });
  },
  12(spec) {
    const melody = { locks: { SHAPE: chord("Unison x2"), PITCH: bipolar(12) } };
    const notes = { 9: undefined, 11: 63, 13: 62 };
    for (const bar of [2, 4])
      for (const [s, note] of Object.entries(notes))
        trig(spec, B01, 6, at(bar, Number(s)), note ? { ...melody, note } : melody);
    trig(spec, B01, 6, at(4, 15), { ...melody, condition: "2:2" });
    trig(spec, B01, 6, at(2, 15), { ...melody, note: 65, condition: "50%" });
  },
  13(spec) {
    const p = spec.patterns[B01];
    p.fx = { "REVERB SIZE": 89, "REVERB TONE": bipolar(20), "DELAY TIME": 23, "DELAY FEEDBACK": 26 };
    for (const t of [1, 2, 5]) set(spec, B01, t, { REVERB: 0, DELAY: 0 });
    set(spec, B01, 3, { REVERB: 30 });
    set(spec, B01, 6, { REVERB: 70 });
    trig(spec, B01, 2, at(4, 13), { locks: { DELAY: 100 } });
    trig(spec, B01, 2, at(2, 5), { locks: { REVERB: 110 } });
    // B04: a blurred chord
    set(spec, "B04", 6, {
      DELAY: 80,
      REVERB: 80,
      "LFO WAVE": WAV.RND,
      "LFO DEST": DST.DELAY,
      "LFO MULT": MUL["1K"],
      "LFO DEPTH": bipolar(40),
    });
  },
  14(spec) {
    // B10: a sketchpad with the sounds and no trigs
    copy(spec, B01, "B10");
    const pad = spec.patterns.B10;
    pad.scale = "PATTERN";
    pad.length = 16;
    for (const tr of Object.values(pad.tracks)) {
      tr.trigs = {};
      delete tr.length;
    }
    Object.entries({ 1: 110, 5: 100, 2: 90, 6: 85, 3: 75, 4: 70 }).forEach(
      ([t, level]) => (track(spec, B01, t).level = level)
    );
  },
  15(spec) {
    for (const slot of ["B05", "B06", "B07", "B08", "B09"]) copy(spec, B01, slot);
    for (const t of [1, 2, 4, 5]) clear(spec, "B05", t);
    const drift = {
      "LFO DEST": DST.COLOR,
      "LFO DEPTH": bipolar(10),
      "LFO WAVE": WAV.RND,
      "LFO MULT": MUL.X1,
      "LFO SPEED": bipolar(32),
    };
    set(spec, "B05", 6, drift);
    set(spec, "B05", 3, { "LFO DEST": DST.DECAY, "LFO WAVE": WAV.RND, "LFO SPEED": bipolar(24) });
    clear(spec, "B06", 4);
    track(spec, "B06", 3).chance = 60;
    set(spec, "B06", 6, { REVERB: 55 });
    for (const t of [1, 3, 4]) clear(spec, "B08", t);
    spec.patterns.B08.fx = { ...spec.patterns.B08.fx, "REVERB SIZE": 114 };
    for (const t of [1, 5]) clear(spec, "B09", t);
    set(spec, "B09", 6, { DECAY: 127, ...drift });
    spec.activePattern = "B05";
  },
};

/* The unit opens a loaded project on the pattern the lesson starts on. */
const START_SLOT = { 16: "B05" };

export const LAST_LESSON = 16;
/* lessons whose own changes make a finished project worth loading (lesson 16 performs, it saves nothing new) */
const DONE = Object.keys(LESSON_CHANGES).map(Number);

/** the course project after lesson n (0 = a new project) */
export function specAfter(n) {
  const spec = { patterns: {} };
  for (let k = 1; k <= n; k++) LESSON_CHANGES[k](spec);
  return spec;
}

/** -> [{ lesson, kind: "start" | "done", name (on the unit), file, spec }] for every file the course offers */
export function lessonProjects() {
  const out = [];
  for (let n = 1; n <= LAST_LESSON; n++) {
    if (n > 1) {
      const spec = specAfter(n - 1);
      spec.activePattern = START_SLOT[n] ?? "B01";
      out.push(entry(n, "start", spec));
    }
    if (DONE.includes(n)) out.push(entry(n, "done", specAfter(n)));
  }
  return out;
}

function entry(lesson, kind, spec) {
  const name = `LESSON ${lesson} ${kind.toUpperCase()}`;
  spec.name = name;
  spec.activePattern ??= "B01";
  // build specs key tracks and trigs by number and leave out empty parts
  for (const p of Object.values(spec.patterns))
    for (const [t, tr] of Object.entries(p.tracks)) {
      if (!Object.keys(tr.params).length) delete tr.params;
      if (!Object.keys(tr.trigs).length) delete tr.trigs;
      if (!Object.keys(tr).length) delete p.tracks[t];
    }
  return { lesson, kind, name, file: projectFile(lesson, kind), spec };
}

/** the download's path on the site */
export const projectFile = (lesson, kind) =>
  `/projects/model-cycles/lesson-${String(lesson).padStart(2, "0")}-${kind}.mcprj`;

/** the files a lesson offers: { start?, done? } paths */
export function lessonFiles(number) {
  if (!number || number > LAST_LESSON) return {};
  return {
    ...(number > 1 && { start: projectFile(number, "start") }),
    ...(DONE.includes(number) && { done: projectFile(number, "done") }),
  };
}
