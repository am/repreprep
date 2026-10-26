// Field map of a decompressed Model:Cycles project. Offsets were worked out by
// diffing exports with one known change each; see FORMAT.md. Values on the
// unit are 0-127 unless noted, stored in the high byte of a big-endian u16.
import { readZip, writeZip } from "./zip.mjs";
import { pack, unpack } from "./payload.mjs";

export const PATTERN_BASE = 0x200;
export const PATTERN_SIZE = 14848;
export const TRACK_SIZE = 722;
export const LANES = 80;
export const LANE_SIZE = 130;
export const SETTINGS = 4 + 6 * TRACK_SIZE + LANES * LANE_SIZE; // pattern-relative
export const KIT_BASE = 0x15c1fc;
export const KIT_SIZE = 0x1e00;
export const SOUND_SIZE = 100;
export const PROJECT_BASE = KIT_BASE + 96 * KIT_SIZE;
export const RAW_SIZE = 2163716; // project settings run to the end

export const MACHINES = ["KICK", "SNARE", "METAL", "PERC", "TONE", "CHORD"];
export const SPEEDS = ["2x", "3/2x", "1x", "3/4x", "1/2x", "1/4x", "1/8x"];
/** Sound words; the same numbers name the parameter of a lock lane. */
export const PARAMS = {
  1: "LFO SPEED", // bipolar, 64 = 0
  2: "LFO MULT", // 4 = X16 (default), 5 = X32
  4: "LFO DEST",
  5: "LFO WAVE",
  8: "LFO DEPTH", // bipolar, 64 = 0
  9: "MACHINE",
  10: "PITCH", // 64 = 0, one step per semitone
  11: "COLOR",
  12: "SHAPE",
  13: "SWEEP",
  14: "CONTOUR",
  19: "DECAY",
  20: "VOLUME+DIST",
  21: "DELAY",
  22: "REVERB",
};
export const PARAM_IDS = Object.fromEntries(Object.entries(PARAMS).map(([id, name]) => [name, Number(id)]));
export const FX = ["DELAY TIME", "DELAY FEEDBACK", "REVERB SIZE", "REVERB TONE"];

const FIXED_CONDITIONS = ["FILL", "!FILL", "PRE", "!PRE", "NEI", "!NEI", "1ST", "!1ST"];
const CHANCES = [1, 2, 4, 6, 9, 13, 19, 25, 33, 41, 50, 59, 67, 75, 81, 87, 91, 94, 96, 98, 99];
const AB = [];
for (let b = 2; b <= 8; b++) for (let a = 1; a <= b; a++) AB.push(`${a}:${b}`);
export const CONDITIONS = [...FIXED_CONDITIONS, ...CHANCES.map((c) => `${c}%`), ...AB];
export const RETRIG_RATES = [
  "1/1",
  "1/2",
  "1/3",
  "1/4",
  "1/5",
  "1/6",
  "1/8",
  "1/10",
  "1/12",
  "1/16",
  "1/20",
  "1/24",
  "1/32",
  "1/40",
  "1/48",
  "1/64",
  "1/80",
];

/** Length code (trig LEN, retrig LEN) -> steps; 127 = "INF". 14 = 1.0, 66 = 10.0. */
export function stepsFromLength(v) {
  if (v === 127) return "INF";
  const ranges = [
    [0, 0.125, 1 / 16],
    [30, 2, 0.125],
    [46, 4, 0.25],
    [62, 8, 0.5],
    [78, 16, 1],
    [94, 32, 2],
    [110, 64, 4],
  ];
  for (let r = ranges.length - 1; r >= 0; r--) {
    const [base, start, step] = ranges[r];
    if (v >= base) return start + (v - base) * step;
  }
}

