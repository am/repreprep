import { esc, svgFig, T, hits, COUNT16, ROWC } from "../../shared/html.js";

/* ---- Unit 3: Notes and harmony ---- */
export const UNIT_FIGS_3 = {
  /* lesson 9 */
  u3keys() {
    let s = T(400, 36, "Twelve notes, then the pattern repeats", "fh");
    const x0 = 120,
      w = 70,
      y0 = 70,
      h = 190;
    const whites = ["A", "B", "C", "D", "E", "F", "G", "A"],
      wsemi = [0, 2, 3, 5, 7, 8, 10, 12];
    whites.forEach((n, i) => {
      const x = x0 + i * w,
        root = i === 0 || i === 7;
      s +=
        `<rect x="${x}" y="${y0}" width="${w}" height="${h}" rx="6" style="fill:${root ? "var(--led-soft)" : "var(--surface)"};stroke:var(--line);stroke-width:1.5"/>` +
        T(x + w / 2, y0 + h - 18, n, "fl") +
        T(x + w / 2, 292, wsemi[i], "fs");
    });
    [
      [0, "A#", 1],
      [2, "C#", 4],
      [3, "D#", 6],
      [5, "F#", 9],
      [6, "G#", 11],
    ].forEach(([i, n, sm]) => {
      const cx = x0 + (i + 1) * w;
      s +=
        `<rect x="${cx - 20}" y="${y0}" width="40" height="115" rx="5" style="fill:var(--faint);stroke:var(--line)"/>` +
        T(cx, y0 - 8, n, "fs") +
        T(cx, 292, sm, "fs");
    });
    s += T(x0 - 12, 292, "semitones", "fs", "end");
    s += `<path d="M155 302 v7 H190 v-7" class="ln"/>` + T(198, 312, "1 semitone", "fs", "start");
    s += `<path d="M155 324 v8 H645 v-8" class="ln"/>` + T(400, 352, "12 semitones = one octave (A to A)", "fm");
    s += T(400, 384, "Each key is one semitone from the next, black keys included.", "fb");
    s += T(400, 408, "Same letter an octave apart: it sounds like the same note, only higher.", "fs");
    return svgFig("0 0 800 420", s, "One octave of a keyboard from A to A, with semitones counted");
  },
  u3trigmap() {
    let s = T(400, 36, "The trig keys as a keyboard: 9 is the root", "fh");
    const x0 = 35,
      kw = 40,
      st = 46;
    const names = ["C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"];
    const rows = [
      ["Natural minor: the 9 lit keys", [2, 4, 5, 7, 9, 11, 12, 14, 16], 95, "var(--turn)"],
      ["Minor pentatonic: 7 lit keys, nothing clashes", [2, 4, 7, 9, 12, 14, 16], 215, "var(--done)"],
    ];
    rows.forEach(([lab, on, y, c]) => {
      s += T(x0, y - 12, lab, "fm", "start");
      for (let i = 1; i <= 16; i++) {
        const x = x0 + (i - 1) * st,
          lit = on.includes(i);
        s +=
          `<rect x="${x}" y="${y}" width="${kw}" height="${kw}" rx="7" style="fill:${i === 9 ? "var(--led)" : lit ? c : "var(--surface-2)"};stroke:var(--line)"/>` +
          T(x + kw / 2, y + 26, i, lit ? "fbar" : "fm");
      }
    });
    for (let i = 1; i <= 16; i++) {
      const x = x0 + (i - 1) * st + kw / 2;
      s += T(x, 153, names[i - 1], "fs") + T(x, 273, i === 9 ? "0" : i < 9 ? "−" + (9 - i) : "+" + (i - 9), "fs");
    }
    s += T(400, 305, "Top names: the notes when your root is A. Bottom numbers: semitones from the root.", "fm");
    s += T(400, 345, "No scale lock on the Model:Cycles: stay on the lit keys and you stay in key.", "fb");
    s += T(400, 380, "2 and 14 are the same note an octave apart, as are 4 and 16.", "fs");
    return svgFig("0 0 800 420", s, "The 16 trig keys with the natural minor and minor pentatonic keys lit");
  },
  /* lesson 10 */
  u3bassjobs() {
    let s = T(400, 36, "Three jobs of a bassline", "fh");
    [
      ["Rhythm", 140, "plays with the kick", "so the low end hits as one"],
      ["Harmony", 400, "plays the chord's root", "so you hear where home is"],
      ["Melody", 660, "octave jumps and", "notes that walk to the next"],
    ].forEach(([h, x, a, b]) => {
      s +=
        `<rect x="${x - 115}" y="62" width="230" height="230" rx="14" class="box"/>` +
        T(x, 94, h, "fl") +
        T(x, 252, a, "fm") +
        T(x, 274, b, "fm");
    });
    // rhythm: kick and bass on an 8-step strip
    s += T(62, 145, "kick", "fs", "end") + T(62, 195, "bass", "fs", "end");
    for (let j = 0; j < 8; j++) {
      const x = 74 + j * 22,
        k = [0, 4, 5].includes(j),
        b = [0, 5].includes(j);
      if (b) s += `<line x1="${x}" y1="140" x2="${x}" y2="190" class="ln2"/>`;
      s += `<circle cx="${x}" cy="140" r="7" style="${k ? "fill:var(--led)" : "fill:none;stroke:var(--line)"}"/><circle cx="${x}" cy="190" r="7" style="${b ? "fill:var(--done)" : "fill:none;stroke:var(--line)"}"/>`;
    }
    // harmony: a chord with its root picked out
    [
      ["5th", 120, 0],
      ["3rd", 152, 0],
      ["root", 184, 1],
    ].forEach(([n, y, r]) => {
      s +=
        `<rect x="340" y="${y}" width="120" height="24" rx="6" style="fill:${r ? "var(--done)" : "var(--surface)"};stroke:var(--line)"/>` +
        T(400, y + 17, n, r ? "fbar" : "fs");
    });
    // melody: root, root, octave, approach, root
    const pts = [
      [590, 200],
      [625, 200],
      [660, 128],
      [695, 212],
      [730, 200],
    ];
    s += `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" class="arr"/>`;
    pts.forEach(([x, y], i) => {
      s += `<circle cx="${x}" cy="${y}" r="7" style="fill:${i === 2 ? "var(--turn)" : i === 3 ? "var(--hold)" : "var(--done)"}"/>`;
    });
    s += T(660, 114, "octave", "fs") + T(695, 234, "approach", "fs");
    s += T(400, 340, "Space is the fourth job: every rest lets the kick and chords breathe.", "fb");
    s += T(400, 372, "Start on one note with the kick, then add one move at a time.", "fs");
    return svgFig("0 0 800 420", s, "Rhythm, harmony and melody: the three jobs of a bassline");
  },
  u3bassmap() {
    let s = T(400, 36, "Your bassline across B01's four bars", "fh");
    const x0 = 110,
      sw = 10,
      bw = 160,
      Y = (v) => 270 - (v + 7) * 9;
    const bars = [
      ["A (root)", 0],
      ["F: 4 down", -4],
      ["D: 7 down", -7],
      ["E: 5 down", -5],
    ];
    for (let b = 0; b <= 4; b++) {
      const x = x0 + b * bw;
      s += `<line x1="${x}" y1="80" x2="${x}" y2="310" class="ln"/>`;
      if (b < 4)
        for (let q = 1; q < 4; q++) s += `<line x1="${x + q * 40}" y1="84" x2="${x + q * 40}" y2="284" class="grid"/>`;
    }
    bars.forEach(([lab, r], b) => {
      const bx = x0 + b * bw;
      s += T(bx + 80, 70, lab, "fm");
      const note = (st, len, v, c) =>
        `<rect x="${bx + (st - 1) * sw + 1}" y="${Y(v) - 4}" width="${len * sw - 2}" height="8" rx="3" style="fill:${c}"/>`;
      s += note(1, 6, r, "var(--done)") + note(11, 3, r, "var(--done)") + note(15, 1, r + 12, "var(--turn)");
      if (b === 3) s += note(16, 1, -2, "var(--hold)") + T(bx + 15 * sw + 5, Y(-2) - 9, "G", "fs");
      [1, 9, 11].forEach(
        (k) => (s += `<circle cx="${bx + (k - 1) * sw + 5}" cy="300" r="4" style="fill:var(--led)"/>`)
      );
    });
    s += T(x0 + 14 * sw + 5, Y(12) - 9, "oct", "fs");
    s +=
      T(x0 - 10, 304, "kick", "fs", "end") +
      T(x0 - 10, Y(12) + 4, "high", "fs", "end") +
      T(x0 - 10, Y(-7) + 4, "low", "fs", "end");
    s += T(400, 345, "Roots on the 1 and with the kick, an octave hop at the end of each bar.", "fb");
    s += T(400, 375, "Bar 4 ends on G, which walks up into the A at the top: an approach note.", "fs");
    s += T(400, 400, "Counted from A: F is 4 semitones down, D is 7 down, E is 5 down.", "fs");
    return svgFig(
      "0 0 800 420",
      s,
      "Piano roll of the B01 bassline: roots A, F, D, E with octave hops and an approach note"
    );
  },
  /* lesson 11 */
  u3formula() {
    let s = T(400, 36, "Chords are formulas, counted in semitones", "fh");
    const x0 = 280,
      st = 42,
      bw = 38,
      names = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
      cols = ["var(--led)", "var(--hold)", "var(--turn)", "var(--done)"];
    s += T(265, 76, "if root is A:", "fs", "end");
    names.forEach((n, i) => (s += T(x0 + i * st + bw / 2, 76, n, "fs")));
    [
      ["Minor", "0-3-7", "SHAPE: minor", [0, 3, 7]],
      ["Major", "0-4-7", "SHAPE: Major", [0, 4, 7]],
      ["Minor 7th", "0-3-7-10", "SHAPE: m7", [0, 3, 7, 10]],
      ["Major 7th", "0-4-7-11", "SHAPE: Maj7", [0, 4, 7, 11]],
    ].forEach(([n, f, sh, on], r) => {
      const y = 85 + r * 75;
      s += T(40, y + 18, n, "fl", "start") + T(265, y + 18, f, "fm", "end") + T(40, y + 38, sh, "fs", "start");
      for (let i = 0; i < 12; i++) {
        const k = on.indexOf(i),
          x = x0 + i * st;
        s +=
          `<rect x="${x}" y="${y}" width="${bw}" height="40" rx="6" style="fill:${k >= 0 ? cols[k] : "var(--surface-2)"};stroke:var(--line)"/>` +
          T(x + bw / 2, y + 25, i, k >= 0 ? "fbar" : "fs");
      }
    });
    s += T(400, 392, "The 3rd decides it: 3 up is minor, 4 up is major. A 7th on top softens it.", "fb");
    return svgFig("0 0 800 420", s, "Semitone formulas for minor, major, minor 7th and major 7th chords");
  },
  u3prog() {
    let s = T(400, 36, "Progressions in Roman numerals", "fh");
    const x0 = 220,
      st = 140,
      cw = 128;
    [
      ["Minor, sad", ["i", "VII", "iv", "i"], ["Am", "G", "Dm", "Am"], null],
      ["Minor 7ths, jazzy", ["i7", "iv7", "VImaj7", "VII7"], ["Am7", "Dm7", "Fmaj7", "G7"], null],
      [
        "Your track, B01",
        ["i7", "VImaj7", "iv7", "v7"],
        ["Am7", "Fmaj7", "Dm7", "Em7"],
        ["root", "4 down", "7 down", "5 down"],
      ],
    ].forEach(([lab, num, ch, mv], r) => {
      const y = 70 + r * 100;
      s += T(205, y + 45, lab, "fm", "end");
      num.forEach((n, i) => {
        const x = x0 + i * st,
          home = n[0] === "i" && (n === "i" || n === "i7");
        s +=
          `<rect x="${x}" y="${y}" width="${cw}" height="80" rx="10" style="fill:${home ? "var(--led-soft)" : "var(--surface-2)"};stroke:var(--line)"/>` +
          T(x + cw / 2, y + 32, n, "fl") +
          T(x + cw / 2, y + 54, ch[i], "fm") +
          (mv ? T(x + cw / 2, y + 72, mv[i], "fs") : "");
      });
    });
    s += T(400, 385, "Lower case (i, iv, v) = minor chord. Upper case (VI, VII) = major.", "fb");
    s += T(400, 410, "The numeral counts up the scale from the root: in A minor, iv = D, VI = F, VII = G.", "fs");
    return svgFig("0 0 800 420", s, "Three chord progressions written as Roman numerals");
  },
  /* lesson 12 */
  u3contour() {
    let s = T(400, 36, "Steps and leaps", "fh");
    const Y = (d) => 300 - d * 28,
      X = (i) => 140 + i * 52,
      names = ["A", "B", "C", "D", "E", "F", "G", "A"];
    names.forEach(
      (n, d) =>
        (s += `<line x1="110" y1="${Y(d)}" x2="740" y2="${Y(d)}" class="grid"/>` + T(96, Y(d) + 4, n, "fs", "end"))
    );
    const m = [0, 1, 2, 1, 0, 4, 3, 2, 1, 2, 1, 0];
    for (let i = 1; i < m.length; i++) {
      const leap = Math.abs(m[i] - m[i - 1]) >= 2;
      s += `<line x1="${X(i - 1)}" y1="${Y(m[i - 1])}" x2="${X(i)}" y2="${Y(m[i])}" style="stroke:${leap ? "var(--hold)" : "var(--turn)"};stroke-width:${leap ? 4 : 3};stroke-linecap:round"/>`;
    }
    m.forEach((d, i) => (s += `<circle cx="${X(i)}" cy="${Y(d)}" r="7" style="fill:var(--led)"/>`));
    s += T(192, 250, "steps", "fm") + T(362, 236, "leap", "fm", "end") + T(500, 196, "steps back down", "fm", "start");
    s += T(400, 345, "Mostly steps, a few leaps. After a leap, step back the other way.", "fb");
    s += T(400, 375, "Put chord tones (root, 3rd, 5th) on strong beats, passing notes in between.", "fs");
    s += T(400, 400, "An example of the idea, not a specific song.", "fs");
    return svgFig("0 0 800 420", s, "A melody line moving mostly by steps, with one leap");
  },
  u3qa() {
    let s = T(400, 36, "Question and answer", "fh");
    const L = { A: 210, B: 180, C: 150 };
    [
      [
        "Question",
        50,
        [
          ["A", 140],
          ["C", 210],
          ["B", 280],
        ],
        "ends on B: a comma",
        280,
      ],
      [
        "Answer",
        420,
        [
          ["A", 510],
          ["C", 570],
          ["B", 630],
          ["A", 690],
        ],
        "ends on A: home",
        670,
      ],
    ].forEach(([h, bx, pts, end, ex]) => {
      s += `<rect x="${bx}" y="60" width="330" height="200" rx="14" class="box"/>` + T(bx + 165, 90, h, "fl");
      Object.entries(L).forEach(
        ([n, y]) =>
          (s +=
            `<line x1="${bx + 40}" y1="${y}" x2="${bx + 310}" y2="${y}" class="grid"/>` +
            T(bx + 32, y + 4, n, "fs", "end"))
      );
      s += `<polyline points="${pts.map(([n, x]) => x + "," + L[n]).join(" ")}" class="arr"/>`;
      pts.forEach(([n, x], i) => {
        const last = i === pts.length - 1;
        s += `<circle cx="${x}" cy="${L[n]}" r="${last ? 10 : 7}" style="fill:${last ? (h === "Answer" ? "var(--done)" : "var(--hold)") : "var(--led)"}"/>`;
      });
      s += T(ex, 242, end, "fm");
    });
    s += T(50, 284, "In B01:", "fs", "start");
    [
      ["bar 1: chords", "var(--turn-soft)"],
      ["bar 2: melody asks", "var(--hold-soft)"],
      ["bar 3: chords", "var(--turn-soft)"],
      ["bar 4: melody answers", "var(--done-soft)"],
    ].forEach(([t, c], i) => {
      const x = 50 + i * 175;
      s +=
        `<rect x="${x}" y="292" width="171" height="40" rx="8" style="fill:${c};stroke:var(--line)"/>` +
        T(x + 85, 317, t, "fm");
    });
    s += T(400, 372, "A question ends away from home. The answer repeats it and lands on the root.", "fb");
    s += T(400, 402, "Leave space: the chords call, the melody replies in the gap.", "fs");
    return svgFig("0 0 800 420", s, "A melody question ending on B and an answer ending on A");
  },
};
