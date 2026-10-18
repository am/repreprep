import { esc, svgFig, T, hits, COUNT16, ROWC } from "../../shared/html.js";

/* ---- Unit 4: Space, arrangement and finishing ---- */
export const UNIT_FIGS_4 = {
  /* lesson 13 */
  u4depth() {
    let s = T(400, 36, "Near and far: reverb is distance", "fh");
    s += `<circle cx="70" cy="200" r="22" class="box"/>` + T(70, 206, "you", "fm");
    const z = [
      ["Dry", 200, 32, 1, 0, "var(--led)", "send OFF", "kick, bass"],
      ["Room", 420, 24, 0.75, 3, "var(--hold)", "send about 40", "snare, hats"],
      ["Hall", 640, 16, 0.5, 6, "var(--turn)", "send about 90", "chords, throws"],
    ];
    z.forEach(([n, x, r, o, tails, c, send, who]) => {
      for (let i = 1; i <= tails; i++)
        s += `<circle cx="${x}" cy="200" r="${r + i * 9}" style="fill:none;stroke:${c};stroke-width:2;opacity:${(0.5 - i * 0.06).toFixed(2)}"/>`;
      s += `<circle cx="${x}" cy="200" r="${r}" style="fill:${c};opacity:${o}"/>`;
      s += T(x, 108, n, "fl") + T(x, 330, send, "fm") + T(x, 352, who, "fs");
    });
    s +=
      `<line x1="110" y1="295" x2="740" y2="295" class="ln"/><path d="M730 289 L742 295 L730 301" class="ln"/>` +
      T(740, 282, "further away", "fs", "end");
    s += T(400, 398, "Dry sounds feel close. The more reverb a sound gets, the further back it sits.", "fb");
    return svgFig("0 0 800 420", s, "Dry, room and hall drawn as distance from the listener");
  },
  u4send() {
    let s = T(400, 36, "Sends: one shared reverb and delay for all tracks", "fh");
    const strips = [
      ["Kick", 100, "OFF", "OFF", 0, 0],
      ["Bass", 210, "OFF", "OFF", 0, 0],
      ["Snare", 320, "20", "throws", 0.2, 0.5],
      ["Chords", 430, "70", "30", 0.6, 0.3],
    ];
    const knob = (x, y, amt, c) =>
      `<circle cx="${x}" cy="${y}" r="16" class="box"/>` +
      (amt ? `<circle cx="${x}" cy="${y}" r="${4 + amt * 12}" style="fill:${c};opacity:.85"/>` : "");
    strips.forEach(([n, x, rv, dl, ra, da]) => {
      s += `<rect x="${x - 45}" y="60" width="90" height="180" rx="10" class="box"/>` + T(x, 84, n, "fl");
      s += knob(x, 122, ra, "var(--turn)") + T(x, 156, "reverb " + rv, "fs");
      s += knob(x, 186, da, "var(--hold)") + T(x, 220, "delay " + dl, "fs");
      s += `<line x1="${x}" y1="240" x2="${x}" y2="364" class="ln"/><circle cx="${x}" cy="364" r="4" style="fill:var(--faint)"/>`;
      if (ra) {
        s += `<line x1="${x - 25}" y1="240" x2="${x - 25}" y2="272" style="stroke:var(--turn);stroke-width:2"/><circle cx="${x - 25}" cy="272" r="4" style="fill:var(--turn)"/>`;
      }
      if (da) {
        s += `<line x1="${x + 25}" y1="240" x2="${x + 25}" y2="318" style="stroke:var(--hold);stroke-width:2;stroke-dasharray:5 4"/><circle cx="${x + 25}" cy="318" r="4" style="fill:var(--hold)"/>`;
      }
    });
    s += `<line x1="60" y1="272" x2="570" y2="272" style="stroke:var(--turn);stroke-width:2"/>`;
    s += `<line x1="60" y1="318" x2="570" y2="318" style="stroke:var(--hold);stroke-width:2"/>`;
    s += `<line x1="60" y1="364" x2="700" y2="364" class="ln"/>` + T(600, 356, "dry", "fs");
    s +=
      `<rect x="570" y="252" width="110" height="38" rx="8" style="fill:var(--turn-soft);stroke:var(--turn)"/>` +
      T(625, 277, "REVERB", "fm");
    s +=
      `<rect x="570" y="298" width="110" height="38" rx="8" style="fill:var(--hold-soft);stroke:var(--hold)"/>` +
      T(625, 323, "DELAY", "fm");
    s += `<line x1="680" y1="272" x2="700" y2="272" class="ln"/><line x1="680" y1="318" x2="700" y2="318" class="ln"/>`;
    s +=
      `<rect x="700" y="246" width="80" height="134" rx="10" class="box"/>` +
      T(740, 308, "Main", "fm") +
      T(740, 326, "out", "fm");
    s +=
      T(560, 90, "REVERB SIZE and", "fs", "start") +
      T(560, 108, "DELAY TIME shape", "fs", "start") +
      T(560, 126, "the effect for", "fs", "start") +
      T(560, 144, "every track at once.", "fs", "start");
    s += T(400, 410, "Each track sends a copy into the shared effects. The send knob sets how much.", "fb");
    return svgFig("0 0 800 425", s, "Send and return signal flow with a shared reverb and delay");
  },
  u4dub() {
    let s = T(400, 36, "A dub throw: one hit into the echo", "fh");
    s += `<circle cx="90" cy="125" r="24" style="fill:var(--led)"/>` + T(90, 175, "one snare", "fm");
    s +=
      `<line x1="116" y1="125" x2="296" y2="125" class="arr"/><path d="M286 118 L298 125 L286 132" class="arr"/>` +
      T(206, 112, "DELAY SEND", "fs");
    s +=
      `<rect x="300" y="92" width="180" height="66" rx="12" style="fill:var(--hold-soft);stroke:var(--hold)"/>` +
      T(390, 122, "DELAY", "fl") +
      T(390, 144, "DELAY TIME = the gap", "fs");
    s +=
      `<line x1="480" y1="125" x2="600" y2="125" class="arr"/><path d="M590 118 L602 125 L590 132" class="arr"/>` +
      T(660, 130, "to the mix", "fm");
    s += `<path d="M540 125 V192 H250 V125 H296" class="arr"/><path d="M286 118 L298 125 L286 132" class="arr"/><path d="M402 185 L390 192 L402 199" class="arr"/>`;
    s += T(395, 214, "DEL FEEDBACK: how much of the echo goes round again", "fs");
    const train = (y, lab, h) => {
      s += T(200, y - 14, lab, "fm", "end") + `<line x1="215" y1="${y}" x2="745" y2="${y}" class="grid"/>`;
      h.forEach((v, i) => {
        s += `<rect x="${230 + i * 48}" y="${y - v}" width="20" height="${v}" rx="3" style="fill:${i ? "var(--turn)" : "var(--led)"};opacity:${i ? 0.85 : 1}"/>`;
      });
    };
    train(300, "low feedback", [56, 40, 28, 19, 13, 8, 5, 3, 0, 0, 0]);
    train(375, "high feedback", [56, 44, 46, 48, 51, 54, 55, 56, 56, 56, 56]);
    s += T(200, 318, "a few repeats, fading", "fs", "end") + T(200, 393, "repeats swell", "fs", "end");
    s += T(400, 415, "Ride feedback up for a moment, then pull it back before it runs away.", "fb");
    return svgFig("0 0 800 430", s, "A delay with feedback: fading repeats versus swelling repeats");
  },
  /* lesson 14 */
  u4dna() {
    let s = T(400, 36, "Sonic DNA: four questions for any track", "fh");
    const q = [
      [
        "Rhythm",
        40,
        60,
        "var(--led)",
        ["Tempo? Tap it or count it.", "What drives it: kick, hats, bass?", "Straight or swung? Busy or sparse?"],
      ],
      [
        "Texture",
        410,
        60,
        "var(--turn)",
        ["Which sounds? Name them in words.", "Bright or dark, clean or dusty?", "What is close, what is far away?"],
      ],
      [
        "Harmony",
        40,
        222,
        "var(--hold)",
        [
          "Minor or major? How does it feel?",
          "How many chords before it repeats?",
          "Does the bass play roots or a riff?",
        ],
      ],
      [
        "Arrangement",
        410,
        222,
        "var(--done)",
        ["What comes in first, and what last?", "Where are the big changes?", "How does it end?"],
      ],
    ];
    q.forEach(([h, x, y, c, lines]) => {
      s +=
        `<rect x="${x}" y="${y}" width="350" height="150" rx="12" class="box"/><rect x="${x}" y="${y}" width="8" height="150" rx="4" style="fill:${c}"/>` +
        T(x + 26, y + 32, h, "fl", "start");
      lines.forEach((l, i) => {
        s += T(x + 26, y + 64 + i * 28, l, "fm", "start");
      });
    });
    s += T(400, 402, "One sheet per track. Fill it in on the second listen, one or two words per line.", "fb");
    return svgFig("0 0 800 420", s, "A sonic DNA listening sheet with rhythm, texture, harmony and arrangement");
  },
  u4field() {
    let s = T(400, 36, "The mix as a stage", "fh");
    s += `<rect x="140" y="62" width="520" height="276" rx="14" class="box"/>`;
    s += `<line x1="400" y1="70" x2="400" y2="330" class="ln2"/>`;
    s += T(150, 358, "left", "fs", "start") + T(400, 358, "centre", "fs") + T(650, 358, "right", "fs", "end");
    s +=
      T(128, 96, "back", "fs", "end") +
      T(128, 112, "(quieter)", "fs", "end") +
      T(128, 312, "front", "fs", "end") +
      T(128, 328, "(louder)", "fs", "end");
    const p = [
      ["Kick", 400, 296, 26, "var(--led)"],
      ["Bass", 400, 244, 24, "var(--done)"],
      ["Snare", 400, 192, 22, "var(--hold)"],
      ["Chords", 400, 120, 22, "var(--turn)"],
      ["Hats", 250, 150, 18, "var(--turn)"],
      ["Perc", 550, 150, 18, "var(--done)"],
    ];
    p.forEach(([n, x, y, r, c]) => {
      s +=
        `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${c};opacity:.85"/>` +
        (n === "Hats" ? T(x - r - 10, y + 5, n, "fm", "end") : T(x + r + 10, y + 5, n, "fm", "start"));
    });
    s += T(400, 388, "Level moves a part front or back. Pan moves it left or right.", "fb");
    s += T(400, 410, "Low, important parts in the centre; supporting parts in pairs. An example of the idea.", "fs");
    return svgFig("0 0 800 420", s, "Mix drawn as a stage: pan left to right, level front to back");
  },
  /* lesson 15 */
  u4energy() {
    let s = T(400, 36, "An energy curve for your song", "fh");
    const sec = [
      ["Intro", "B05", 1],
      ["A", "B06", 2],
      ["B", "B07", 3],
      ["A", "B06", 2],
      ["B", "B07", 3],
      ["Break", "B08", 1.4],
      ["B", "B07", 3],
      ["Outro", "B09", 1.6],
    ];
    const x0 = 80,
      w = 80,
      base = 300,
      u = 60;
    for (let l = 1; l <= 3; l++)
      s += `<line x1="${x0}" y1="${base - l * u}" x2="${x0 + w * 8}" y2="${base - l * u}" class="grid"/>`;
    sec.forEach(([n, p, e], i) => {
      const x = x0 + i * w;
      s +=
        `<rect x="${x + 4}" y="${base - e * u}" width="${w - 8}" height="${e * u}" rx="6" style="fill:${e >= 3 ? "var(--led-soft)" : e >= 2 ? "var(--hold-soft)" : "var(--turn-soft)"};stroke:var(--line)"/>` +
        T(x + w / 2, base + 24, n, "fm") +
        T(x + w / 2, base + 44, p, "fs");
    });
    let d = "";
    sec.forEach(([, , e], i) => {
      const x = x0 + i * w + w / 2,
        y = base - e * u;
      d += (i ? " L" : "M") + x + " " + y;
    });
    s += `<path d="${d}" style="fill:none;stroke:var(--led);stroke-width:3;stroke-linejoin:round"/>`;
    sec.forEach(([, , e], i) => {
      s += `<circle cx="${x0 + i * w + w / 2}" cy="${base - e * u}" r="5" style="fill:var(--led)"/>`;
    });
    s +=
      `<line x1="${x0}" y1="${base}" x2="${x0 + w * 8}" y2="${base}" class="ln"/>` +
      T(x0 - 10, base - u * 1.5, "energy", "fs", "end");
    s += T(400, 382, "Each step up is about three changes at once.", "fb");
    s += T(400, 406, "Start low, climb, drop for the break, peak again, end lower than the top.", "fs");
    return svgFig("0 0 800 420", s, "Energy curve across intro, A, B, break and outro");
  },
  u4map() {
    let s = T(400, 36, "Section map: five copies of B01, each with things taken away", "fh");
    const cols = [
      ["Intro", "B05"],
      ["A", "B06"],
      ["B", "B07"],
      ["Break", "B08"],
      ["Outro", "B09"],
    ];
    const rows = ["T1 Kick", "T2 Snare", "T3 Hats", "T4 Perc", "T5 Bass", "T6 Chords"];
    // 1 plays, 2 plays with a change, 0 cleared
    const m = [
      [0, 1, 1, 0, 0],
      [0, 1, 1, 1, 1],
      [1, 2, 1, 0, 1],
      [0, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
      [1, 2, 1, 2, 2],
    ];
    const note = { "2,1": "60%", "5,1": "drier", "5,3": "big room", "5,4": "long" };
    const x0 = 200,
      cw = 112,
      y0 = 104,
      rh = 40;
    cols.forEach(([n, p], i) => {
      s += T(x0 + i * cw + cw / 2, 72, n, "fl") + T(x0 + i * cw + cw / 2, 92, p, "fs");
    });
    rows.forEach((r, ri) => {
      const y = y0 + ri * rh;
      s += T(x0 - 14, y + 25, r, "fm", "end");
      m[ri].forEach((v, ci) => {
        const x = x0 + ci * cw;
        s += `<rect x="${x + 8}" y="${y + 6}" width="${cw - 16}" height="${rh - 10}" rx="6" style="fill:${v === 1 ? "var(--done)" : v === 2 ? "var(--hold)" : "var(--surface-2)"};opacity:${v ? 0.8 : 1};stroke:var(--line)"/>`;
        const t = note[ri + "," + ci];
        if (t) s += T(x + cw / 2, y + 26, t, "fs");
      });
    });
    s +=
      `<rect x="200" y="362" width="14" height="14" rx="3" style="fill:var(--done);opacity:.8"/>` +
      T(222, 374, "plays", "fm", "start");
    s +=
      `<rect x="300" y="362" width="14" height="14" rx="3" style="fill:var(--hold);opacity:.8"/>` +
      T(322, 374, "plays, changed", "fm", "start");
    s +=
      `<rect x="460" y="362" width="14" height="14" rx="3" style="fill:var(--surface-2);stroke:var(--line)"/>` +
      T(482, 374, "cleared", "fm", "start");
    s += T(400, 408, "B07 stays the full loop: the peak. Every other section is the same loop with less in it.", "fb");
    return svgFig("0 0 800 420", s, "Which tracks play in each of the five sections");
  },
  /* lesson 16 */
  u4perf() {
    let s = T(400, 36, "A performance plan: the arrangement, played by hand", "fh");
    const sec = ["Intro", "A", "B", "A", "B", "Break", "B", "Outro"],
      x0 = 80,
      w = 80;
    sec.forEach((n, i) => {
      const x = x0 + i * w;
      s +=
        `<rect x="${x + 3}" y="64" width="${w - 6}" height="54" rx="8" style="fill:${n === "B" ? "var(--led-soft)" : n === "A" ? "var(--hold-soft)" : "var(--turn-soft)"};stroke:var(--line)"/>` +
        T(x + w / 2, 96, n, "fl");
    });
    const cue = [
      [158, 230, "cue the next pattern in the last bar", 168, "start"],
      [318, 185, "mute hats, back on the 1", 328, "start"],
      [520, 276, "hold TRACK, turn REVERB SEND: a wash", 510, "end"],
      [566, 322, "FUNC + PATTERN: back to saved", 556, "end"],
      [680, 368, "CHANCE down on hats, then mute", 670, "end"],
    ];
    cue.forEach(([x, y, t, tx, a]) => {
      s +=
        `<line x1="${x}" y1="122" x2="${x}" y2="${y - 5}" class="ln2"/><circle cx="${x}" cy="122" r="5" style="fill:var(--fg)"/>` +
        T(tx, y, t, "fm", a);
    });
    s += T(400, 422, "Each pattern loops until you cue the next. Plan your moves before you press record.", "fb");
    return svgFig("0 0 800 440", s, "A timeline of sections with performance moves marked");
  },
  u4rec() {
    let s = T(400, 36, "Recording setup", "fh");
    s +=
      `<rect x="30" y="120" width="200" height="130" rx="14" class="box"/>` +
      T(130, 170, "Model:Cycles", "fl") +
      T(130, 196, "MAIN OUT L / R", "fs") +
      T(130, 216, "(on the back)", "fs");
    s +=
      `<rect x="310" y="130" width="170" height="110" rx="14" class="box"/>` +
      T(395, 172, "Audio", "fl") +
      T(395, 194, "interface", "fl") +
      T(395, 222, "inputs 1 and 2", "fs");
    s +=
      `<rect x="560" y="110" width="210" height="150" rx="14" class="box"/>` +
      T(665, 150, "Computer", "fl") +
      T(665, 180, "Live: one audio track", "fs") +
      T(665, 200, "input 1/2, armed", "fs") +
      T(665, 228, "press record, then play", "fs");
    s +=
      `<path d="M230 170 H310" style="stroke:var(--led);stroke-width:3"/><path d="M230 200 H310" style="stroke:var(--led);stroke-width:3"/>` +
      T(270, 160, "L", "fs") +
      T(270, 222, "R", "fs");
    s += `<path d="M480 185 H560" style="stroke:var(--turn);stroke-width:3"/>` + T(520, 175, "USB", "fs");
    s +=
      `<path d="M395 240 V300" style="stroke:var(--done);stroke-width:3"/><rect x="335" y="300" width="120" height="40" rx="10" class="box"/>` +
      T(395, 325, "headphones", "fm");
    s += T(270, 108, 'two 1/4" jack cables', "fs");
    s += T(400, 382, "Set the level with MAIN VOLUME: loud parts stay well below the top of Live's meter.", "fb");
    s += T(400, 406, "Connect cables with everything switched off.", "fs");
    return svgFig("0 0 800 420", s, "Model:Cycles main outputs into an audio interface and into Live");
  },
  u4finish() {
    let s = T(400, 36, "The finishing loop", "fh");
    const ah = (x, y, ang) => {
      const a = (ang * Math.PI) / 180,
        p = (d, o) =>
          `${(x - 12 * Math.cos(a) + o * Math.sin(a)).toFixed(1)} ${(y - 12 * Math.sin(a) - o * Math.cos(a)).toFixed(1)}`;
      return `<path d="M${p(0, 6)} L${x} ${y} L${p(0, -6)}" class="arr"/>`;
    };
    const n = [
      ["Record a take", 400, 92, "var(--led)"],
      ["Listen away", 640, 215, "var(--turn)"],
      ["Write 3 fixes", 400, 338, "var(--hold)"],
      ["Fix and save", 160, 215, "var(--done)"],
    ];
    n.forEach(([t, x, y, c]) => {
      s +=
        `<rect x="${x - 100}" y="${y - 26}" width="200" height="52" rx="12" style="fill:var(--surface-2);stroke:${c};stroke-width:2"/>` +
        T(x, y + 6, t, "fl");
    });
    s += `<path d="M500 92 Q640 92 640 186" class="arr"/>` + ah(640, 188, 90);
    s += `<path d="M640 242 Q640 338 502 338" class="arr"/>` + ah(500, 338, 180);
    s += `<path d="M300 338 Q160 338 160 244" class="arr"/>` + ah(160, 242, -90);
    s += `<path d="M160 188 Q160 92 298 92" class="arr"/>` + ah(300, 92, 0);
    s += T(400, 206, "repeat", "fm") + T(400, 228, "3 to 5 times", "fm");
    s += T(660, 272, "walk, phone, car", "fs", "start");
    s += T(400, 402, "Finished beats perfect. Small fixes each round, then let it go.", "fb");
    return svgFig("0 0 800 420", s, "Record, listen away, write fixes, fix and save, repeat");
  },
};
