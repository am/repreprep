import { esc, svgFig, T, hits, COUNT16, ROWC } from "../../shared/html.js";

/* ---- Unit 2: Sound ---- */
export const UNIT_FIGS_2 = (() => {
  /* small drawing helpers, private to unit 2 */
  const P = (pts) => "M" + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
  const stroke = (c, w = 3) =>
    `style="fill:none;stroke:${c};stroke-width:${w};stroke-linejoin:round;stroke-linecap:round"`;
  const rnd = [0.55, -0.35, 0.85, -0.7, 0.2, 0.65, -0.9, 0.4, -0.15, 0.75, -0.55, 0.3];
  /* one value (-1..1) of a waveform at phase p (0..1 per cycle) */
  const wv = (type, p) => {
    const f = p - Math.floor(p);
    if (type === "sine") return Math.sin(2 * Math.PI * f);
    if (type === "tri") return f < 0.25 ? f * 4 : f < 0.75 ? 2 - f * 4 : f * 4 - 4;
    if (type === "square") return f < 0.5 ? 1 : -1;
    if (type === "saw") return 1 - 2 * f;
    if (type === "rand") return rnd[Math.floor(p) % rnd.length];
    return 0;
  };
  /* a waveform path from x over width w, centred on y, amplitude a, n cycles */
  const wave = (x, y, w, a, n, type, N = 240) => {
    const pts = [];
    if (type === "square" || type === "saw" || type === "rand") {
      // draw the jumps as clean verticals
      for (let c = 0; c < n; c++) {
        const x0 = x + (w * c) / n,
          x1 = x + (w * (c + 1)) / n;
        if (type === "square") {
          pts.push([x0, y - a], [x0 + (x1 - x0) / 2, y - a], [x0 + (x1 - x0) / 2, y + a], [x1, y + a]);
        } else if (type === "saw") {
          pts.push([x0, y - a], [x1, y + a]);
          if (c < n - 1) pts.push([x1, y - a]);
        } else {
          const v = wv("rand", c);
          pts.push([x0, y - a * v], [x1, y - a * v]);
        }
      }
      if (type === "square") pts.push([x + w, y - a]);
      return P(pts);
    }
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([x + w * t, y - a * wv(type, t * n)]);
    }
    return P(pts);
  };
  /* exponential decay from (x,top) to the baseline over width w */
  const decay = (x, base, top, w, k = 4.5, N = 80) => {
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      pts.push([x + w * t, base - (base - top) * Math.exp(-k * t) * (1 - t * 0.02)]);
    }
    return pts;
  };
  const box = (x, y, w, h, extra = "") =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="box" ${extra}/>`;
  const axis = (x0, y0, x1) => `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" class="ln"/>`;

  return {
    /* lesson 5 */
    u2four() {
      let s = T(400, 36, "Four things every sound has", "fh");
      const cols = [
        ["Pitch", "high or low", "fast or slow wobble"],
        ["Loudness", "strong or weak", "tall or short wave"],
        ["Timbre", "its colour", "same note, other shape"],
        ["Envelope", "its shape in time", "start, fall, fade"],
      ];
      cols.forEach(([h, a, b], i) => {
        const x = 20 + i * 195,
          cx = x + 87.5;
        s += box(x, 62, 175, 270) + T(cx, 94, h, "fl");
        if (i === 0) {
          s +=
            `<path d="${wave(x + 20, 140, 135, 18, 5, "sine")}" ${stroke("var(--turn)")}/>` +
            `<path d="${wave(x + 20, 200, 135, 18, 2, "sine")}" ${stroke("var(--led)")}/>` +
            T(cx, 174, "high", "fs") +
            T(cx, 234, "low", "fs");
        }
        if (i === 1) {
          s +=
            `<path d="${wave(x + 20, 140, 135, 10, 3, "sine")}" ${stroke("var(--faint)")}/>` +
            `<path d="${wave(x + 20, 195, 135, 26, 3, "sine")}" ${stroke("var(--led)")}/>` +
            T(cx, 166, "soft", "fs") +
            T(cx, 234, "loud", "fs");
        }
        if (i === 2) {
          s +=
            `<path d="${wave(x + 20, 140, 135, 18, 3, "sine")}" ${stroke("var(--done)")}/>` +
            `<path d="${wave(x + 20, 200, 135, 18, 3, "saw")}" ${stroke("var(--hold)")}/>` +
            T(cx, 174, "round", "fs") +
            T(cx, 234, "buzzy", "fs");
        }
        if (i === 3) {
          const b = 230,
            pts = [[x + 20, b], [x + 34, 130], ...decay(x + 34, b, 130, 120, 4)];
          s += `<path d="${P(pts)}" ${stroke("var(--led)")}/>` + axis(x + 18, b, x + 158) + T(cx, 250, "time →", "fs");
        }
        s += T(cx, 284, a, "fm") + T(cx, 306, b, "fs");
      });
      s += T(400, 375, "Change any one of the four and you hear a different sound.", "fb");
      s += T(400, 402, "Timbre is everything that differs when pitch and loudness are the same.", "fs");
      return svgFig("0 0 800 420", s, "Pitch, loudness, timbre and envelope");
    },
    u2adsr() {
      let s = T(400, 36, "ADSR: a sound's shape in time", "fh");
      const b = 300,
        pts = [
          [80, b],
          [180, 90],
          [280, 180],
          [520, 180],
          [700, b],
        ];
      s +=
        `<path d="${P(pts)} Z" style="fill:var(--led-soft);stroke:none"/>` +
        `<path d="${P(pts)}" ${stroke("var(--led)", 4)}/>`;
      s += axis(70, b, 740) + T(740, b + 20, "time →", "fs", "end");
      s +=
        `<line x1="80" y1="70" x2="80" y2="${b}" class="ln2"/><line x1="520" y1="70" x2="520" y2="${b}" class="ln2"/>` +
        T(86, 74, "key down", "fs", "start") +
        T(526, 74, "key up", "fs", "start");
      s += `<line x1="290" y1="180" x2="510" y2="180" class="mark"/>`;
      [
        ["Attack", "time to rise", 118],
        ["Decay", "time to fall", 244],
        ["Sustain", "a level, held", 400],
        ["Release", "time to fade", 610],
      ].forEach(([h, d, x]) => {
        s += T(x, b + 44, h, "fl") + T(x, b + 64, d, "fs");
      });
      s += T(400, 400, "A pad: slow attack, long release. A pluck or a drum: instant attack, no sustain.", "fb");
      return svgFig("0 0 800 420", s, "An ADSR envelope with attack, decay, sustain and release");
    },
    u2gate() {
      let s = T(400, 36, "On the Model:Cycles: DECAY, and GATE for a hold", "fh");
      const b = 290,
        top = 120;
      s += T(210, 84, "GATE off", "fl") + T(590, 84, "GATE on", "fl");
      const off = [[60, b], [60, top], ...decay(60, b, top, 280, 4.5)];
      s += `<path d="${P(off)}" ${stroke("var(--led)", 4)}/>` + axis(50, b, 370) + T(60, b + 22, "hit", "fs");
      s += T(200, 170, "DECAY", "fm", "start");
      const on = [[440, b], [440, top], [600, top], ...decay(600, b, top, 150, 4.5)];
      s += `<path d="${P(on)}" ${stroke("var(--led)", 4)}/>` + axis(430, b, 760) + T(440, b + 22, "hit", "fs");
      s +=
        `<line x1="600" y1="100" x2="600" y2="${b}" class="ln2"/>` +
        T(520, 110, "hold", "fm") +
        T(690, 180, "DECAY", "fm", "start");
      s += T(600, b + 22, "pad released or LEN ends", "fs");
      s += T(400, 360, "GATE off: every sound starts at full level and goes straight into its decay.", "fb");
      s += T(400, 390, "GATE on: it holds at full level first, like a sustain, then decays.", "fb");
      return svgFig("0 0 800 420", s, "Envelope with GATE off and GATE on");
    },
    u2kick() {
      let s = T(400, 36, "What makes a kick punchy or round", "fh");
      s += T(330, 72, "Punchy (most stock kicks)", "fl") + T(640, 72, "Round (for your night track)", "fl");
      s +=
        T(165, 140, "pitch", "fl", "end") +
        T(165, 160, "SWEEP", "fs", "end") +
        T(165, 265, "level", "fl", "end") +
        T(165, 285, "CONTOUR, DECAY", "fs", "end");
      const pitch = (x, hi, lo, k) => {
        const pts = [];
        for (let i = 0; i <= 60; i++) {
          const t = i / 60;
          pts.push([x + 250 * t, lo - (lo - hi) * Math.exp(-k * t)]);
        }
        return P(pts);
      };
      s += axis(200, 190, 460) + axis(510, 190, 770);
      s +=
        `<path d="${pitch(205, 95, 180, 12)}" ${stroke("var(--turn)")}/>` +
        `<path d="${pitch(515, 150, 175, 5)}" ${stroke("var(--turn)")}/>`;
      s += T(300, 110, "big, fast drop", "fs", "start") + T(620, 138, "small drop", "fs", "start");
      const lvl = (x, w, k, click) => {
        let pts = [
          [x, 315],
          [x, 215],
        ];
        if (click) {
          for (let i = 1; i <= 6; i++) pts.push([x + i * 3, i % 2 ? 232 : 208]);
        }
        pts = pts.concat(decay(x + (click ? 18 : 0), 315, 215, w, k));
        return P(pts);
      };
      s += axis(200, 315, 460) + axis(510, 315, 770);
      s +=
        `<path d="${lvl(205, 130, 5, true)}" ${stroke("var(--led)")}/>` +
        `<path d="${lvl(515, 230, 3.5, false)}" ${stroke("var(--led)")}/>`;
      s += T(232, 206, "click", "fs", "start") + T(560, 240, "no click, longer ring", "fs", "start");
      s += T(400, 365, "SWEEP: how far and fast the pitch drops. CONTOUR: the burst at the start.", "fb");
      s += T(400, 395, "DECAY: how long it rings. Less sweep and click, a little more decay: round.", "fb");
      return svgFig("0 0 800 420", s, "Pitch and level of a punchy kick and a round kick");
    },
    /* lesson 6 */
    u2waves() {
      let s = T(400, 36, "Waveforms, from dark to bright", "fh");
      s += T(300, 62, "two cycles of the wave", "fs") + T(620, 62, "its harmonics (1 = the note you hear)", "fs");
      const rows = [
        ["Sine", "pure, round", "sine", [1, 0, 0, 0, 0, 0, 0, 0]],
        ["Triangle", "soft, gentle", "tri", [1, 0, 0.11, 0, 0.04, 0, 0.02, 0]],
        ["Square", "hollow, reedy", "square", [1, 0, 0.33, 0, 0.2, 0, 0.14, 0]],
        ["Sawtooth", "bright, buzzy", "saw", [1, 0.5, 0.33, 0.25, 0.2, 0.17, 0.14, 0.125]],
      ];
      rows.forEach(([n, d, t, h], r) => {
        const c = 105 + r * 72;
        s += T(40, c - 2, n, "fl", "start") + T(40, c + 18, d, "fs", "start");
        s += `<path d="${wave(200, c, 220, 24, 2, t)}" ${stroke(r === 0 ? "var(--done)" : r === 3 ? "var(--hold)" : "var(--turn)")}/>`;
        h.forEach((v, i) => {
          const x = 490 + i * 35,
            hh = v ? Math.max(3, v * 56) : 0;
          if (hh)
            s += `<rect x="${x}" y="${c + 28 - hh}" width="20" height="${hh}" rx="3" style="fill:${i ? "var(--turn)" : "var(--led)"}"/>`;
        });
        s += `<line x1="482" y1="${c + 28}" x2="768" y2="${c + 28}" class="grid"/>`;
      });
      for (let i = 0; i < 8; i++) s += T(500 + i * 35, 366, i + 1, "fs");
      s += T(400, 402, "More harmonics, brighter sound. The sine is the darkest, the sawtooth the brightest.", "fb");
      return svgFig("0 0 800 420", s, "Sine, triangle, square and sawtooth waves with their harmonics");
    },
    u2spectrum() {
      let s = T(400, 36, "Bright and dark are about harmonics", "fh");
      const amp = (i) => 1 / (i + 1),
        cut = 3,
        gain = (i) => (i <= cut ? 1 : Math.max(0, 1 - (i - cut) / 6));
      const bars = (base, f, c) => {
        let o = "";
        for (let i = 0; i < 16; i++) {
          const h = 95 * f(i);
          if (h > 1)
            o += `<rect x="${110 + i * 40}" y="${base - h}" width="22" height="${h}" rx="3" style="fill:${i ? c : "var(--led)"}"/>`;
        }
        return o + `<line x1="100" y1="${base}" x2="750" y2="${base}" class="ln"/>`;
      };
      s += T(100, 80, "Bright: many strong harmonics", "fl", "start") + bars(195, amp, "var(--turn)");
      s +=
        T(100, 240, "Dark: the same note through a low-pass filter", "fl", "start") +
        bars(355, (i) => amp(i) * gain(i), "var(--turn)");
      const cx = 121 + cut * 40,
        ex = 121 + (cut + 6) * 40;
      s +=
        `<path d="M100 262 L${cx} 262 L${ex} 355" class="mark" style="fill:none"/>` +
        `<line x1="${cx}" y1="256" x2="${cx}" y2="268" class="ln"/>` +
        T(cx - 8, 284, "cutoff", "fm", "end");
      s += T(110, 374, "the note", "fs", "start") + T(750, 374, "higher harmonics →", "fs", "end");
      s += T(400, 404, "A filter is like a tone knob turned down: the note stays, the highs go.", "fb");
      return svgFig("0 0 800 420", s, "Spectrum of a bright sound and the same sound filtered dark");
    },
    u2fm() {
      let s = T(400, 36, "FM in plain words", "fh");
      s += box(50, 110, 190, 50) + T(145, 141, "Modulator", "fl");
      s += box(50, 240, 190, 50) + T(145, 271, "Carrier", "fl");
      s += `<path d="M145 162 L145 236" class="arr"/><path d="M137 226 L145 238 L153 226" class="arr"/>`;
      s += T(155, 192, "wobbles its pitch", "fs", "start") + T(155, 210, "depth: how much", "fs", "start");
      s +=
        `<path d="M242 265 L290 265" class="arr"/><path d="M280 257 L292 265 L280 273" class="arr"/>` +
        T(266, 290, "sound", "fs");
      const fm = (y, I, c) => {
        const pts = [];
        for (let i = 0; i <= 360; i++) {
          const t = i / 360;
          pts.push([320 + 440 * t, y - 26 * Math.sin(2 * Math.PI * 3 * t + I * Math.sin(2 * Math.PI * 6 * t))]);
        }
        return `<path d="${P(pts)}" ${stroke(c, 2.5)}/>`;
      };
      s += T(320, 74, "no modulation: a pure, round tone", "fm", "start") + fm(112, 0, "var(--done)");
      s += T(320, 164, "a little: warmer, a few harmonics", "fm", "start") + fm(202, 1.2, "var(--turn)");
      s += T(320, 254, "a lot: bright, then noisy", "fm", "start") + fm(292, 5, "var(--hold)");
      s += T(400, 365, "More modulation, more harmonics, brighter sound.", "fb");
      s += T(400, 395, "The Model:Cycles has no filter knob: to darken a sound, turn the modulation down.", "fs");
      return svgFig("0 0 800 420", s, "FM: a modulator wobbling a carrier at three depths");
    },
    u2macros() {
      let s = T(400, 36, "The four macros, machine by machine", "fh");
      const cols = ["COLOR", "SHAPE", "SWEEP", "CONTOUR"],
        x0 = 140,
        cw = 160,
        y0 = 80,
        rh = 44;
      cols.forEach((c, i) => (s += T(x0 + cw * i + cw / 2, 68, c, "fl")));
      const M = [
        [
          "KICK",
          [
            ["soft square-like", "modulation"],
            ["triangle-like mod", "and feedback", 1],
            ["pitch sweep", "depth and time"],
            ["modulation", "envelope depth", 1],
          ],
        ],
        [
          "SNARE",
          [
            ["inharmonicity"],
            ["modulation amount", "and feedback", 1],
            ["pitch sweep", "depth and time"],
            ["modulation", "envelope depth", 1],
          ],
        ],
        [
          "METAL",
          [
            ["tune offset A"],
            ["modulation amount", "and feedback", 1],
            ["tune offset B"],
            ["modulation", "envelope depth", 1],
          ],
        ],
        ["PERC", [["inharmonicity"], ["modulation amount", 1], ["pitch sweep"], ["modulation", "envelope depth", 1]]],
        [
          "TONE",
          [["modulator ratio"], ["modulation amount", 1], ["feedback amount"], ["modulation", "envelope depth", 1]],
        ],
        [
          "CHORD",
          [
            ["interval mix,", "osc balance"],
            ["chord type", "or unison"],
            ["wavetable sweep"],
            ["filter cutoff", "envelope depth"],
          ],
        ],
      ];
      M.forEach(([n, cells], r) => {
        const y = y0 + r * rh;
        s += T(36, y + 28, n, "fl", "start");
        cells.forEach((cell, i) => {
          const sh = cell[cell.length - 1] === 1,
            lines = cell.filter((v) => typeof v === "string"),
            x = x0 + cw * i;
          s += `<rect x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${rh - 6}" rx="8" style="fill:${sh ? "var(--turn-soft)" : "var(--surface-2)"};stroke:var(--line)"/>`;
          s +=
            lines.length === 1
              ? T(x + cw / 2, y + 27, lines[0], "fm")
              : T(x + cw / 2, y + 19, lines[0], "fm") + T(x + cw / 2, y + 36, lines[1], "fm");
        });
      });
      s += T(
        400,
        372,
        "Shaded: how much modulation. More of it adds harmonics, so these are your brightness knobs.",
        "fb"
      );
      s += T(400, 400, "From Elektron's manual. Turn one, listen, and name what changed.", "fs");
      return svgFig("0 0 800 420", s, "What COLOR, SHAPE, SWEEP and CONTOUR do on each machine");
    },
    /* lesson 7 */
    u2layers() {
      let s = T(400, 36, "One drum, three layers", "fh");
      const rows = [
        [
          "Top",
          "the bright attack",
          "var(--turn)",
          [
            [200, 140],
            [203, 80],
            [208, 128],
            [212, 92],
            [216, 132],
            [222, 110],
            [240, 140],
          ],
        ],
        ["Body", "weight and pitch", "var(--led)", [[200, 230], [202, 170], ...decay(202, 230, 170, 150, 4)]],
        ["Tail", "how long it lingers", "var(--done)", [[200, 320], [215, 290], ...decay(215, 320, 290, 265, 2.4)]],
      ];
      rows.forEach(([n, d, c, pts], r) => {
        const b = 140 + r * 90;
        s += T(40, b - 32, n, "fl", "start") + T(40, b - 12, d, "fs", "start");
        s +=
          `<path d="${P(pts)} Z" style="fill:${c};opacity:.35"/><path d="${P(pts)}" ${stroke(c, 2.5)}/>` +
          axis(196, b, 490);
      });
      s += `<path d="M505 85 Q525 85 525 105 L525 300 Q525 320 505 320" class="ln"/><path d="M528 200 L548 200" class="arr"/><path d="M540 193 L550 200 L540 207" class="arr"/>`;
      s += box(560, 90, 215, 230) + T(667, 118, "heard as one drum", "fm");
      const sx = (x) => 570 + (x - 200) * 0.66;
      rows.forEach(([n, d, c, pts], r) => {
        const b = 140 + r * 90,
          q = pts.map(([x, y]) => [sx(x), 290 - (b - y) * 1.2]);
        s += `<path d="${P(q)} Z" style="fill:${c};opacity:.35"/><path d="${P(q)}" ${stroke(c, 2)}/>`;
      });
      s += axis(566, 290, 765) + T(765, 308, "time →", "fs", "end");
      s += T(400, 372, "Describe the drum you want first, then give each job to one layer.", "fb");
      s += T(400, 400, "A drawing of the idea, not a recipe.", "fs");
      return svgFig("0 0 800 420", s, "A drum split into top, body and tail layers");
    },
    u2palette() {
      let s = T(400, 36, "Your kit as a palette", "fh");
      s += `<line x1="100" y1="60" x2="100" y2="335" class="ln"/>` + axis(100, 335, 750);
      s +=
        T(92, 72, "long", "fs", "end") +
        T(92, 335, "short", "fs", "end") +
        T(108, 357, "low", "fs", "start") +
        T(750, 357, "high", "fs", "end");
      const pill = (x, y, t, c, dash) => {
        const w = t.length * 7.6 + 24;
        return (
          `<rect x="${x - w / 2}" y="${y - 14}" width="${w}" height="28" rx="14" style="fill:${dash ? "none" : c};stroke:${dash ? "var(--faint)" : "var(--line)"};${dash ? "stroke-dasharray:5 4" : ""}"/>` +
          T(x, y + 5, t, "fm")
        );
      };
      s +=
        pill(175, 265, "kick", "var(--led-soft)") +
        pill(330, 215, "snare body", "var(--hold-soft)") +
        pill(350, 135, "snare tail", "var(--hold-soft)");
      s +=
        pill(600, 312, "snare top", "var(--turn-soft)") +
        pill(645, 245, "dusty hats", "var(--turn-soft)") +
        pill(470, 290, "found tick", "var(--done-soft)");
      s += pill(655, 110, "crackle", "var(--done-soft)");
      s += pill(200, 95, "bass, later", "", true) + pill(475, 80, "chords, later", "", true);
      s += T(400, 392, "Each sound owns its own spot. A new sound fits best where nothing else lives.", "fb");
      s += T(400, 414, "Left to right: low to high. Bottom to top: short to long.", "fs");
      return svgFig("0 0 800 425", s, "Kit sounds placed by height and length");
    },
    /* lesson 8 */
    u2lfo() {
      let s = T(400, 36, "An LFO: a slow wave that turns a knob for you", "fh");
      s += `<path d="${wave(120, 170, 440, 62, 3, "tri")}" ${stroke("var(--turn)", 4)}/>`;
      s += `<line x1="120" y1="170" x2="560" y2="170" class="grid"/>`;
      s +=
        `<path d="M106 108 L106 232" class="ln"/><path d="M100 116 L106 106 L112 116 M100 224 L106 234 L112 224" class="ln"/>` +
        T(96, 166, "depth", "fm", "end") +
        T(96, 184, "(DEP)", "fs", "end");
      s +=
        `<path d="M120 92 L266 92" class="ln"/><path d="M120 86 L120 98 M266 86 L266 98" class="ln"/>` +
        T(193, 80, "one cycle: rate (LFO SPEED)", "fm");
      s += `<path d="M572 170 L612 170" class="arr"/><path d="M602 162 L614 170 L602 178" class="arr"/>`;
      const kx = 685,
        ky = 170,
        arc = (a0, a1, r) => {
          const p = (a) => [kx + r * Math.sin((a * Math.PI) / 180), ky - r * Math.cos((a * Math.PI) / 180)];
          const [x0, y0] = p(a0),
            [x1, y1] = p(a1);
          return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
        };
      s += `<path d="${arc(-135, 135, 58)}" ${stroke("var(--line)", 6)}/><path d="${arc(-60, 60, 58)}" ${stroke("var(--turn)", 6)}/>`;
      s += `<circle cx="${kx}" cy="${ky}" r="42" style="fill:var(--surface-2);stroke:var(--line)"/><line x1="${kx}" y1="${ky}" x2="${kx + 28}" y2="${ky - 28}" ${stroke("var(--fg)", 4)}/>`;
      s += T(kx, 252, "the knob it turns (DST)", "fm");
      const shapes = [
        ["Triangle", "tri"],
        ["Sine", "sine"],
        ["Square", "square"],
        ["Sawtooth", "saw"],
        ["Envelope", "env"],
        ["Random", "rand"],
      ];
      shapes.forEach(([n, t], i) => {
        const x = 40 + i * 125;
        s += `<rect x="${x}" y="285" width="100" height="62" rx="8" class="box"/>`;
        if (t === "env") {
          const pts = [[x + 10, 331], [x + 10, 297], ...decay(x + 10, 331, 297, 60, 5, 30), [x + 90, 331]];
          s += `<path d="${P(pts)}" ${stroke("var(--turn)", 2.5)}/>`;
        } else s += `<path d="${wave(x + 10, 316, 80, 17, 2, t)}" ${stroke("var(--turn)", 2.5)}/>`;
        s += T(x + 50, 370, n, "fm");
      });
      s += T(400, 404, "The seventh waveform, Ramp, is on your unit too: try it by ear.", "fs");
      return svgFig("0 0 800 420", s, "An LFO wave turning a knob, and the LFO waveforms");
    },
    u2reset() {
      let s = T(400, 36, "LFO SETUP: how the wave meets your notes", "fh");
      const hx = (i) => 230 + i * 70;
      const row = (c, reset) => {
        let o = `<line x1="200" y1="${c}" x2="760" y2="${c}" class="grid"/>`;
        if (!reset) {
          o += `<path d="${wave(200, c, 560, 32, 560 / 300, "tri")}" ${stroke("var(--turn)")}/>`;
        }
        for (let i = 0; i < 8; i++) {
          const x = hx(i);
          const v = reset ? 0 : wv("tri", (x - 200) / 300);
          if (reset) {
            const pts = [];
            for (let k = 0; k <= 30; k++) {
              const t = k / 30;
              pts.push([x + 60 * t, c - 32 * wv("tri", t * 0.2)]);
            }
            o += `<path d="${P(pts)}" ${stroke("var(--turn)")}/>`;
          }
          o += `<circle cx="${x}" cy="${c - 32 * v}" r="5" style="fill:var(--fg)"/>`;
          const len = reset ? 34 : 34 + 24 * v;
          o += `<rect x="${x - 4}" y="${c + 44}" width="${len}" height="10" rx="4" style="fill:var(--led)"/>`;
        }
        return o;
      };
      s += T(40, 108, "RST OFF", "fl", "start") + T(40, 128, "free-running", "fs", "start") + row(110, false);
      s += T(40, 248, "RST ON", "fl", "start") + T(40, 268, "restarts on every note", "fs", "start") + row(250, true);
      s += T(196, 158, "each hat's decay", "fs", "end") + T(196, 298, "each hat's decay", "fs", "end");
      s += T(400, 345, "OFF: every hat lands on a different part of the wave, so each one is different.", "fb");
      s += T(400, 372, "ON: the wave restarts on each note, so every hat gets the same movement.", "fb");
      s += T(
        400,
        402,
        "SPH sets where it restarts (0 = start, 64 = middle). FDE fades it in (negative) or out (positive).",
        "fs"
      );
      return svgFig("0 0 800 420", s, "LFO reset off and on across a row of hats");
    },
    u2attack() {
      let s = T(400, 36, "The slow-attack trick: an LFO as an envelope", "fh");
      const top = 100,
        b = 250;
      s +=
        T(150, 82, "1. WAV set to ENV", "fl") +
        T(400, 82, "2. DEP -64 on DIST", "fl") +
        T(650, 82, "3. What you hear", "fl");
      const p1 = [[45, b], [45, top], ...decay(45, b, top, 200, 4.5)];
      s += `<path d="${P(p1)}" ${stroke("var(--turn)")}/>` + axis(40, b, 260);
      const p2 = decay(295, top, b, 200, 4.5).map(([x, y]) => [x, y]);
      s += `<path d="${P([[295, top], ...p2])}" ${stroke("var(--hold)")}/>` + axis(290, b, 510);
      const rise = [];
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        rise.push([545 + 130 * t, b - (b - top) * (1 - Math.exp(-4.5 * t))]);
      }
      const p3 = [[545, b], ...rise, ...decay(675, b, rise[rise.length - 1][1], 85, 5, 30)];
      s +=
        `<path d="${P(p3)} Z" style="fill:var(--led-soft);stroke:none"/><path d="${P(p3)}" ${stroke("var(--led)")}/>` +
        axis(540, b, 760);
      s += `<line x1="675" y1="100" x2="675" y2="${b}" class="ln2"/>` + T(680, 272, "LEN ends", "fs", "start");
      [
        [268, 175],
        [518, 175],
      ].forEach(
        ([x, y]) =>
          (s += `<path d="M${x} ${y} L${x + 16} ${y}" class="arr"/><path d="M${x + 8} ${y - 6} L${x + 17} ${y} L${x + 8} ${y + 6}" class="arr"/>`)
      );
      s +=
        T(150, 272, "runs once per note", "fs") +
        T(400, 272, "pulls volume down, then lets go", "fs") +
        T(600, 292, "a slow fade-in, held by GATE", "fs");
      s += T(400, 338, "Set GATE on and FIX off, then WAV ENV, MUL X1, DST DIST, DEP -64.", "fb");
      s += T(400, 368, "LFO SPEED and MUL now set how long the fade-in takes.", "fb");
      s += T(400, 400, "Straight from the Model:Cycles manual's LFO section.", "fs");
      return svgFig("0 0 800 420", s, "Using the LFO envelope with negative depth for a slow attack");
    },
  };
})();