export function lengthFromSteps(steps) {
  for (let v = 0; v < 128; v++) if (stepsFromLength(v) === steps) return v;
  throw new Error(`no length code for ${steps} steps`);
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/** MIDI note -> name as the unit shows it (60 = C5). */
export const noteName = (n) => NOTE_NAMES[n % 12] + Math.floor(n / 12);
export function noteNumber(name) {
  if (typeof name === "number") return name;
  const m = /^([A-G]#?)(-?\d+)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return NOTE_NAMES.indexOf(m[1]) + 12 * Number(m[2]);
}

export const patternName = (i) => "ABCDEF"[Math.floor(i / 16)] + String((i % 16) + 1).padStart(2, "0");
export function patternIndex(name) {
  const m = /^([A-F])(\d\d?)$/.exec(name);
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 16) throw new Error(`bad pattern ${name}, use A01 to F16`);
  return "ABCDEF".indexOf(m[1]) * 16 + Number(m[2]) - 1;
}

/** A window onto the project's bytes. */
class View {
  constructor(raw, base) {
    this.raw = raw;
    this.base = base;
  }
  u8(o) {
    return this.raw[this.base + o];
  }
  set8(o, v) {
    this.raw[this.base + o] = v;
  }
  u16(o) {
    return (this.raw[this.base + o] << 8) | this.raw[this.base + o + 1];
  }
  set16(o, v) {
    this.raw[this.base + o] = v >> 8;
    this.raw[this.base + o + 1] = v & 255;
  }
  text(o, n) {
    const bytes = this.raw.subarray(this.base + o, this.base + o + n);
    const end = bytes.indexOf(0);
    return new TextDecoder("latin1").decode(end < 0 ? bytes : bytes.subarray(0, end));
  }
  setText(o, n, s) {
    if (!/^[\x20-\x7e]*$/.test(s)) throw new Error(`names are plain ASCII: ${s}`);
    for (let k = 0; k < n; k++) this.raw[this.base + o + k] = k < Math.min(s.length, n - 1) ? s.charCodeAt(k) : 0;
  }
}

// Step flags (u16 per step)
export const TRIG = 0x0001;
const TRIG_SET = 0x0280; // always set with a trig, cleared with it
const RETRIG = 0x8000;
const DEFAULT_FLAGS = 0x0010; // set on even steps in a new pattern; meaning unknown

// Per-step lanes (64 bytes each, track-relative). 0xFF = use the track default.
const NOTE = 128,
  VEL = 192,
  LEN = 256,
  MICRO = 320,
  COND = 384,
  RTRG_LEN = 512,
  RTRG_RATE = 576,
  RTRG_FADE = 640;
const DEFAULTS = 704; // +1 retrig len, +2 retrig rate, +3 fade, +4 note, +5 vel, +6 trig len, +10 length, +14 swing

export class Track extends View {
  flags(s) {
    return this.u16(2 * s);
  }
  trig(s) {
    return Boolean(this.flags(s) & TRIG);
  }
  setTrig(s, on = true) {
    const f = this.flags(s);
    this.set16(2 * s, on ? f | TRIG | TRIG_SET : f & ~(TRIG | TRIG_SET | RETRIG));
    if (on && this.u8(NOTE + s) === 0x3c) this.set8(NOTE + s, 0xff);
  }
  /** MIDI note, or null for the track's note */
  note(s) {
    const v = this.u8(NOTE + s);
    return v === 0xff || v === 0x3c ? null : v;
  }
  setNote(s, n) {
    this.set8(NOTE + s, n == null ? 0xff : noteNumber(n));
  }
  velocity(s) {
    const v = this.u8(VEL + s);
    return v === 0xff ? null : v;
  }
  setVelocity(s, v) {
    this.set8(VEL + s, v == null ? 0xff : v);
  }
  /** trig length in steps, or null for the track's */
  length(s) {
    const v = this.u8(LEN + s);
    return v === 0xff ? null : stepsFromLength(v);
  }
  setLength(s, steps) {
    this.set8(LEN + s, steps == null ? 0xff : lengthFromSteps(steps));
  }
  /** 0 on the grid, 23 = latest */
  micro(s) {
    return this.u8(MICRO + s);
  }
  setMicro(s, v) {
    this.set8(MICRO + s, v);
  }
  condition(s) {
    const v = this.u8(COND + s);
    return v === 0xff ? null : (CONDITIONS[v] ?? v);
  }
  setCondition(s, name) {
    if (name == null) return this.set8(COND + s, 0xff);
    const v = CONDITIONS.indexOf(name);
    if (v < 0) throw new Error(`unknown trig condition ${name}`);
    this.set8(COND + s, v);
  }
  retrig(s) {
    if (!(this.flags(s) & RETRIG)) return null;
    return {
      rate: RETRIG_RATES[this.u8(RTRG_RATE + s)],
      length: stepsFromLength(this.u8(RTRG_LEN + s)),
      fade: this.u8(RTRG_FADE + s),
    };
  }
  setRetrig(s, r) {
    const f = this.flags(s);
    if (!r) return this.set16(2 * s, f & ~RETRIG);
    this.set16(2 * s, f | RETRIG);
    this.set8(RTRG_RATE + s, RETRIG_RATES.indexOf(r.rate ?? "1/16"));
    this.set8(RTRG_LEN + s, lengthFromSteps(r.length ?? 4));
    this.set8(RTRG_FADE + s, r.fade ?? 0);
  }
  get stepCount() {
    return this.u8(DEFAULTS + 10);
  }
  set stepCount(n) {
    this.set8(DEFAULTS + 10, n);
  }
  /** 0-30 above 50%: 8 = 58% */
  get swing() {
    return this.u8(DEFAULTS + 14);
  }
  set swing(v) {
    this.set8(DEFAULTS + 14, v);
  }
  isDefault(s) {
    return (
      (this.flags(s) & ~DEFAULT_FLAGS) === 0 &&
      this.note(s) === null &&
      this.velocity(s) === null &&
      this.length(s) === null &&
      this.micro(s) === 0 &&
      this.condition(s) === null
    );
  }
  stepJSON(s) {
    const d = { step: s + 1 };
    if (this.trig(s)) d.trig = true;
    for (const [k, v] of [
      ["note", this.note(s) === null ? null : noteName(this.note(s))],
      ["velocity", this.velocity(s)],
      ["length", this.length(s)],
      ["micro", this.micro(s) || null],
      ["condition", this.condition(s)],
      ["retrig", this.retrig(s)],
    ])
      if (v !== null) d[k] = v;
    return d;
  }
  toJSON() {
    const steps = [];
    for (let s = 0; s < 64; s++) if (!this.isDefault(s)) steps.push(this.stepJSON(s));
    return { length: this.stepCount, swing: 50 + this.swing, steps };
  }
}

export class Sound extends View {
  word(w) {
    return this.u8(28 + 2 * w);
  }
  setWord(w, v) {
    this.set8(28 + 2 * w, v);
  }
  get name() {
    return this.text(12, 16);
  }
  get machine() {
    return MACHINES[this.word(9)] ?? this.word(9); // other numbers come from Modded Cycles machines
  }
  set machine(m) {
    const v = MACHINES.indexOf(m);
    if (v < 0) throw new Error(`unknown machine ${m}`);
    this.setWord(9, v);
  }
  param(name) {
    return this.word(paramId(name));
  }
  setParam(name, v) {
    this.setWord(paramId(name), v);
  }
  /** PAD menu VDEP: 127 in a new project */
  get vdep() {
    return this.u8(95);
  }
  set vdep(v) {
    this.set8(95, v);
  }
  toJSON() {
    const d = { name: this.name, machine: this.machine };
    for (const [w, n] of Object.entries(PARAMS)) if (n !== "MACHINE") d[n] = this.word(Number(w));
    d.VDEP = this.vdep;
    return d;
  }
}

function paramId(name) {
  const id = typeof name === "number" ? name : PARAM_IDS[name];
  if (id === undefined) throw new Error(`unknown parameter ${name}; known: ${Object.values(PARAMS).join(", ")}`);
  return id;
}

export class Kit extends View {
  constructor(raw, index) {
    super(raw, KIT_BASE + index * KIT_SIZE);
    this.sounds = [0, 1, 2, 3, 4, 5].map((s) => new Sound(raw, this.base + 36 + s * SOUND_SIZE));
  }
  get name() {
    return this.text(8, 16);
  }
  set name(s) {
    this.setText(8, 16, s);
  }
  /** track 1-6, 100 by default */
  level(t) {
    return this.u8(24 + 2 * (t - 1));
  }
  setLevel(t, v) {
    this.set8(24 + 2 * (t - 1), v);
  }
  fx() {
    return Object.fromEntries(FX.map((n, i) => [n, this.u8(642 + 2 * i)]));
  }
  setFx(name, v) {
    const i = FX.indexOf(name);
    if (i < 0) throw new Error(`unknown FX setting ${name}`);
    this.set8(642 + 2 * i, v);
  }
  toJSON() {
    return {
      name: this.name,
      levels: [1, 2, 3, 4, 5, 6].map((t) => this.level(t)),
      fx: this.fx(),
      sounds: this.sounds.map((s) => s.toJSON()),
    };
  }
}

export class Pattern extends View {
  constructor(raw, index) {
    super(raw, PATTERN_BASE + index * PATTERN_SIZE);
    this.index = index;
    this.tracks = [0, 1, 2, 3, 4, 5].map((t) => new Track(raw, this.base + 4 + t * TRACK_SIZE));
    this.kit = new Kit(raw, index);
  }
  get name() {
    return patternName(this.index);
  }
  /** set with PATTERN > RENAME on the unit */
  get title() {
    return this.text(SETTINGS, 16);
  }
  set title(s) {
    this.setText(SETTINGS, 16, s);
  }
  get tempo() {
    return this.u16(SETTINGS + 18) / 120;
  }
  set tempo(bpm) {
    this.set16(SETTINGS + 18, Math.round(bpm * 120));
  }
  get length() {
    return this.u16(SETTINGS + 20);
  }
  /** sets the pattern and every track to n steps */
  set length(n) {
    this.set16(SETTINGS + 20, n);
    for (const t of this.tracks) t.stepCount = n;
  }
  get speed() {
    return SPEEDS[this.u8(SETTINGS + 26)];
  }
  set speed(s) {
    const v = SPEEDS.indexOf(s);
    if (v < 0) throw new Error(`unknown speed ${s}`);
    this.set8(SETTINGS + 26, v);
  }
  #lane(k) {
    return 4 + 6 * TRACK_SIZE + k * LANE_SIZE;
  }
  /** parameter locks: [{ track 1-6, param, steps: { step: value } }] */
  locks() {
    const out = [];
    for (let k = 0; k < LANES; k++) {
      const o = this.#lane(k);
      if (this.u8(o) === 0xff && this.u8(o + 1) === 0xff) continue;
      const steps = {};
      for (let s = 0; s < 64; s++) if (this.u16(o + 2 + 2 * s) !== 0xffff) steps[s + 1] = this.u8(o + 2 + 2 * s);
      out.push({ track: this.u8(o + 1) + 1, param: PARAMS[this.u8(o)] ?? this.u8(o), steps });
    }
    return out;
  }
  /** lock `param` on track 1-6, step 1-64 */
  setLock(track, param, step, value) {
    const id = paramId(param);
    let lane = -1;
    let free = -1;
    for (let k = 0; k < LANES && lane < 0; k++) {
      const o = this.#lane(k);
      if (this.u8(o) === id && this.u8(o + 1) === track - 1) lane = o;
      else if (free < 0 && this.u8(o) === 0xff && this.u8(o + 1) === 0xff) free = o;
    }
    if (lane < 0) {
      if (free < 0) throw new Error("all 80 lock lanes are in use");
      lane = free;
      this.set8(lane, id);
      this.set8(lane + 1, track - 1);
      for (let s = 0; s < 64; s++) this.set16(lane + 2 + 2 * s, 0xffff);
    }
    this.set16(lane + 2 + 2 * (step - 1), value << 8);
  }
  isEmpty() {
    return this.tracks.every((t) => [...Array(64).keys()].every((s) => !t.trig(s))) && this.locks().length === 0;
  }
  toJSON() {
    const tracks = {};
    this.tracks.forEach((t, i) => {
      const j = t.toJSON();
      if (j.steps.length) tracks[i + 1] = j;
    });
    return {
      pattern: this.name,
      title: this.title,
      tempo: this.tempo,
      length: this.length,
      speed: this.speed,
      tracks,
      locks: this.locks(),
      kit: this.kit.toJSON(),
    };
  }
}

