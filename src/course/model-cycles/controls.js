import { esc } from "../shared/html.js";

/* ---------- Model:Cycles controls ----------
   Names and second labels exactly as printed on the panel (Elektron's top-down photo, OS 1.13 manual).
   Keys printed with an icon only carry `icon`; `name` is the manual's name for them. */
export const CYCLES_CONTROLS = {
  level: {
    name: "LEVEL/DATA",
    sub: "PAN",
    kind: "Encoder (blue, top left; also a push button)",
    desc: "Sets the active track's volume. Inside any menu it scrolls and changes values, and pressing it confirms. With [FUNC] held it sets the track's pan.",
  },
  screen: {
    name: "Screen",
    kind: "Display",
    desc: "Shows the pattern (e.g. A01), the active track (TR1), the preset name, and level and pan. When you turn a knob it shows the parameter and its value.",
  },
  machines: {
    name: "MACHINES",
    icon: "drum",
    sub: "PRESET MENU",
    kind: "Key (drum icon, right of the screen)",
    desc: "Opens the MACHINES menu, where LEVEL/DATA picks KICK, SNARE, METAL, PERC, TONE or CHORD for the active track. [FUNC] + [MACHINES] opens the PRESET MENU.",
  },
  punch: {
    name: "PUNCH",
    icon: "glove",
    sub: "QUANTIZE",
    kind: "Key (boxing-glove icon)",
    desc: "Toggles a fixed pseudo-compression and distortion on the active track. Hold a trig in grid recording and press it to punch just that step (an accent). [FUNC] + [PUNCH] opens QUANTIZE.",
  },
  gate: {
    name: "GATE",
    icon: "gate",
    sub: "CLICK",
    kind: "Key (gate icon)",
    desc: "Gate mode: when lit, a note holds at full level for its LEN before decaying, like holding a synth key. When off, notes go straight to decay. [FUNC] + [GATE] opens the CLICK (metronome) menu.",
  },
  lfo: {
    name: "LFO",
    icon: "sine",
    sub: "LFO SETUP",
    kind: "Key (wave icon)",
    desc: "Opens the LFO menu (WAV, MUL, DST, DEP). Shortcut: hold [LFO] and turn any track knob to make it the destination and set the depth. [FUNC] + [LFO] opens LFO SETUP.",
  },
  back: {
    name: "BACK",
    icon: "back",
    sub: "PAD MENU",
    kind: "Key (return-arrow icon)",
    desc: "Leaves a menu. Also reverts a knob change made in the last three seconds or so. [FUNC] + [BACK] opens the PAD MENU (velocity curve, fixed velocity).",
  },
  settings: {
    name: "SETTINGS",
    icon: "wrench",
    sub: "TEMP SAVE",
    kind: "Key (wrench icon)",
    desc: "Opens the config menu (projects, patterns, MIDI, system). [FUNC] + [SETTINGS] makes a temporary save of the pattern; hold the combination longer to save it to the project.",
  },
  tempo: {
    name: "TEMPO",
    icon: "metronome",
    sub: "TAP BPM",
    kind: "Key (metronome icon)",
    desc: "Opens the TEMPO menu: turn LEVEL/DATA to set the BPM. Hold [FUNC] and tap [TEMPO] in time to tap a tempo.",
  },
  record: {
    name: "RECORD",
    icon: "rec",
    sub: "COPY",
    kind: "Key (circle icon)",
    desc: "Toggles GRID RECORDING (lit red). Hold it and press [PLAY] for LIVE RECORDING. [FUNC] + [RECORD] = copy.",
  },
  play: {
    name: "PLAY",
    icon: "play",
    sub: "CLEAR",
    kind: "Key (triangle icon)",
    desc: "Starts the pattern (press again to pause). [FUNC] + [PLAY] = clear.",
  },
  stop: {
    name: "STOP",
    icon: "stop",
    sub: "PASTE",
    kind: "Key (square icon)",
    desc: "Stops playback; delay and reverb tails ring out. Press twice for a quick fade. [FUNC] + [STOP] = paste.",
  },
  func: {
    name: "FUNC",
    kind: "Modifier key",
    desc: "Hold it to reach the underlined second function printed under a key or knob.",
  },
  retrig: {
    name: "RETRIG",
    sub: "RETRIG MENU",
    kind: "Key",
    desc: "Hold and tap a pad for a drum roll. In grid recording, hold a trig + [RETRIG] to put a roll on that step. [FUNC] + [RETRIG] opens the RETRIG MENU (rate, length, always on).",
  },
  pattern: {
    name: "PATTERN",
    sub: "RELOAD PTN",
    kind: "Key",
    desc: "[PATTERN] + a pad picks bank A–F; [PATTERN] + a trig key picks pattern 1–16. [FUNC] + [PATTERN] reloads your last temporary save.",
  },
  track: {
    name: "TRACK",
    sub: "CTRL ALL / TRK MENU",
    kind: "Key",
    desc: "Hold [TRACK] and tap a pad to select a track silently. Hold [TRACK] and turn a knob to change it on all six tracks (CTRL ALL). [FUNC] + [TRACK] opens the track menu (keyboard transpose, MIDI out).",
  },
  page: {
    name: "PAGE",
    sub: "FILL / SCALE",
    kind: "Key (right of T6)",
    desc: "Switches between 16-step pages on longer patterns (the four LEDs above it, 1:4 to 4:4). Hold it while playing for FILL mode. [FUNC] + [PAGE] opens the SCALE menu (length and speed).",
  },
  pitch: {
    name: "PITCH",
    kind: "Track knob",
    desc: "Tunes the track from -24 to +24 semitones. Hold [FUNC] while turning to jump in whole semitones.",
  },
  decay: {
    name: "DECAY",
    kind: "Track knob",
    desc: "Amp decay: how long the sound rings out (0–127). Short = tight and dry, long = boomy or pad-like.",
  },
  color: {
    name: "COLOR",
    kind: "Machine knob",
    desc: "Changes with the machine. KICK: soft square-like modulation. SNARE and PERC: inharmonicity. METAL: tune offset A. TONE: modulator ratio. CHORD: interval mix and oscillator balance (detune in Unison).",
  },
  shape: {
    name: "SHAPE",
    kind: "Machine knob",
    desc: "KICK: triangle-like modulation and feedback. SNARE and METAL: modulation amount and feedback. PERC and TONE: modulation amount. CHORD: picks the chord type or Unison.",
  },
  sweep: {
    name: "SWEEP",
    kind: "Machine knob",
    desc: "KICK and SNARE: pitch sweep depth and time. METAL: tune offset B. PERC: pitch sweep. TONE: feedback amount. CHORD: wavetable sweep.",
  },
  contour: {
    name: "CONTOUR",
    kind: "Machine knob",
    desc: "Modulation envelope depth on KICK, SNARE, METAL, PERC and TONE. On CHORD: filter cutoff envelope depth.",
  },
  delay: {
    name: "DELAY SEND",
    kind: "Track knob",
    desc: "How much of this track goes into the shared delay (OFF, 1–127). The delay itself is set with the DELAY TIME knob.",
  },
  reverb: {
    name: "REVERB SEND",
    kind: "Track knob",
    desc: "How much of this track goes into the shared reverb (OFF, 1–127). The room is set with the REVERB SIZE knob.",
  },
  lfospd: {
    name: "LFO SPEED",
    kind: "Track knob",
    desc: "LFO speed, -64 to 63. 8, 16 and 32 lock to straight beats; negative values run the wave backwards. Pick the wave and destination with the [LFO] key.",
  },
  vol: {
    name: "VOLUME + DIST",
    kind: "Track knob",
    desc: "Preset level, 0–127. Default is 60; above 60 it gets louder and starts to distort, which is great for warmth.",
  },
  swing: {
    name: "SWING",
    sub: "NUDGE",
    kind: "Track knob",
    desc: "50% (straight) to 80% (very lazy). The grey NUDGE label: in grid recording, hold a trig and turn SWING to nudge that one step early or late.",
  },
  chance: {
    name: "CHANCE",
    sub: "COND",
    kind: "Track knob",
    desc: "Probability that this track's trigs play, 0–100%. The grey COND label: in grid recording, hold a trig and turn CHANCE to give that step a trig condition (50%, FILL, PRE, NEI, 1ST, 1:2…).",
  },
  mainvol: {
    name: "MAIN VOLUME",
    kind: "Global knob (white, top right)",
    desc: "Main and headphone output level. Press and hold it to switch the unit on, or off.",
  },
  revsize: {
    name: "REVERB SIZE",
    sub: "REV TONE",
    kind: "Global FX knob",
    desc: "Size (decay time) of the shared reverb, up to INF. [FUNC] + turn sets REV TONE: positive cuts lows, negative cuts highs.",
  },
  deltime: {
    name: "DELAY TIME",
    sub: "DEL FEEDBACK",
    kind: "Global FX knob",
    desc: "Delay time in 128th notes: 16 = 1/8, 24 = dotted 1/8, 32 = 1/4. [FUNC] + turn sets DEL FEEDBACK (how many repeats; high values swell).",
  },
};
for (let i = 1; i <= 6; i++)
  CYCLES_CONTROLS["t" + i] = {
    name: "T" + i,
    sub: `BANK ${"ABCDEF"[i - 1]} / MUTE`,
    kind: "Track pad",
    desc: `Plays track ${i} and makes it active (velocity sensitive). [FUNC] + [T${i}] mutes or unmutes it. With [PATTERN] held it picks bank ${"ABCDEF"[i - 1]}.`,
  };
