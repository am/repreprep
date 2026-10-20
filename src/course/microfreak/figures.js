import { svgFig, T } from "../shared/html.js";

/* ---- The MicroFreak course's own drawings, in lesson order. Shared theory drawings (harmonics, ADSR,
   the 12 notes…) live with the Model:Cycles figures and are used through src/course/concepts.js. ---- */

const P = (pts) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
const stroke = (c, w = 3) =>
  `style="fill:none;stroke:${c};stroke-width:${w};stroke-linejoin:round;stroke-linecap:round"`;
const fill = (c, line = "var(--line)") => `style="fill:${c};stroke:${line};stroke-width:1.5"`;
const box = (x, y, w, h, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="box" ${extra}/>`;
const rect = (x, y, w, h, c, rx = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${fill(c)}/>`;
const line = (x1, y1, x2, y2, cls = "ln") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
/* a line with an arrowhead at its end */
const arrow = (x1, y1, x2, y2, c = "var(--turn)", w = 2.5) => {
  const a = Math.atan2(y2 - y1, x2 - x1),
    h = 10;
  const p1 = [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)],
    p2 = [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)];
  return `<path d="M${x1} ${y1}L${x2} ${y2}" ${stroke(c, w)}/><path d="${P([p1, [x2, y2], p2])}Z" style="fill:${c};stroke:${c}"/>`;
};

/* one value (-1..1) of a waveform at phase p */
const rnd = [0.55, -0.35, 0.85, -0.7, 0.2, 0.65, -0.9, 0.4, -0.15, 0.75, -0.55, 0.3];
const wv = (type, p) => {
  const f = p - Math.floor(p);
  if (type === "sine") return Math.sin(2 * Math.PI * f);
  if (type === "tri") return f < 0.25 ? f * 4 : f < 0.75 ? 2 - f * 4 : f * 4 - 4;
  if (type === "square") return f < 0.5 ? 1 : -1;
  if (type === "saw") return 1 - 2 * f;
  if (type === "rand") return rnd[Math.floor(p) % rnd.length];
  if (type === "saw2") return (1 - 2 * f + (1 - 2 * ((f + 0.5) % 1)) * 0.8) / 1.8;
  return 0;
};
/* a waveform from x over width w, centred on y, amplitude a, n cycles; amp(t) scales it along the way */
const wave = (x, y, w, a, n, type, amp = () => 1, N = 400) => {
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([x + w * t, y - a * amp(t) * wv(type, Math.max(0, t * n - 1e-9))]);
  }
  return P(pts);
};
/* an ADSR-style outline: attack, decay, sustain level (0..1), hold time, release, starting at x on baseline y */
const adsr = (x, y, h, A, D, S, H, R) =>
  P([
    [x, y],
    [x + A, y - h],
    [x + A + D, y - h * S],
    [x + A + D + H, y - h * S],
    [x + A + D + H + R, y],
  ]);
/* a short piano keyboard: n white keys from C, of width kw, at x,y; lit maps a key index (0 = C) to a colour */
const WHITE_SEMI = [0, 2, 4, 5, 7, 9, 11];
const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const keyboard = (x, y, n, kw, h, lit = {}, names = true) => {
  let s = "";
  for (let i = 0; i < n; i++) {
    const semi = WHITE_SEMI[i % 7] + 12 * Math.floor(i / 7);
    s += rect(x + i * kw, y, kw, h, lit[semi] || "var(--surface)", 4);
    if (names) s += T(x + i * kw + kw / 2, y + h - 12, NAMES[semi % 12], lit[semi] ? "fbar" : "fs");
  }
  for (let i = 0; i < n - 1; i++) {
    const semi = WHITE_SEMI[i % 7] + 12 * Math.floor(i / 7);
    if ([0, 2, 5, 7, 9].includes(semi % 12))
      s += rect(x + (i + 1) * kw - kw * 0.3, y, kw * 0.6, h * 0.6, lit[semi + 1] || "var(--faint)", 3);
  }
  return s;
};

