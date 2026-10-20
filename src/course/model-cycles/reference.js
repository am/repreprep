/* ---------- Reference: machines ---------- */
export const CYCLES_MACHINES = [
  {
    n: "KICK",
    tag: "kick drums, 808 bass",
    p: "A solid all-round kick, inspired by classics. Elektron's tip: combine a high SHAPE with lots of CONTOUR for a noisy, punchy kick. Long DECAY or GATE turns it into an 808-style bass.",
    m: {
      COLOR: "Soft square-like modulation",
      SHAPE: "Triangle-like modulation and feedback",
      SWEEP: "Pitch sweep depth and time",
      CONTOUR: "Modulation envelope depth",
    },
  },
  {
    n: "SNARE",
    tag: "snares, rims, sidesticks",
    p: "Goes from strange alien sidesticks to a hefty punch. Elektron's tip: a long DECAY with SHAPE halfway and some CONTOUR gives a sidestick.",
    m: {
      COLOR: "Inharmonicity amount",
      SHAPE: "Modulation amount and feedback",
      SWEEP: "Pitch sweep depth and time",
      CONTOUR: "Modulation envelope depth",
    },
  },
  {
    n: "METAL",
    tag: "hats, cymbals, bells",
    p: "A sweet-spot-laden metallic voice for cymbals. Elektron's tip: set a very high PITCH and let the FM go out of bounds for unexpected metallic timbres.",
    m: {
      COLOR: "Tune offset A",
      SHAPE: "Modulation amount and feedback",
      SWEEP: "Tune offset B",
      CONTOUR: "Modulation envelope depth",
    },
  },
  {
    n: "PERC",
    tag: "toms, hand drums, pitched hits",
    p: "Everything from toms to the sound of hitting a signpost. Elektron's tip: a low SHAPE and play with COLOR for inharmonic ringing sounds.",
    m: {
      COLOR: "Inharmonicity amount",
      SHAPE: "Modulation amount",
      SWEEP: "Pitch sweep",
      CONTOUR: "Modulation envelope depth",
    },
  },
  {
    n: "TONE",
    tag: "keys, bells, bass",
    p: "A simple but powerful two-operator FM voice. Elektron's tip: low SHAPE, high SWEEP, no CONTOUR and a slightly detuned COLOR (e.g. 2.002) for a nasty bass.",
    m: {
      COLOR: "Modulator ratio",
      SHAPE: "Modulation amount",
      SWEEP: "Feedback amount",
      CONTOUR: "Modulation envelope depth",
    },
  },
  {
    n: "CHORD",
    tag: "chords, pads, unison",
    p: "A chord and unison cluster using the 4 FM operators as voices, with a sweeping wavetable. Elektron's tip: choose a chord you like and change it radically with COLOR.",
    m: {
      COLOR: "Chord: interval mix and oscillator balance. Unison: detune",
      SHAPE:
        "Unison ×2–×4 or a chord: minor, Major, sus2, sus4, m7, M7, mMaj7, Maj7, 7sus4, dim7, madd9, Madd9, m6, M6, mb5, Mb5, m7b5, M7b5, M#5, m7#5, M7#5, mb6, m9no5, M9no5, Madd9b5, Maj7b5, M7b9no5, sus4#5b9, sus4add#5, Maddb5, M6add4no5, Maj7/6no5, Maj9no5, Fourths, Fifths",
      SWEEP: "Wavetable sweep",
      CONTOUR: "Filter cutoff envelope depth",
    },
  },
];
export const CYCLES_SHORTCUTS = [
  ["Select bank / pattern", "[PATTERN] + [T1–T6] / [PATTERN] + [TRIG 1–16]"],
  ["Select track silently", "[TRACK] + [T1–T6]"],
  ["Mute / unmute track", "[FUNC] + [T1–T6]"],
  ["Tap tempo", "[FUNC] + [TEMPO] (tap)"],
  ["Preset browser", "[FUNC] + [MACHINES]"],
  ["Grid recording", "[RECORD]"],
  ["Live recording", "Hold [RECORD] + [PLAY]"],
  ["Toggle live quantize", "Hold [RECORD] + [PLAY] twice"],
  ["Lock trig (no note)", "[FUNC] + [TRIG]"],
  ["Parameter lock", "Hold [TRIG] + turn a knob (grid recording)"],
  ["Note, velocity, length of a step", "Hold [TRIG] + turn [LEVEL/DATA]; press [LEVEL/DATA] to cycle"],
  ["Nudge a step", "Hold [TRIG] + turn [SWING]"],
  ["Trig condition", "Hold [TRIG] + turn [CHANCE]"],
  ["Accent / gate on a step", "Hold [TRIG] + [PUNCH] / [GATE]"],
  ["Roll on a step", "Hold [TRIG] + [RETRIG]"],
  ["Shift all trigs", "[TRACK] + turn [LEVEL/DATA] (grid recording)"],
  ["Change all tracks at once", "Hold [TRACK] + turn a knob"],
  ["Undo knob change", "[BACK] within a few seconds"],
  ["Fill mode (momentary / latched)", "Hold [PAGE] / [TRACK] + [PAGE]"],
  ["Scale menu (length, speed)", "[FUNC] + [PAGE]"],
  ["LFO quick assign", "Hold [LFO] + turn a knob"],
  ["LFO setup", "[FUNC] + [LFO]"],
  ["Track setup (keyboard transpose)", "[FUNC] + [TRACK]"],
  ["Copy / clear / paste pattern data", "[FUNC] + [RECORD] / [PLAY] / [STOP]"],
  [
    "Copy a whole pattern",
    "Hold [PATTERN] + [TRIG] (source), press [RECORD]; hold [PATTERN] + [TRIG] (target), hold [STOP] until the countdown ends",
  ],
  ["Temporary save / reload", "[FUNC] + [SETTINGS] / [FUNC] + [PATTERN]"],
  ["Save pattern to project", "[FUNC] + long-press [SETTINGS]"],
  ["Quantize menu / click menu", "[FUNC] + [PUNCH] / [FUNC] + [GATE]"],
  ["Reverb tone / delay feedback", "[FUNC] + turn [REVERB SIZE] / [DELAY TIME]"],
  ["Track pan", "[FUNC] + turn [LEVEL/DATA]"],
  ["Chain patterns", "Hold [PATTERN], hold first [TRIG], press others in order"],
];

/* the Saving tab: when your work is kept, from the manual (3, 9.12.7, 9.13, 12.1, 12.2, 6.8); [eyebrow, title, text] */
export const CYCLES_SAVING = [
  [
    "Automatic",
    "Every change",
    "Each knob turn and trig is kept in the machine straight away. It survives switching off only if you hold [MAIN VOLUME] to do it. Pull the plug and you get the last saved version back.",
  ],
  [
    "Temporary",
    "Snapshot",
    "Tap [FUNC] + [SETTINGS] before trying something wild, and tap [FUNC] + [PATTERN] to go back to it. The snapshot is gone when you load another project.",
  ],
  [
    "Permanent",
    "Save",
    "Hold [FUNC] + [SETTINGS] for a second to save the pattern, and hold [FUNC] + [PATTERN] to go back to the saved version. The first time, save the project itself: [SETTINGS], then PROJECT, then SAVE.",
  ],
  [
    "On your computer",
    "Backup",
    "Elektron's free Transfer app copies your projects and sounds to a computer over USB.",
  ],
  [
    "Not saved",
    "Chains",
    "A chain of patterns is lost when you switch off or pick another pattern. There is no song mode, so write the order down or record it into Live.",
  ],
];
