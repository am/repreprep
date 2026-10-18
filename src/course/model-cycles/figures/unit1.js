import { esc, svgFig, T, hits, COUNT16, ROWC } from "../../shared/html.js";

/* ---------- Figures: our own drawings and playable examples for the Learn steps ----------
   A step with fig:"name" shows FIGS[name]() in place of the panel. Grids (fig:{grid:{...}}) can be played and edited. */
export const UNIT_FIGS_1 = {
  /* lesson 1 */
  pulse() {
    let b = "";
    const x0 = 60,
      w = 680,
      beat = w / 8;
    b += T(400, 40, "The beat: a steady pulse you can tap your foot to", "fh");
    for (let i = 0; i < 8; i++) {
      const x = x0 + beat * i + beat / 2;
      b +=
        `<circle cx="${x}" cy="130" r="${i % 4 === 0 ? 20 : 14}" style="fill:${i % 4 === 0 ? "var(--led)" : "var(--fg)"};opacity:${i % 4 === 0 ? 1 : 0.75}"/>` +
        T(x, 185, String((i % 4) + 1), "fl");
    }
    [0, 4, 8].forEach((i) => {
      const x = x0 + beat * i;
      b += `<line x1="${x}" y1="90" x2="${x}" y2="215" class="ln2"/>`;
    });
    b += T(x0 + beat * 2, 240, "bar 1", "fm") + T(x0 + beat * 6, 240, "bar 2", "fm");
    b += `<path d="M${x0} 280 h${w}" class="ln"/>` + T(400, 310, "time →", "fs");
    b += T(400, 360, "Tempo = beats per minute (BPM). At 90 BPM a beat comes every 0.67 seconds.", "fb");
    b += T(400, 392, "Four beats make a bar (4/4). The first beat of each bar, the downbeat, feels strongest.", "fb");
    return svgFig("0 0 800 420", b, "Beats grouped into bars of four");
  },
  tempo() {
    const X = (b) => 60 + (b - 60) * (680 / 90);
    let s = T(400, 36, "Where styles usually sit (BPM)", "fh");
    const bands = [
      ["Dub and reggae", 62, 80, 0, "var(--done)"],
      ["Downtempo, trip hop, hip hop", 80, 105, 1, "var(--turn)"],
      ["House", 118, 128, 2, "var(--hold)"],
      ["Techno", 125, 140, 3, "var(--led)"],
      ["UK garage, 2-step", 128, 138, 4, "var(--hold)"],
      ["Psytrance", 138, 148, 5, "var(--led)"],
    ];
    bands.forEach(([n, a, z, r, c]) => {
      const y = 74 + r * 37;
      const right = X(z) + 10 + n.length * 8 < 770;
      s +=
        `<rect x="${X(a)}" y="${y}" width="${X(z) - X(a)}" height="28" rx="7" style="fill:${c};opacity:.85"/>` +
        (right ? T(X(z) + 10, y + 20, n, "fl", "start") : T(X(a) - 10, y + 20, n, "fl", "end"));
    });
    s += `<line x1="${X(90)}" y1="66" x2="${X(90)}" y2="300" class="mark"/>` + T(X(90), 60, "your track: 90", "fm");
    for (let b = 60; b <= 150; b += 10) {
      s += `<line x1="${X(b)}" y1="296" x2="${X(b)}" y2="304" class="ln"/>` + T(X(b), 346, b, "fs");
    }
    s += `<line x1="60" y1="300" x2="740" y2="300" class="ln"/>`;
    s += T(400, 392, "Half-time trick: at 140 BPM with the snare only on beat 3, music feels like 70.", "fb");
    return svgFig("0 0 800 420", s, "Tempo ranges of styles");
  },
  /* lesson 2 */
  roles() {
    let s = T(400, 36, "Each drum has a job, and a place from low to high", "fh");
    s += `<defs><linearGradient id="spec" x1="0" x2="1"><stop offset="0" stop-color="var(--led)" stop-opacity=".5"/><stop offset=".5" stop-color="var(--hold)" stop-opacity=".35"/><stop offset="1" stop-color="var(--turn)" stop-opacity=".5"/></linearGradient></defs>`;
    s +=
      `<rect x="60" y="300" width="680" height="16" rx="8" fill="url(#spec)"/>` +
      T(60, 345, "low (felt in the body)", "fs", "start") +
      T(740, 345, "high (air, sparkle)", "fs", "end");
    const items = [
      ["Kick", 120, "var(--led)", "The anchor", "strong beats"],
      ["Snare, clap, rim", 300, "var(--hold)", "The backbeat", "beats 2 and 4"],
      ["Percussion", 470, "var(--done)", "The colour", "weak 16ths"],
      ["Hats, shakers", 650, "var(--turn)", "The clock", "between the beats"],
    ];
    items.forEach(([n, x, c, j, w], i) => {
      s +=
        `<line x1="${x}" y1="${230}" x2="${x}" y2="300" class="ln"/><circle cx="${x}" cy="308" r="9" style="fill:${c}"/><rect x="${x - 82}" y="${90 + (i % 2) * 40}" width="164" height="100" rx="12" class="box"/>` +
        T(x, 122 + (i % 2) * 40, n, "fl") +
        T(x, 152 + (i % 2) * 40, j, "fm") +
        T(x, 176 + (i % 2) * 40, w, "fs");
    });
    s += T(400, 395, "Rule of thumb: heavy, low sounds on strong beats. Light, high sounds on the weak ones.", "fb");
    return svgFig("0 0 800 420", s, "Drum roles across the frequency range");
  },
  /* lesson 3 */
  hierarchy() {
    let s = T(400, 36, "Not all 16 steps are equal", "fh");
    const x0 = 80,
      w = 40;
    const h = (i) => (i === 0 ? 200 : i % 4 === 0 ? 150 : i % 2 === 0 ? 95 : 50);
    for (let i = 0; i < 16; i++) {
      const x = x0 + i * w;
      const v = h(i);
      s +=
        `<rect x="${x + 5}" y="${280 - v}" width="${w - 10}" height="${v}" rx="5" style="fill:${i % 4 === 0 ? "var(--led)" : i % 2 === 0 ? "var(--hold)" : "var(--turn)"};opacity:.9"/>` +
        T(x + w / 2, 305, COUNT16[i], "fl") +
        T(x + w / 2, 330, i + 1, "fs" + (i % 4 === 0 ? " u" : ""));
    }
    s += T(60, 312, "count", "fs", "end") + T(60, 336, "trig", "fs", "end");
    [
      ["beats: strongest", x0 + 20, "var(--led)"],
      ["&: medium", x0 + 260, "var(--hold)"],
      ["e and a: weakest", x0 + 460, "var(--turn)"],
    ].forEach(([t, x, c]) => {
      s +=
        `<rect x="${x}" y="360" width="14" height="14" rx="3" style="fill:${c}"/>` + T(x + 22, 372, t, "fm", "start");
    });
    s += T(400, 408, "Groove lives in how you treat the weak steps.", "fb");
    return svgFig("0 0 800 420", s, "Strong and weak steps in a bar");
  },
  swing() {
    let s = T(400, 36, "Swing delays only the weak 16ths (e and a)", "fh");
    const x0 = 200,
      w = 560;
    [
      ["50% (straight)", 0],
      ["60% (lazy)", 0.2],
      ["67% (shuffle)", 0.34],
    ].forEach(([n, d], r) => {
      const y = 110 + r * 95;
      s += T(x0 - 14, y + 6, n, "fm", "end") + `<line x1="${x0}" y1="${y}" x2="${x0 + w}" y2="${y}" class="ln"/>`;
      for (let i = 0; i < 8; i++) {
        const base = x0 + i * (w / 8);
        const off = i % 2 ? d * (w / 8) : 0;
        s += `<line x1="${base}" y1="${y - 26}" x2="${base}" y2="${y + 26}" class="grid"/>`;
        s += `<circle cx="${base + off}" cy="${y}" r="${i % 2 ? 11 : 15}" style="fill:${i % 2 ? "var(--turn)" : "var(--led)"}"/>`;
        if (i % 2 && d) s += `<path d="M${base + 3} ${y - 22} H${base + off - 4}" class="arr"/>`;
        if (r === 0) s += T(base, y - 34, ["1", "e", "&", "a", "2", "e", "&", "a"][i], "fs");
      }
    });
    s += T(400, 400, "The strong steps never move, so the beat stays solid while the groove leans.", "fb");
    return svgFig("0 0 800 420", s, "Straight and swung 16th notes");
  },
  nudge() {
    let s = T(400, 36, "Off the grid on purpose", "fh");
    const x0 = 110,
      w = 640,
      st = w / 16;
    const rows = [
      ["kick", [0, 10], [0, 0], "var(--led)"],
      ["snare", [4, 12], [0, 0], "var(--hold)"],
      ["hats", [2, 6, 10, 14, 1, 5, 9, 13], [0.0, 0.0, 0.0, 0.0, 0.22, 0.28, 0.18, 0.3], "var(--turn)"],
    ];
    for (let i = 0; i <= 16; i++)
      s += `<line x1="${x0 + i * st}" y1="70" x2="${x0 + i * st}" y2="270" class="${i % 4 ? "grid" : "ln"}"/>`;
    rows.forEach(([n, steps, off, c], r) => {
      const y = 105 + r * 60;
      s += T(x0 - 28, y + 6, n, "fm", "end");
      steps.forEach((k, j) => {
        s += `<circle cx="${x0 + (k + off[j]) * st + st / 2 - st / 2}" cy="${y}" r="${off[j] ? 9 : 13}" style="fill:${c};opacity:${off[j] ? 0.65 : 1}"/>`;
      });
    });
    s += T(400, 310, "Kick and snare sit exactly on the grid. The quiet in-between hats arrive a touch late.", "fb");
    s += T(400, 342, "Hip hop rule: strong hits on time, weak hits lazy. Everything late just sounds sloppy.", "fb");
    s += T(400, 384, "Burial placed his drums by eye in a wave editor with no grid at all.", "fs");
    return svgFig("0 0 800 420", s, "Strong hits on the grid, weak hits nudged late");
  },
  /* lesson 4 */
  phrase() {
    let s = T(400, 36, "Music talks in phrases of 4 and 8 bars", "fh");
    const L = ["A", "B", "A", "C", "A", "B", "A", "D"];
    const sub = { A: "the loop", B: "one small change", C: "a bigger change", D: "fill or empty" };
    L.forEach((l, i) => {
      const x = 70 + (i % 4) * 170,
        y = 80 + Math.floor(i / 4) * 130;
      const c = { A: "var(--surface-2)", B: "var(--turn-soft)", C: "var(--hold-soft)", D: "var(--led-soft)" }[l];
      s +=
        `<rect x="${x}" y="${y}" width="150" height="100" rx="12" style="fill:${c};stroke:var(--line)"/>` +
        T(x + 75, y + 48, l, "fbig") +
        T(x + 75, y + 78, sub[l], "fs") +
        T(x + 12, y + 22, "bar " + (i + 1), "fs", "start");
    });
    s += T(
      400,
      375,
      "Bar 4 answers the first three. Bar 8 closes the phrase and tells you something new is coming.",
      "fb"
    );
    s += T(400, 404, 'An "empty" (dropping the kick for a bar or a beat) is as strong as a fill.', "fs");
    return svgFig("0 0 800 420", s, "An 8-bar phrase A B A C A B A D");
  },
  conditions() {
    let s = T(400, 36, "Trig conditions: when does a step play?", "fh");
    const c0 = 300,
      cw = 100;
    ["pass 1", "pass 2", "pass 3", "pass 4"].forEach((p, i) => (s += T(c0 + cw * i + cw / 2, 80, p, "fm")));
    const rows = [
      ["always", [1, 1, 1, 1]],
      ["1:2  first of every 2", [1, 0, 1, 0]],
      ["2:2  second of every 2", [0, 1, 0, 1]],
      ["1:4  first of every 4", [1, 0, 0, 0]],
      ["4:4  last of every 4", [0, 0, 0, 1]],
      ["50%  coin toss", [2, 2, 2, 2]],
      ["FILL  while you hold [PAGE]", [3, 3, 3, 3]],
    ];
    rows.forEach(([n, v], r) => {
      const y = 110 + r * 40;
      s += T(c0 - 16, y + 20, n, "fm", "end");
      v.forEach((on, i) => {
        s +=
          `<rect x="${c0 + cw * i + 20}" y="${y + 4}" width="${cw - 40}" height="24" rx="6" style="fill:${on === 1 ? "var(--done)" : on === 2 ? "var(--hold-soft)" : on === 3 ? "var(--turn-soft)" : "var(--surface-2)"};stroke:var(--line)"/>` +
          (on === 2
            ? T(c0 + cw * i + cw / 2, y + 21, "?", "fs")
            : on === 3
              ? T(c0 + cw * i + cw / 2, y + 21, "hold", "fs")
              : "");
      });
    });
    s += T(400, 410, "A pass is one time round the pattern. On a 4-bar pattern, 2:2 means bar 8.", "fb");
    return svgFig("0 0 800 425", s, "Trig conditions across four passes");
  },
  /* song studies */
  layers() {
    let s = T(400, 36, "One idea in focus, layers arriving around it", "fh");
    const rows = [
      ["Piano chords", 0, "var(--turn)"],
      ["Kick", 2, "var(--led)"],
      ["Hats", 3, "var(--hold)"],
      ["Bass", 4, "var(--done)"],
      ["Strings", 5, "var(--turn)"],
    ];
    const x0 = 200,
      cw = 70;
    for (let b = 0; b < 8; b++) s += T(x0 + b * cw + cw / 2, 78, b * 8 + 1 + "", "fs");
    s += T(x0 - 16, 78, "bar", "fs", "end");
    rows.forEach(([n, start, c], r) => {
      const y = 96 + r * 48;
      s +=
        T(x0 - 16, y + 25, n, "fm", "end") +
        `<rect x="${x0}" y="${y + 6}" width="${cw * 8}" height="28" rx="6" style="fill:var(--surface-2);stroke:var(--line)"/>` +
        `<rect x="${x0 + start * cw}" y="${y + 6}" width="${cw * (8 - start)}" height="28" rx="6" style="fill:${c};opacity:${r === 4 ? 0.45 : 0.85}"/>`;
    });
    s +=
      `<path d="M${x0} 392 L${x0 + cw * 2} 384 L${x0 + cw * 3} 372 L${x0 + cw * 4} 360 L${x0 + cw * 5} 348 L${x0 + cw * 8} 342" class="ln2" fill="none"/>` +
      T(x0 - 16, 375, "energy", "fs", "end");
    s +=
      T(400, 432, "The chords never stop. Each new layer is one step up in energy.", "fb") +
      T(400, 458, "A drawing of the idea, not a map of the song.", "fs");
    return svgFig("0 0 800 470", s, "Layers arriving around one idea");
  },
  stack() {
    let s = T(400, 36, "One note at a time, stacked into chords", "fh");
    const pl = (x, y, c) =>
      `<path d="M${x} ${y} l8 -34 l10 34 l28 0" style="fill:none;stroke:${c};stroke-width:3;stroke-linejoin:round"/>`;
    [
      [0, "root"],
      [1, "3 semitones up"],
      [2, "7 semitones up"],
    ].forEach(([i, l]) => {
      const y = 310 - i * 80;
      s +=
        `<rect x="90" y="${y - 50}" width="280" height="64" rx="10" class="box"/>` +
        pl(108, y, "var(--turn)") +
        pl(156, y, "var(--turn)") +
        pl(204, y, "var(--turn)") +
        T(360, y - 12, l, "fs", "end") +
        T(80, y - 12, "take " + (i + 1), "fs", "end");
    });
    s += `<path d="M385 200 L455 200" class="arr"/><path d="M445 192 L457 200 L445 208" class="arr"/>`;
    s += `<rect x="470" y="110" width="270" height="200" rx="14" class="box"/>` + T(605, 145, "Played together", "fl");
    [0, 1, 2].forEach((i) => {
      s +=
        pl(510 + i * 70, 265, "var(--turn)") +
        pl(510 + i * 70, 235, "var(--hold)") +
        pl(510 + i * 70, 205, "var(--led)");
    });
    s += T(605, 290, "a minor chord", "fs");
    s += T(
      400,
      395,
      "A synth that plays one note at a time can still play chords: record it again at each pitch.",
      "fb"
    );
    return svgFig("0 0 800 420", s, "Stacking one sound into chords");
  },
  plock() {
    let s = T(400, 36, "Micro edits: every step gets its own small change", "fh");
    const x0 = 70,
      w = 41,
      dec = [0.5, 0.5, 0.5, 0.5, 0.5, 0.85, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.3, 0.5, 0.5],
      pit = [0, 0, 0, 0, 0, 0, 0, 0, 0, -2, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 16; i++) {
      const x = x0 + i * w,
        on = i % 2 === 1;
      s +=
        `<rect x="${x + 4}" y="100" width="${w - 8}" height="34" rx="6" style="fill:${on ? "var(--done)" : "var(--surface-2)"};stroke:var(--line)"/>` +
        T(x + w / 2, 160, i + 1 + "", "fs");
      if (on) {
        const h = dec[i] * 110;
        s += `<rect x="${x + 12}" y="${300 - h}" width="${w - 24}" height="${h}" rx="3" style="fill:${dec[i] !== 0.5 || pit[i] ? "var(--led)" : "var(--faint)"};opacity:${dec[i] !== 0.5 || pit[i] ? 1 : 0.5}"/>`;
        const lab = pit[i] ? "pitch" : dec[i] > 0.5 ? "longer" : dec[i] < 0.5 ? "shorter" : "";
        if (lab) s += T(x + w / 2, 322, lab, "fs");
      }
    }
    s += T(x0, 88, "one sound on every even step", "fs", "start") + T(x0, 200, "decay of each step", "fs", "start");
    s += `<line x1="${x0}" y1="300" x2="${x0 + 16 * w}" y2="300" class="ln"/>`;
    s += T(400, 365, "Grey: the track's normal setting. Red: a step with its own value, a parameter lock.", "fb");
    s += T(400, 395, "On the Model:Cycles: hold a step and turn a knob. Only that step changes.", "fs");
    return svgFig("0 0 800 420", s, "Parameter locks as micro edits");
  },
  snaresrc() {
    let s = T(400, 36, "A snare is a job, not a sound", "fh");
    s +=
      `<rect x="290" y="150" width="220" height="110" rx="14" style="fill:var(--hold-soft);stroke:var(--hold)"/>` +
      T(400, 195, "The backbeat", "fl") +
      T(400, 225, "beats 2 and 4", "fm");
    const src = [
      ["snare drum", 110, 110],
      ["clap", 110, 300],
      ["piano body, hit by hand", 690, 110],
      ["finger snap", 690, 300],
      ["knock on a table", 400, 345],
    ];
    src.forEach(([n, x, y]) => {
      s += `<rect x="${x - 95}" y="${y - 26}" width="190" height="46" rx="10" class="box"/>` + T(x, y + 3, n, "fm");
      const tx = x < 400 ? 290 : x > 400 ? 510 : 400,
        ty = y < 200 ? 175 : y > 320 ? 260 : 235;
      s += `<line x1="${x < 400 ? x + 95 : x > 400 ? x - 95 : x}" y1="${y > 320 ? y - 26 : y}" x2="${tx}" y2="${ty}" class="ln"/>`;
    });
    s += T(400, 405, "Any short, sharp hit placed on 2 and 4 is heard as the snare.", "fb");
    return svgFig("0 0 800 420", s, "Many sounds can play the snare's role");
  },
};