for (let i = 1; i <= 16; i++)
  CYCLES_CONTROLS["s" + i] = {
    name: "TRIG " + i,
    kind: "Trig key",
    desc: `Step ${i} of the sequencer in grid recording. Outside recording it plays a note ([TRIG 9] is the root). With [PATTERN] held it picks pattern ${i}.`,
  };

/* icon paths, drawn in a 20x20 box centred on 0,0 */
export const ICONS = {
  drum: '<ellipse cx="0" cy="-4" rx="6.5" ry="2.6"/><path d="M-6.5 -4V4.5A6.5 2.6 0 0 0 6.5 4.5V-4M-3 -1.5V6.5M3 -1.5V6.5"/>',
  glove:
    '<path d="M-4 7V-1.5Q-4 -7 1.5 -7Q6 -7 6 -2.5V3Q6 7 2 7Z"/><path d="M-4 0Q-7 -0.5 -6.5 3Q-6 5.5 -4 5.5M-2 -3H4"/>',
  gate: '<path d="M-7 6H-4.5V-5H3.5V6H7"/><path d="M-1.5 -1.5L1 1L-1.5 3.5"/>',
  sine: '<path d="M-7.5 0C-5.5 -7 -3 -7 0 0S5.5 7 7.5 0"/>',
  back: '<path d="M6 6V-1H-5.5"/><path d="M-2.5 -4.5L-6 -1L-2.5 2.5"/>',
  wrench: '<path d="M-4.5 -7V-3A4.5 4.5 0 0 0 4.5 -3V-7"/><path d="M-1.6 1.3V7.5H1.6V1.3"/>',
  metronome: '<path d="M-6 7L-2.5 -7H2.5L6 7Z"/><path d="M0 3.5L5 -5"/>',
  rec: '<circle cx="0" cy="0" r="6"/>',
  play: '<path d="M-4.5 -6.5L6 0L-4.5 6.5Z"/>',
  stop: '<rect x="-5.5" y="-5.5" width="11" height="11" rx="1.5"/>',
};
export const iconSvg = (n, cls = "ico") =>
  `<svg class="${cls}" viewBox="-10 -10 20 20" aria-hidden="true">${ICONS[n]}</svg>`;