export class Project {
  constructor(manifest, header, raw) {
    if (raw.length !== RAW_SIZE) throw new Error(`unexpected payload size ${raw.length}`);
    this.manifest = manifest;
    this.header = header;
    this.raw = raw;
    this.settings = new View(raw, PROJECT_BASE);
  }
  /** bytes of a .mcprj file -> Project */
  static parse(bytes) {
    const files = readZip(bytes);
    const manifest = JSON.parse(new TextDecoder().decode(files.get("manifest.json")));
    if (manifest.FileType !== "Project") throw new Error(`not a project export (${manifest.FileType})`);
    const { header, raw } = unpack(files.get(manifest.Payload));
    return new Project(manifest, header, raw);
  }
  /** -> bytes of a .mcprj file the unit (through Elektron Transfer) accepts */
  toBytes() {
    // the unit writes the manifest with CRLF and two-space indents
    const manifest = JSON.stringify(this.manifest, null, 2).replace(/\n/g, "\r\n");
    return writeZip([
      ["manifest.json", new TextEncoder().encode(manifest)],
      [this.manifest.Payload, pack(this.header, this.raw)],
    ]);
  }
  get name() {
    return new View(this.raw, 0).text(8, 16);
  }
  /** also renames the file entry inside the export */
  set name(s) {
    new View(this.raw, 0).setText(8, 16, s);
    this.manifest.Payload = s;
  }
  pattern(nameOrIndex) {
    return new Pattern(this.raw, typeof nameOrIndex === "number" ? nameOrIndex : patternIndex(nameOrIndex));
  }
  patterns() {
    return [...Array(96).keys()].map((i) => this.pattern(i));
  }
  get tempo() {
    return this.settings.u16(8) / 120;
  }
  set tempo(bpm) {
    this.settings.set16(8, Math.round(bpm * 120));
  }
  get activePattern() {
    return patternName(this.settings.u8(13));
  }
  set activePattern(name) {
    this.settings.set8(13, patternIndex(name));
  }
  get muted() {
    return [1, 2, 3, 4, 5, 6].filter((t) => (this.settings.u8(15) >> (t - 1)) & 1);
  }
  set muted(tracks) {
    this.settings.set8(
      15,
      tracks.reduce((m, t) => m | (1 << (t - 1)), 0)
    );
  }
  /** MIDI IN channel per track, 1-16 */
  midiIn() {
    return [0, 1, 2, 3, 4, 5].map((t) => this.settings.u8(27 + t) + 1);
  }
  /** Reset a pattern and its kit to the state of `source` (another Project's untouched pattern). */
  clearPattern(index, source = this) {
    const from = source.pattern(source.patterns().findIndex((p) => p.isEmpty() && !p.kit.name));
    const to = this.pattern(index);
    this.raw.set(source.raw.subarray(from.base, from.base + PATTERN_SIZE), to.base);
    this.raw[to.base + SETTINGS + 28] = index; // the pattern's own index
    this.raw.set(source.raw.subarray(from.kit.base, from.kit.base + KIT_SIZE), to.kit.base);
  }
  toJSON({ all = false } = {}) {
    return {
      name: this.name,
      firmware: this.manifest.FirmwareVersion,
      tempo: this.tempo,
      activePattern: this.activePattern,
      muted: this.muted,
      midiIn: this.midiIn(),
      patterns: this.patterns()
        .filter((p) => all || !p.isEmpty() || p.kit.name || p.title)
        .map((p) => p.toJSON()),
    };
  }
}