export const MF_FIGS = {
  /* lesson 1 */
  "mf-chain"() {
    let s = T(400, 36, "Every synth: a tone, its colour, its loudness", "fh");
    const parts = [
      ["Oscillator", "makes the raw tone", "Digital Oscillator", "var(--led)"],
      ["Filter", "shapes its colour", "Analog Filter", "var(--turn)"],
      ["Amplifier", "shapes its loudness", "Envelope", "var(--hold)"],
    ];
    parts.forEach(([h, a, b, c], i) => {
      const x = 30 + i * 260;
      s +=
        box(x, 70, 210, 200) +
        T(x + 105, 102, h, "fl") +
        T(x + 105, 124, a, "fm") +
        T(x + 105, 258, `on the panel: ${b}`, "fs");
      if (i === 0) s += `<path d="${wave(x + 25, 185, 160, 40, 4, "saw")}" ${stroke(c)}/>`;
      if (i === 1) s += `<path d="${wave(x + 25, 185, 160, 34, 4, "sine")}" ${stroke(c)}/>`;
      if (i === 2)
        s += `<path d="${wave(x + 25, 185, 160, 40, 8, "sine", (t) => (t < 0.08 ? t / 0.08 : Math.exp(-(t - 0.08) * 3)))}" ${stroke(c)}/>`;
      if (i < 2) s += arrow(x + 214, 170, x + 254, 170);
    });
    s +=
      T(155, 310, "bright, buzzy", "fs") +
      T(415, 310, "darker, rounder", "fs") +
      T(675, 310, "rises, then fades", "fs");
    s += T(400, 370, "The envelope moves the amplifier, and can move the filter too.", "fb");
    return svgFig("0 0 800 400", s, "Oscillator, then filter, then amplifier, with the envelope shaping the loudness");
  },
  "mf-keyboard"() {
    let s = T(400, 36, "25 keys: C up to C, two octaves higher", "fh");
    const kw = 48,
      x0 = 400 - (15 * kw) / 2;
    s += keyboard(x0, 80, 15, kw, 200, { 9: "var(--led)", 21: "var(--led)" });
    // groups of black keys, first octave
    s += `<path d="M${x0 + kw * 0.7} 70v-8H${x0 + kw * 2.3}v8" class="ln"/>` + T(x0 + kw * 1.5, 56, "2 black", "fs");
    s += `<path d="M${x0 + kw * 3.7} 70v-8H${x0 + kw * 6.3}v8" class="ln"/>` + T(x0 + kw * 5, 56, "3 black", "fs");
    s +=
      T(x0 + kw * 5.5, 312, "A: between the 2nd and 3rd", "fm") + T(x0 + kw * 5.5, 330, "black key of the three", "fm");
    s += T(x0 + kw * 12.5, 312, "the next A, an octave up", "fm");
    s += T(x0 + kw * 0.5, 312, "lowest C", "fm");
    s += T(400, 380, "The Octave buttons move all 25 keys up or down without changing their pattern.", "fb");
    return svgFig("0 0 800 400", s, "The MicroFreak's 25 keys, with both A keys marked");
  },
  /* lesson 2 */
  "mf-basicwaves"() {
    let s = T(400, 36, "Basic Waves: what Wave and Shape do", "fh");
    [
      ["Wave left", "square", "square", "hollow"],
      ["Wave middle", "saw", "saw", "bright, buzzy"],
      ["Wave right", "two saws", "saw2", "brighter, thinner"],
    ].forEach(([h, a, type, b], i) => {
      const x = 30 + i * 255;
      s += box(x, 64, 230, 170) + T(x + 115, 92, h, "fl") + T(x + 115, 112, a, "fm");
      s += `<path d="${wave(x + 25, 170, 180, 34, 3, type)}" ${stroke("var(--led)")}/>` + T(x + 115, 222, b, "fs");
    });
    s += box(30, 254, 740, 120) + T(60, 284, "Shape: adds a sine an octave below", "fl", "start");
    s += `<path d="${wave(60, 330, 320, 22, 4, "saw")}" ${stroke("var(--led)")}/>` + T(400, 335, "+", "fl");
    s += `<path d="${wave(430, 330, 320, 22, 2, "sine")}" ${stroke("var(--turn)")}/>`;
    s += T(590, 366, "half as fast: one octave lower, for weight", "fs");
    return svgFig("0 0 800 390", s, "The Wave knob morphs square, saw and two saws; Shape adds a sub sine");
  },
  "mf-filter"() {
    let s = T(400, 36, "A low-pass filter: harmonics above the cutoff fade", "fh");
    const x0 = 80,
      y0 = 320,
      W = 640;
    s +=
      line(x0, y0, x0 + W, y0) +
      T(x0 + W, y0 + 26, "higher harmonics →", "fs", "end") +
      T(x0, y0 + 26, "the note", "fs", "start");
    const cut = 0.45;
    const resp = (t) => {
      const r = t / cut;
      const base = 1 / Math.sqrt(1 + Math.pow(r, 4));
      return Math.min(1.6, base * (1 + 0.9 * Math.exp(-Math.pow((r - 1) * 5, 2))));
    };
    for (let i = 1; i <= 16; i++) {
      const t = (i - 0.5) / 16,
        h = (200 / i) * resp(t) + 6;
      const x = x0 + t * W;
      s += `<rect x="${x - 9}" y="${y0 - h}" width="18" height="${h}" rx="3" style="fill:var(--led-soft);stroke:var(--led)"/>`;
    }
    const pts = [];
    for (let i = 0; i <= 200; i++) pts.push([x0 + (i / 200) * W, y0 - 150 * resp(i / 200)]);
    s += `<path d="${P(pts)}" ${stroke("var(--turn)", 3.5)}/>`;
    const cx = x0 + cut * W;
    s += `<path d="M${cx} 70V${y0}" class="mark"/>` + T(cx, 62, "Cutoff", "fl");
    s += T(cx + 70, 96, "Resonance: a boost", "fm", "start") + T(cx + 70, 114, "right at the cutoff", "fm", "start");
    s += arrow(cx + 66, 104, cx + 18, y0 - 205);
    s += T(x0 + 10, 96, "passes", "fm", "start") + T(x0 + W - 10, 280, "cut", "fm", "end");
    return svgFig("0 0 800 360", s, "Harmonics under a low-pass filter curve with a resonant peak at the cutoff");
  },
  "mf-filtertypes"() {
    let s = T(400, 36, "Three filter types: which part they keep", "fh");
    const curves = {
      LPF: (t) => 1 / Math.sqrt(1 + Math.pow(t / 0.4, 4)),
      BPF: (t) => Math.exp(-Math.pow((t - 0.5) * 4.5, 2)),
      HPF: (t) => 1 / Math.sqrt(1 + Math.pow(0.6 / Math.max(t, 0.01), 4)),
    };
    [
      ["LPF", "low pass", "keeps the lows: darker"],
      ["BPF", "band pass", "keeps the middle: like a phone"],
      ["HPF", "high pass", "keeps the highs: thinner"],
    ].forEach(([k, h, b], i) => {
      const x = 30 + i * 255,
        y0 = 250,
        w = 190;
      s += box(x, 64, 230, 260) + T(x + 115, 94, `${k}: ${h}`, "fl");
      const pts = [];
      for (let j = 0; j <= 100; j++) pts.push([x + 20 + (j / 100) * w, y0 - 120 * curves[k](j / 100)]);
      s += `<path d="${P([...pts, [x + 20 + w, y0], [x + 20, y0]])}Z" style="fill:var(--turn-soft);stroke:none"/>`;
      s += `<path d="${P(pts)}" ${stroke("var(--turn)")}/>` + line(x + 20, y0, x + 20 + w, y0);
      s +=
        T(x + 20, y0 + 20, "low", "fs", "start") +
        T(x + 20 + w, y0 + 20, "high", "fs", "end") +
        T(x + 115, 304, b, "fm");
    });
    s += T(
      400,
      356,
      "The MicroFreak's filter is gentle (12 dB): it fades the cut part rather than chopping it off.",
      "fb"
    );
    return svgFig("0 0 800 370", s, "Low-pass, band-pass and high-pass filter curves");
  },
  /* lesson 3 */
  "mf-ampmod"() {
    let s = T(400, 36, "One envelope, two jobs", "fh");
    [
      ["Amp Mod lit", "the envelope shapes the volume", true],
      ["Amp Mod off", "volume just on and off with the key", false],
    ].forEach(([h, b, on], i) => {
      const x = 30 + i * 385,
        y0 = 260;
      s += box(x, 64, 355, 290) + T(x + 177, 94, h, "fl") + T(x + 177, 116, b, "fm");
      s +=
        `<rect x="${x + 40}" y="${y0 + 18}" width="200" height="12" rx="4" style="fill:var(--hold-soft);stroke:var(--hold)"/>` +
        T(x + 140, y0 + 50, "key held", "fs");
      const vol = on
        ? adsr(x + 40, y0, 110, 20, 50, 0.55, 130, 70)
        : P([
            [x + 40, y0],
            [x + 40, y0 - 110],
            [x + 240, y0 - 110],
            [x + 240, y0],
          ]);
      s += `<path d="${vol}" ${stroke("var(--led)", 3.5)}/>`;
      if (!on)
        s +=
          `<path d="${adsr(x + 40, y0, 80, 20, 50, 0.5, 130, 70)}" ${stroke("var(--turn)", 2.5)} stroke-dasharray="6 5"/>` +
          T(x + 300, y0 - 30, "filter only", "fs");
      s += T(x + 300, y0 - (on ? 70 : 115), "volume", "fs");
    });
    s += T(400, 390, "Filter Amt sets how far the same envelope moves the filter, in both cases.", "fb");
    return svgFig("0 0 800 400", s, "With Amp Mod on the envelope shapes volume; off, volume follows the key");
  },
  "mf-filteramt"() {
    let s = T(400, 36, "Two knobs to look at closely", "fh");
    const x = 30,
      y0 = 270;
    s += box(x, 64, 400, 300) + T(x + 200, 94, "Decay/Rel: one knob, two times", "fl");
    s += `<path d="${adsr(x + 40, y0, 130, 30, 90, 0.5, 110, 90)}" ${stroke("var(--led)", 3.5)}/>`;
    s += `<path d="M${x + 70} ${y0 + 20}h90" ${stroke("var(--turn)")}/>` + T(x + 115, y0 + 40, "decay", "fs");
    s += `<path d="M${x + 270} ${y0 + 20}h90" ${stroke("var(--turn)")}/>` + T(x + 315, y0 + 40, "release", "fs");
    s += T(x + 200, y0 + 70, "the same length, set together", "fm");
    const kx = 610,
      ky = 210;
    s += box(460, 64, 310, 300) + T(615, 94, "Filter Amt: starts in the middle", "fl");
    s += `<path d="M${kx - 60} ${ky + 48}A78 78 0 1 1 ${kx + 60} ${ky + 48}" ${stroke("var(--faint)", 6)}/>`;
    s += `<circle cx="${kx}" cy="${ky}" r="40" style="fill:var(--surface-2);stroke:var(--line)"/><path d="M${kx} ${ky - 36}V${ky - 14}" ${stroke("var(--fg)", 4)}/>`;
    s +=
      T(kx - 92, ky + 80, "left: closes", "fm") +
      T(kx, ky - 92, "middle: none", "fm") +
      T(kx + 92, ky + 80, "right: opens", "fm");
    s += T(615, 340, "fully left, a closed filter can go silent", "fs");
    return svgFig(
      "0 0 800 380",
      s,
      "Decay and release share one knob; Filter Amt opens right and closes left of the middle"
    );
  },
  "mf-shapes"() {
    let s = T(400, 36, "Every instrument has its own shape", "fh");
    [
      ["Pluck", "instant attack, short decay, no sustain", [0, 50, 0, 0, 30]],
      ["Organ", "straight on, straight off", [0, 0, 1, 170, 0]],
      ["Strings and pads", "slow attack, long release", [60, 20, 0.8, 40, 60]],
    ].forEach(([h, b, [A, D, S, H, R]], i) => {
      const x = 30 + i * 255,
        y0 = 250;
      s += box(x, 64, 230, 260) + T(x + 115, 94, h, "fl");
      s +=
        `<path d="${adsr(x + 25, y0, 120, A, D, S, H, R)}" ${stroke("var(--led)", 3.5)}/>` +
        line(x + 20, y0, x + 210, y0);
      s += T(x + 115, 290, b, "fs");
    });
    s += T(400, 356, "All three come from the same four knobs: Attack, Decay/Rel, Sustain and Amp Mod.", "fb");
    return svgFig("0 0 800 370", s, "Envelope shapes of a pluck, an organ and a pad");
  },
  /* lesson 4 */
  "mf-roles"() {
    let s = T(400, 36, "One job per sound", "fh");
    const y = 200;
    s += line(60, y + 60, 740, y + 60) + T(60, y + 84, "low", "fs", "start") + T(740, y + 84, "high", "fs", "end");
    [
      ["RR Bass", "holds the low end", 60, 250, "var(--led)"],
      ["RR Pad", "fills the middle", 230, 330, "var(--turn)"],
      ["RR Pluck", "sits on top", 520, 220, "var(--hold)"],
    ].forEach(([h, b, x, w, c], i) => {
      const yy = 90 + i * 40;
      s += `<rect x="${x}" y="${yy}" width="${w}" height="${y + 50 - yy}" rx="10" style="fill:${c};opacity:0.22"/>`;
      s +=
        `<rect x="${x}" y="${yy}" width="${w}" height="30" rx="8" style="fill:${c}"/>` +
        T(x + 14, yy + 20, `${h}: ${b}`, "fbar", "start");
    });
    s += T(400, 330, "Where they overlap, turn one down or darken it, so each keeps its own range.", "fb");
    return svgFig("0 0 800 350", s, "Bass, pad and pluck each own a range from low to high");
  },
  "mf-questions"() {
    let s = T(400, 36, "Design a sound in three questions", "fh");
    [
      ["Bright or dark?", "Oscillator and filter", "Type, Wave, Cutoff"],
      ["Short or long?", "The envelope", "Attack, Decay/Rel, Sustain"],
      ["One note or many?", "Voices", "Paraphonic"],
    ].forEach(([q, a, k], i) => {
      const x = 30 + i * 255;
      s +=
        box(x, 70, 230, 220) +
        T(x + 115, 110, q, "fl") +
        arrow(x + 115, 130, x + 115, 180) +
        T(x + 115, 214, a, "fl") +
        T(x + 115, 244, k, "fm");
    });
    s += T(400, 330, "Start from Init, change one thing at a time, listen, then save.", "fb");
    return svgFig("0 0 800 350", s, "Three questions that lead to the oscillator, envelope and voices");
  },
  /* lesson 5 */
  "mf-lfo"() {
    let s = T(400, 36, "An LFO: a slow wave that turns a knob for you", "fh");
    const x0 = 80,
      y0 = 180;
    s += line(x0, y0, 720, y0, "ln2") + `<path d="${wave(x0, y0, 640, 70, 3, "sine")}" ${stroke("var(--turn)", 3.5)}/>`;
    s += `<path d="M${x0} 280v8H${x0 + 213}v-8" class="ln"/>` + T(x0 + 106, 306, "Rate: how fast it repeats", "fm");
    s +=
      `<path d="M${x0 + 267} ${y0}V${y0 - 70}" class="mark"/>` + T(x0 + 277, y0 - 80, "Amount: how far", "fm", "start");
    [
      ["sine", "smooth"],
      ["square", "jumps"],
      ["rand", "random"],
    ].forEach(([t, n], i) => {
      const x = 150 + i * 200;
      s += `<path d="${wave(x, 350, 100, 16, 2, t)}" ${stroke("var(--led)")}/>` + T(x + 50, 384, n, "fs");
    });
    s += T(400, 324, "Shape: how it gets there", "fm");
    return svgFig("0 0 800 400", s, "An LFO wave with its rate, amount and shapes");
  },
  "mf-matrix"() {
    let s = T(400, 36, "The Matrix: sources down, destinations across", "fh");
    const rows = ["CycEnv", "Env", "LFO", "Press", "Key/Arp"],
      cols = ["Pitch", "Wave", "Timbre", "Cutoff", "Assign 1", "Assign 2", "Assign 3"];
    const x0 = 230,
      y0 = 120,
      dx = 70,
      dy = 44;
    cols.forEach((c, i) => (s += T(x0 + i * dx, y0 - 22, c, "fm")));
    rows.forEach((r, j) => {
      s +=
        T(x0 - 40, y0 + j * dy + 5, r, "fl", "end") + line(x0 - 25, y0 + j * dy, x0 + 6 * dx + 25, y0 + j * dy, "grid");
      cols.forEach((c, i) => {
        const on = (j === 2 && i === 0) || (j === 1 && i === 3);
        s += `<circle cx="${x0 + i * dx}" cy="${y0 + j * dy}" r="${on ? 11 : 8}" style="fill:${on ? "var(--led)" : "var(--surface-2)"};stroke:var(--line)"/>`;
      });
    });
    s += T(x0 + 50, y0 + 5 * dy + 22, "lit: LFO to Pitch, a vibrato", "fm", "start");
    s += T(x0 + 260, y0 + 5 * dy + 22, "lit: Env to Cutoff, a filter sweep", "fm", "start");
    s += T(400, 390, "Assign columns go to any knob you choose.", "fb");
    return svgFig("0 0 800 400", s, "The modulation Matrix with two connections lit");
  },
  "mf-bipolar"() {
    let s = T(400, 36, "Plus or minus: the same movement, either way up", "fh");
    [
      ["+50", "LFO up, pitch up", 1],
      ["-50", "LFO up, pitch down", -1],
    ].forEach(([h, b, sgn], i) => {
      const x = 30 + i * 385;
      s += box(x, 64, 355, 250) + T(x + 177, 94, `amount ${h}`, "fl") + T(x + 177, 116, b, "fm");
      s +=
        `<path d="${wave(x + 30, 170, 295, 30, 2, "tri")}" ${stroke("var(--turn)", 2.5)}/>` +
        T(x + 30, 145, "LFO", "fs", "start");
      s +=
        `<path d="${wave(x + 30, 260, 295, 30 * sgn, 2, "tri")}" ${stroke("var(--led)", 3.5)}/>` +
        T(x + 30, 232, "pitch", "fs", "start");
    });
    s += T(400, 352, "Two lit points on one destination add up.", "fb");
    return svgFig("0 0 800 370", s, "A positive and a negative Matrix amount");
  },
  /* lesson 6 */
  "mf-cycenv"() {
    let s = T(400, 36, "The cycling envelope: rise, hold, fall", "fh");
    s +=
      `<path d="${P([
        [90, 160],
        [150, 80],
        [200, 80],
        [290, 160],
      ])}" ${stroke("var(--led)", 3.5)}/>` + line(80, 160, 300, 160);
    s += T(120, 182, "Rise", "fs") + T(175, 70, "Hold", "fs") + T(245, 182, "Fall", "fs");
    const notes = [0.08, 0.42, 0.7];
    const env = (x, y, w, t0, loop) => {
      const pts = [];
      const one = (tt) => (tt < 0 ? 0 : tt < 0.06 ? tt / 0.06 : tt < 0.1 ? 1 : tt < 0.22 ? 1 - (tt - 0.1) / 0.12 : 0);
      for (let i = 0; i <= 400; i++) {
        const t = i / 400;
        let v = 0;
        if (loop === "env") notes.forEach((n) => (v = Math.max(v, one(t - n))));
        if (loop === "run") v = one((t + 0.05) % 0.22);
        if (loop === "loop") {
          const last = notes.filter((n) => n <= t).pop();
          v = last === undefined ? 0 : one((t - last) % 0.22);
        }
        pts.push([x + w * t, y - 34 * v]);
      }
      return P(pts);
    };
    [
      ["Env", "once per note", "env"],
      ["Run", "loops on its own", "run"],
      ["Loop", "loops, restarts with each note", "loop"],
    ].forEach(([h, b, m], i) => {
      const y = 240 + i * 58,
        x = 340,
        w = 420;
      s += T(320, y - 10, `${h}: ${b}`, "fm", "end") + line(x, y, x + w, y, "grid");
      notes.forEach((n) => (s += `<path d="M${x + w * n} ${y + 6}v-46" class="ln2"/>`));
      s += `<path d="${env(x, y, w, 0, m)}" ${stroke("var(--led)", 2.5)}/>`;
    });
    s += T(550, 412, "dashed lines: a key is played", "fs");
    return svgFig("0 0 800 425", s, "The cycling envelope's shape and its three modes");
  },
  "mf-strike"() {
    let s = T(400, 36, "A fast pitch drop sounds like a strike", "fh");
    const x0 = 100,
      y0 = 300;
    s +=
      line(x0, y0, 700, y0) +
      line(x0, 70, x0, y0) +
      T(x0 - 10, 80, "pitch", "fs", "end") +
      T(700, y0 + 24, "time →", "fs", "end");
    const pts = [];
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      pts.push([x0 + 600 * t, 230 - 150 * Math.exp(-t * 28)]);
    }
    s += `<path d="${P(pts)}" ${stroke("var(--led)", 3.5)}/>`;
    s +=
      `<path d="M${x0 + 4} 330h40" ${stroke("var(--turn)")}/>` +
      T(x0 + 24, 352, "a few hundredths of a second", "fs", "start");
    s += T(380, 210, "then the note itself, steady", "fm");
    s += T(400, 390, "Too slow and it turns into a slide; fast, it's the click of a kick or a punchy bass.", "fb");
    return svgFig("0 0 800 400", s, "Pitch dropping fast at the start of a note");
  },
  /* lesson 7 */
  "mf-artic"() {
    let s = T(400, 36, "How notes join", "fh");
    const notes = [3, 1, 4, 2];
    [
      ["Staccato", "short and separate", "stac"],
      ["Legato", "each note runs into the next", "leg"],
      ["Glide", "the pitch slides between them", "glide"],
    ].forEach(([h, b, m], i) => {
      const y = 90 + i * 100,
        x0 = 300;
      s += T(270, y + 20, h, "fl", "end") + T(270, y + 40, b, "fs", "end");
      notes.forEach((n, j) => {
        const x = x0 + j * 110,
          yy = y + 60 - n * 14;
        const w = m === "stac" ? 40 : 110;
        s += `<path d="M${x} ${yy}h${m === "glide" ? 80 : w}" ${stroke("var(--led)", 8)}/>`;
        if (m === "glide" && j < notes.length - 1)
          s += `<path d="M${x + 80} ${yy}L${x + 110} ${y + 60 - notes[j + 1] * 14}" ${stroke("var(--led)", 4)}/>`;
      });
    });
    return svgFig("0 0 800 400", s, "Staccato, legato and glide drawn as notes over time");
  },
  /* lesson 8 */
  "mf-twospeeds"() {
    let s = T(400, 36, "Two speeds that don't line up", "fh");
    const x0 = 60,
      w = 680;
    s +=
      `<path d="${wave(x0, 120, w, 30, 5, "sine")}" ${stroke("var(--turn)", 2.5)}/>` +
      T(x0, 76, "LFO on Wave", "fs", "start");
    s +=
      `<path d="${wave(x0, 220, w, 30, 3.6, "tri")}" ${stroke("var(--hold)", 2.5)}/>` +
      T(x0, 176, "cycling envelope on Timbre", "fs", "start");
    const pts = [];
    for (let i = 0; i <= 400; i++) {
      const t = i / 400;
      pts.push([x0 + w * t, 320 - 22 * (wv("sine", t * 5) + wv("tri", t * 3.6))]);
    }
    s += `<path d="${P(pts)}" ${stroke("var(--led)", 3)}/>` + T(x0, 270, "together: the sound you hear", "fs", "start");
    s += T(400, 395, "Each bump of the bottom line is different, because the two never meet in the same place.", "fb");
    return svgFig("0 0 800 410", s, "Two modulations at different speeds and their combined movement");
  },
  "mf-delayvib"() {
    let s = T(400, 36, "A vibrato that fades in", "fh");
    const x0 = 80,
      w = 640;
    s +=
      `<path d="${P([
        [x0, 150],
        [x0 + 260, 80],
        [x0 + w, 80],
      ])}" ${stroke("var(--hold)", 3)}/>` + T(x0, 70, "cycling envelope: rises slowly", "fs", "start");
    s +=
      `<path d="${wave(x0, 250, w, 50, 14, "sine", (t) => Math.min(1, t / 0.4))}" ${stroke("var(--led)", 3)}/>` +
      T(x0, 186, "pitch: the vibrato it controls", "fs", "start");
    s +=
      `<rect x="${x0}" y="330" width="${w}" height="12" rx="4" style="fill:var(--hold-soft);stroke:var(--hold)"/>` +
      T(400, 366, "one note held", "fs");
    return svgFig("0 0 800 380", s, "An envelope growing the depth of a vibrato over a held note");
  },
  "mf-keytrack"() {
    let s = T(400, 36, "Key tracking: higher keys, more open filter", "fh");
    const kw = 48,
      x0 = 400 - (15 * kw) / 2;
    for (let i = 0; i < 15; i++) {
      const h = 30 + i * 12;
      s += `<rect x="${x0 + i * kw + 10}" y="${250 - h}" width="${kw - 20}" height="${h}" rx="4" style="fill:var(--turn-soft);stroke:var(--turn)"/>`;
    }
    s += T(x0, 76, "cutoff", "fs", "start");
    s += keyboard(x0, 260, 15, kw, 110, {}, false);
    s += T(400, 396, "In the Matrix: Key/Arp to Cutoff, a positive amount.", "fb");
    return svgFig("0 0 800 410", s, "The filter opening more for higher keys");
  },
  /* lesson 9 */
  "mf-modes"() {
    let s = T(400, 36, "Change one note, change the mood", "fh");
    [
      ["A natural minor", ["A", "B", "C", "D", "E", "F", "G"], -1, "dark, at rest"],
      ["A Dorian", ["A", "B", "C", "D", "E", "F#", "G"], 5, "minor, but brighter"],
      ["A harmonic minor", ["A", "B", "C", "D", "E", "F", "G#"], 6, "pulls hard back to A"],
    ].forEach(([h, ns, ch, b], i) => {
      const y = 80 + i * 100;
      s += T(30, y + 32, h, "fl", "start") + T(30, y + 54, b, "fs", "start");
      ns.forEach((n, j) => {
        const x = 260 + j * 72;
        s +=
          rect(x, y, 62, 56, j === ch ? "var(--led)" : j === 0 ? "var(--led-soft)" : "var(--surface)", 8) +
          T(x + 31, y + 35, n, j === ch ? "fbar" : "fl");
      });
    });
    s += T(400, 392, "Root A in pale orange; the changed note in bright orange.", "fs");
    return svgFig("0 0 800 400", s, "A natural minor, A Dorian and A harmonic minor, with the changed note marked");
  },
  /* lesson 10 */
  "mf-formula"() {
    let s = T(400, 36, "A chord is a formula in semitones", "fh");
    const x0 = 210,
      dx = 46;
    for (let i = 0; i < 12; i++) s += T(x0 + i * dx, 84, i, "fs");
    [
      ["minor", [0, 3, 7]],
      ["major", [0, 4, 7]],
      ["m7", [0, 3, 7, 10]],
      ["maj7", [0, 4, 7, 11]],
    ].forEach(([h, f], j) => {
      const y = 120 + j * 60;
      s += T(x0 - 30, y + 6, h, "fl", "end") + line(x0, y, x0 + 11 * dx, y, "grid");
      for (let i = 0; i < 12; i++) {
        const on = f.includes(i);
        s += `<circle cx="${x0 + i * dx}" cy="${y}" r="${on ? 13 : 4}" style="fill:${on ? (i === 3 || i === 4 ? "var(--led)" : "var(--turn)") : "var(--line)"}"/>`;
      }
      s += T(x0 + 11 * dx + 30, y + 6, f.join("-"), "fm", "start");
    });
    s += T(400, 384, "The third (3 or 4) decides minor or major; it's the orange dot.", "fb");
    return svgFig("0 0 800 400", s, "Minor, major, m7 and maj7 as semitone formulas");
  },
  "mf-diatonic"() {
    let s = T(400, 36, "The chords that live in A minor", "fh");
    const scale = ["A", "B", "C", "D", "E", "F", "G"],
      names = ["Am7", "Bm7♭5", "Cmaj7", "Dm7", "Em7", "Fmaj7", "G7"],
      track = [0, 3, 4, 5];
    scale.forEach((n, i) => {
      const x = 70 + i * 100,
        on = track.includes(i);
      [0, 2, 4, 6].forEach((k, j) => {
        const y = 270 - j * 50;
        s +=
          rect(x, y, 70, 42, on ? (j === 0 ? "var(--turn)" : "var(--turn-soft)") : "var(--surface)", 8) +
          T(x + 35, y + 27, scale[(i + k) % 7], j === 0 && on ? "fbar" : "fl");
      });
      s += T(x + 35, 340, names[i], on ? "fl" : "fm");
    });
    s += T(400, 384, "Each chord stacks every other note of the scale. Blue: the four in your track.", "fb");
    return svgFig("0 0 800 400", s, "Seven chords built on A minor, with Am7, Dm7, Em7 and Fmaj7 marked");
  },
  "mf-voicing"() {
    let s = T(400, 36, "Voice leading: move as little as you can", "fh");
    const chords = [
      ["Am7", ["A", "C", "E", "G"]],
      ["Fmaj7", ["A", "C", "E", "F"]],
      ["Dm7", ["A", "C", "D", "F"]],
      ["Em7", ["G", "B", "D", "E"]],
    ];
    chords.forEach(([h, ns], i) => {
      const x = 90 + i * 170,
        prev = i ? chords[i - 1][1] : ns;
      ns.forEach((n, j) => {
        const y = 270 - j * 52,
          moved = n !== prev[j];
        s +=
          rect(x, y, 90, 42, moved ? "var(--led)" : "var(--surface)", 8) + T(x + 45, y + 27, n, moved ? "fbar" : "fl");
        if (i)
          s += `<path d="M${x - 78} ${y + 21}H${x - 2}" ${stroke(moved ? "var(--led)" : "var(--faint)", moved ? 2.5 : 1.5)}/>`;
      });
      s += T(x + 45, 340, h, "fl");
    });
    s += T(400, 384, "Orange: the fingers that move, each one step down. The rest stay where they are.", "fb");
    return svgFig("0 0 800 400", s, "Am7, Fmaj7, Dm7 and Em7 with the moving notes marked");
  },
  /* lesson 11 */
  "mf-notevalues"() {
    let s = T(400, 36, "One bar, three ways to split it", "fh");
    const x0 = 180,
      w = 560;
    for (let b = 0; b <= 4; b++)
      s +=
        `<path d="M${x0 + (b * w) / 4} 70V330" class="${b % 4 ? "ln2" : "ln"}"/>` +
        (b < 4 ? T(x0 + (b * w) / 4 + 12, 66, b + 1, "fs", "start") : "");
    [
      ["1/8", 8, "two per beat", "var(--turn)"],
      ["1/16", 16, "four per beat", "var(--led)"],
      ["1/8T", 12, "three per beat: triplets", "var(--hold)"],
    ].forEach(([h, n, b, c], i) => {
      const y = 120 + i * 80;
      s += T(x0 - 20, y + 4, h, "fl", "end") + T(x0 - 20, y + 24, b, "fs", "end");
      for (let k = 0; k < n; k++)
        s += `<circle cx="${x0 + (k * w) / n + 8}" cy="${y}" r="${n > 12 ? 7 : 9}" style="fill:${c}"/>`;
    });
    s += T(400, 370, "The arpeggiator plays one note on each dot.", "fb");
    return svgFig("0 0 800 390", s, "Eighths, sixteenths and eighth-note triplets across one bar");
  },
  /* lesson 12 */
  "mf-steps"() {
    let s = T(400, 36, "Notes, ties and rests", "fh");
    const steps = [
      ["A", "note"],
      ["", "tie"],
      ["", "tie"],
      ["", "tie"],
      ["", "tie"],
      ["", "tie"],
      ["", "rest"],
      ["A↑", "note"],
    ];
    const x0 = 60,
      dx = 86,
      y = 110;
    steps.forEach(([n, k], i) => {
      const x = x0 + i * dx;
      s +=
        rect(x, y, 76, 76, k === "rest" ? "var(--surface)" : k === "tie" ? "var(--led-soft)" : "var(--led)", 10) +
        T(x + 38, y + 46, n, "fbar");
      s += T(x + 38, y + 102, k, "fs") + T(x + 38, y - 10, i + 1, "fs");
    });
    s += `<path d="M${x0 + 60} ${y + 62}H${x0 + 5 * dx + 38}" ${stroke("var(--led)", 6)}/>`;
    s +=
      `<path d="M${x0} 250v8H${x0 + 6 * dx - 10}v-8" class="ln"/>` +
      T(x0 + 3 * dx, 280, "one long A: a note and five ties", "fm");
    s += T(x0 + 6.5 * dx, 280, "silence", "fm") + T(x0 + 7.5 * dx, 300, "an octave up", "fm");
    s += T(400, 350, "One bar of your bassline, in eighth notes. Four bars make the 32 steps.", "fb");
    return svgFig("0 0 800 370", s, "Eight sequencer steps: a note, five ties, a rest and a high note");
  },
  /* lesson 13 */
  "mf-spice"() {
    let s = T(400, 36, "Dice rolls the changes; Spice sets how much", "fh");
    const gates = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      dice = [0.9, 0.1, 0.5, 0, 0.7, 0.3, 0, 0.95, 0.2, 0.6, 0, 0.4, 0.8, 0, 0.3, 0.55];
    [
      ["Spice none", 0],
      ["Spice a third", 0.33],
      ["Spice all", 1],
    ].forEach(([h, m], i) => {
      const y = 100 + i * 90,
        x0 = 200,
        dx = 34;
      s += T(x0 - 24, y + 22, h, "fl", "end");
      gates.forEach((g, k) => {
        const v = g + (dice[k] - g) * m;
        s += `<rect x="${x0 + k * dx}" y="${y}" width="30" height="34" rx="4" style="fill:var(--surface-2);stroke:var(--line)"/>`;
        if (v > 0.05)
          s += `<rect x="${x0 + k * dx}" y="${y}" width="${30 * v}" height="34" rx="4" style="fill:var(--led)"/>`;
      });
    });
    s += T(400, 380, "Each bar is a step; the orange is how long its note plays. Empty means silent.", "fb");
    return svgFig("0 0 800 400", s, "Note lengths across 16 steps with no, some and full Spice");
  },
  "mf-modtrack"() {
    let s = T(400, 36, "A modulation track: one knob, every step", "fh");
    const cut = [0.3, 0.3, 0.8, 0.3, 0.5, 0.3, 0.9, 0.4, 0.3, 0.6, 0.3, 0.3, 1, 0.3, 0.5, 0.7];
    const x0 = 80,
      dx = 40;
    cut.forEach((v, k) => {
      const x = x0 + k * dx;
      s += rect(x, 90, 32, 32, "var(--led)", 5);
      s += `<rect x="${x}" y="${320 - 160 * v}" width="32" height="${160 * v}" rx="4" style="fill:var(--turn-soft);stroke:var(--turn)"/>`;
    });
    s +=
      T(x0, 78, "notes", "fs", "start") +
      T(x0, 150, "Cutoff, as you set it on each step", "fs", "start") +
      line(x0, 320, x0 + 16 * dx - 8, 320);
    s += T(400, 370, "Up to four tracks per sequence, each remembering a different knob.", "fb");
    return svgFig("0 0 800 390", s, "Sixteen steps with a cutoff value stored for each");
  },
  /* lesson 14 */
  "mf-engines"() {
    let s = T(400, 36, "Swap the recipe, keep the rest", "fh");
    const recipes = [
      "Basic Waves",
      "Wavetable",
      "Harmo",
      "Two Op. FM",
      "KarplusStr",
      "Modal",
      "Noise",
      "Sample, Grains…",
    ];
    s += box(30, 64, 300, 320) + T(180, 94, "Oscillator Type", "fl");
    recipes.forEach(
      (r, i) =>
        (s +=
          rect(50, 110 + i * 32, 260, 26, i === 0 ? "var(--led)" : "var(--surface)", 6) +
          T(180, 128 + i * 32, r, i === 0 ? "fbar" : "fm"))
    );
    s += arrow(336, 220, 380, 220);
    s += box(390, 150, 170, 140) + T(475, 210, "Filter", "fl") + T(475, 234, "stays the same", "fs");
    s += arrow(566, 220, 600, 220);
    s += box(610, 150, 160, 140) + T(690, 210, "Envelopes", "fl") + T(690, 234, "stay the same", "fs");
    return svgFig("0 0 800 400", s, "Many oscillator types feeding the same filter and envelopes");
  },
  "mf-fm"() {
    let s = T(400, 36, "FM: one wave bends another", "fh");
    const x0 = 80,
      w = 640;
    s +=
      `<path d="${wave(x0, 110, w, 30, 3, "sine")}" ${stroke("var(--turn)", 2.5)}/>` +
      T(x0, 70, "modulator", "fs", "start");
    const pts = [];
    for (let i = 0; i <= 800; i++) {
      const t = i / 800;
      pts.push([x0 + w * t, 240 - 45 * Math.sin(2 * Math.PI * (t * 14) + 2.5 * Math.sin(2 * Math.PI * t * 3))]);
    }
    s +=
      `<path d="${P(pts)}" ${stroke("var(--led)", 2.5)}/>` +
      T(x0, 180, "carrier: squeezed and stretched", "fs", "start");
    s += T(400, 330, "Ratio: how fast the modulator is, compared with the carrier", "fm");
    s += T(400, 354, "Amount: how hard it bends; more is brighter", "fm");
    s += T(400, 390, "Simple ratios (1, 2) sound musical; odd ones sound like metal.", "fb");
    return svgFig("0 0 800 400", s, "A modulator wave bending the cycles of a carrier wave");
  },
  /* lesson 15 */
  "mf-sample"() {
    let s = T(400, 36, "A sample: a short recording you can play", "fh");
    const x0 = 80,
      w = 640,
      y = 170;
    const pts = [];
    for (let i = 0; i <= 600; i++) {
      const t = i / 600,
        a = 60 * (0.3 + 0.7 * Math.abs(Math.sin(t * 7.3))) * (1 - t * 0.5);
      pts.push([x0 + w * t, y - a * Math.sin(i * 1.7)]);
    }
    s += `<path d="${P(pts)}" ${stroke("var(--faint)", 1.2)}/>`;
    s += `<rect x="${x0 + 0.25 * w}" y="${y - 75}" width="${0.4 * w}" height="150" rx="6" style="fill:var(--led-soft);stroke:var(--led)"/>`;
    s += T(x0 + 0.25 * w, 80, "Wave: start", "fm") + T(x0 + 0.45 * w, 266, "Timbre: how much plays", "fm");
    s +=
      arrow(x0 + 0.65 * w, 290, x0 + 0.27 * w, 290, "var(--hold)") +
      T(x0 + 0.46 * w, 316, "left of the middle: backwards", "fs");
    s +=
      `<path d="M${x0 + 0.62 * w} 94 A103 16 0 0 0 ${x0 + 0.3 * w} 94" ${stroke("var(--turn)")}/>` +
      T(x0 + 0.8 * w, 80, "Shape: loop", "fm");
    s += T(400, 370, "Higher keys play it higher and faster; lower keys, lower and slower.", "fb");
    return svgFig("0 0 800 390", s, "A recording with its start, length, reverse and loop marked");
  },
  "mf-grains"() {
    let s = T(400, 36, "Grains: tiny slices, many at once", "fh");
    const x0 = 80,
      w = 640;
    const pts = [];
    for (let i = 0; i <= 600; i++) {
      const t = i / 600;
      pts.push([x0 + w * t, 120 - 40 * (0.3 + 0.7 * Math.abs(Math.sin(t * 5))) * Math.sin(i * 1.7)]);
    }
    s += `<path d="${P(pts)}" ${stroke("var(--faint)", 1.2)}/>` + T(x0, 68, "the recording", "fs", "start");
    const picks = [0.3, 0.33, 0.36, 0.38, 0.41, 0.44];
    picks.forEach((p, i) => {
      const gx = x0 + w * p,
        tx = 260 + i * 50,
        ty = 290 + (i % 2) * 20;
      s += `<rect x="${gx - 8}" y="80" width="16" height="80" rx="3" style="fill:var(--led-soft);stroke:var(--led)"/>`;
      s += `<path d="M${gx} 165L${tx} ${ty - 30}" class="ln2"/>`;
      s += `<path d="${wave(tx - 40, ty, 80, 18, 3, "sine", (t) => Math.sin(Math.PI * t))}" ${stroke("var(--led)", 2)}/>`;
    });
    s += T(400, 370, "Each grain fades in and out; overlapping, they hold one moment of the sound.", "fb");
    return svgFig("0 0 800 390", s, "Small slices taken from a recording and overlapped into a cloud");
  },
  /* lesson 16 */
  "mf-setup"() {
    let s = T(400, 36, "Live leads, both machines follow", "fh");
    s += box(300, 70, 200, 90) + T(400, 110, "Live", "fl") + T(400, 134, "sets the tempo: 90", "fs");
    s += box(40, 250, 220, 90) + T(150, 300, "MicroFreak", "fl");
    s += box(540, 250, 220, 90) + T(650, 300, "Model:Cycles", "fl");
    s += box(300, 300, 200, 70) + T(400, 340, "audio interface", "fl");
    s += arrow(320, 160, 180, 246) + T(210, 196, "USB: clock and notes", "fs", "end");
    s += arrow(480, 160, 620, 246) + T(590, 196, "USB: clock", "fs", "start");
    s += arrow(262, 320, 296, 332, "var(--led)") + arrow(538, 320, 504, 332, "var(--led)");
    s +=
      `<path d="M400 296V${170}" ${stroke("var(--led)", 2.5)} stroke-dasharray="6 5"/>` +
      T(410, 240, "audio in", "fs", "start");
    s += T(400, 400, "Blue: timing over USB. Orange: sound, through cables into the interface.", "fb");
    return svgFig(
      "0 0 800 410",
      s,
      "Live sending clock to the MicroFreak and Model:Cycles, their audio returning via an interface"
    );
  },
};