/* ---------- panel drawing: traced from Elektron's top-down photo (1128x635 px; the
   viewBox uses that photo's pixel coordinates so every control sits where it really is) ---------- */
export function drawCycles() {
  const C = CYCLES_CONTROLS,
    out = [];
  const g = (id, inner) =>
    `<g class="c" data-id="${id}" tabindex="0" role="button" aria-label="${C[id].name}">${inner}</g>`;
  const sub = (x, y, t, cls = "sub") => `<text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
  const knob = (id, x, y, r, cls, label, s, grey) =>
    g(
      id,
      `<circle class="ring" cx="${x}" cy="${y}" r="${r + 6}"/><circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/><circle class="knobtop" cx="${x - 1}" cy="${y - 1.5}" r="${r - 4}"/>` +
        (label
          ? `<text class="lbl" x="${x}" y="${y + r + 12}" text-anchor="middle">${label}${grey ? `<tspan class="grey"> / ${grey}</tspan>` : ""}</text>`
          : "") +
        (s ? sub(x, y + r + 21, s) : "")
    );
  const trackKnob = (id, x, y, label, grey) =>
    `<rect class="pled" x="${x - 35}" y="${y - 11}" width="6" height="6" rx="1"/>` +
    knob(id, x, y, 18, "knobcap", label, null, grey);
  const iconKey = (id, x, y, icon, s) =>
    g(
      id,
      `<rect class="ring" x="${x - 20}" y="${y - 20}" width="40" height="40" rx="9"/><rect class="keycap" x="${x - 15}" y="${y - 15}" width="30" height="30" rx="6"/><g class="keyico" transform="translate(${x} ${y})">${ICONS[icon]}</g>` +
        sub(x, y + 28, s)
    );
  const wideKey = (id, x, y, label, s) =>
    g(
      id,
      `<rect class="ring" x="${x - 30}" y="${y - 20}" width="60" height="40" rx="9"/><rect class="keycap" x="${x - 24}" y="${y - 15}" width="48" height="30" rx="6"/><text class="keytxt" x="${x}" y="${y + 3.5}" text-anchor="middle">${label}</text>` +
        (s ? sub(x, y + 28, s) : "")
    );

  out.push(`<rect class="pnl-body" x="188" y="68" width="752" height="500" rx="26"/>`);
  out.push(`<rect class="pnl-well" x="204" y="166" width="720" height="388" rx="20"/>`);
  out.push(`<text class="brand-t" x="818" y="125" text-anchor="middle">elektron</text>`);
  // level/data + screen
  out.push(knob("level", 246, 202, 20, "knobblue", "LEVEL / DATA", "PAN"));
  out.push(
    `<g class="c" data-id="screen" tabindex="0" role="button" aria-label="Screen"><rect class="ring" x="286" y="182" width="108" height="66" rx="7"/><rect class="lcd-frame" x="290" y="186" width="100" height="58" rx="4"/><rect class="lcd" x="294" y="190" width="92" height="50" rx="2"/><rect class="lcd-inv" x="297" y="193" width="44" height="44" rx="2"/><text class="lcd-big inv" x="319" y="214" text-anchor="middle" id="oledPat">B01</text><text class="lcd-small inv" x="319" y="227" text-anchor="middle" id="oledTxt">MODEL</text><text class="lcd-big" x="364" y="214" text-anchor="middle" id="oledTrk">TR1</text><text class="lcd-small" x="364" y="229" text-anchor="middle" id="oledTxt2">CYCLES</text></g>`
  );
  out.push(`<text class="model-t" x="333" y="260" text-anchor="middle">Model:Cycles</text>`);
  // column of icon keys right of the screen
  [
    ["machines", 201, "drum"],
    ["punch", 260, "glove"],
    ["gate", 318, "gate"],
    ["lfo", 376, "sine"],
  ].forEach(([id, y, ic]) => out.push(iconKey(id, 440, y, ic, C[id].sub)));
  // 3x2 icon grid
  [
    ["back", 239, 292, "back"],
    ["settings", 306, 292, "wrench"],
    ["tempo", 373, 292, "metronome"],
    ["record", 239, 348, "rec"],
    ["play", 306, 348, "play"],
    ["stop", 373, 348, "stop"],
  ].forEach(([id, x, y, ic]) => out.push(iconKey(id, x, y, ic, C[id].sub)));
  // FUNC / RETRIG / PATTERN / TRACK
  out.push(wideKey("func", 248, 404, "FUNC"));
  out.push(wideKey("retrig", 365, 404, "RETRIG", "RETRIG MENU"));
  out.push(wideKey("pattern", 248, 460, "PATTERN", "RELOAD PTN"));
  out.push(wideKey("track", 365, 460, "TRACK", "CTRL ALL / TRK MENU"));
  // 3 x 4 track parameter knobs, each with its parameter-lock LED
  const cols = [530, 617, 705, 792],
    rows = [202, 289, 376];
  [
    [
      ["pitch", "PITCH"],
      ["decay", "DECAY"],
      ["color", "COLOR"],
      ["shape", "SHAPE"],
    ],
    [
      ["sweep", "SWEEP"],
      ["contour", "CONTOUR"],
      ["delay", "DELAY SEND"],
      ["reverb", "REVERB SEND"],
    ],
    [
      ["lfospd", "LFO SPEED"],
      ["vol", "VOLUME + DIST"],
      ["swing", "SWING", "NUDGE"],
      ["chance", "CHANCE", "COND"],
    ],
  ].forEach((row, ri) => row.forEach(([id, l, grey], ci) => out.push(trackKnob(id, cols[ci], rows[ri], l, grey))));
  // right column
  out.push(`<g class="pwr" transform="translate(849 196)"><path d="M-3.2 -2.6A4.2 4.2 0 1 0 3.2 -2.6M0 -5V-0.5"/></g>`);
  out.push(knob("mainvol", 880, 202, 20, "knobwhite", "MAIN VOLUME"));
  out.push(knob("revsize", 880, 289, 20, "knobrose", "REVERB SIZE", "REV TONE"));
  out.push(knob("deltime", 880, 376, 20, "knobrose", "DELAY TIME", "DEL FEEDBACK"));
  // page LEDs + PAGE key
  ["1:4", "2:4", "3:4", "4:4"].forEach((t, i) =>
    out.push(
      `<rect class="pageled${i === 0 ? " on" : ""}" x="${855 + i * 13.5}" y="421" width="8" height="8" rx="1.5"/><text class="tiny" x="${859 + i * 13.5}" y="438" text-anchor="middle">${t}</text>`
    )
  );
  out.push(wideKey("page", 880, 460, "PAGE", "FILL / SCALE"));
  // T1–T6 pads
  [441, 513, 587, 660, 733, 806].forEach((x, i) => {
    const id = "t" + (i + 1);
    out.push(
      g(
        id,
        `<rect class="ring" x="${x - 30}" y="${422}" width="60" height="60" rx="11"/><rect class="padcap" x="${x - 24}" y="428" width="48" height="48" rx="7"/><text class="padtxt" x="${x}" y="457" text-anchor="middle">T${i + 1}</text>` +
          sub(x, 489, C[id].sub)
      )
    );
  });
  // trig keys 1–16 (1, 5, 9, 13 have underlined numbers on the unit)
  for (let i = 1; i <= 16; i++) {
    const x = 239 + (i - 1) * 43.27;
    out.push(
      g(
        "s" + i,
        `<rect class="ring" x="${x - 19}" y="497" width="38" height="38" rx="8"/><rect class="trig" x="${x - 15}" y="501" width="30" height="30" rx="6"/><text class="trigtxt${(i - 1) % 4 === 0 ? " u" : ""}" x="${x}" y="520" text-anchor="middle">${i}</text>`
      )
    );
  }
  return `<svg viewBox="184 64 760 508" role="img" aria-label="Model:Cycles front panel">${out.join("")}</svg>`;
}
