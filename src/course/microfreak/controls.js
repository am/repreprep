/* ---------- MicroFreak controls ----------
   Labels exactly as printed on the panel (Arturia's top-down image, manual v5.0). `name` is how the lessons
   write a control in square brackets, so it must be unique: where two controls share a printed label (the
   oscillator's and the filter's Type, the two Rate encoders) the name says which, and `label` is the print.
   `aka` lists other names a lesson may use for the same control, such as a touch icon's second function. */
export const MF_CONTROLS = {
  matrix: {
    name: "Matrix",
    kind: "Encoder (white, top left; also a push button)",
    desc: "Picks a point of the modulation Matrix: turn it to move the blinking light to a source row and destination column. Press it to set that point's amount (-100 to +100), press again to leave. Hold it for half a second to clear the point. [Shift] + a long press clears every point.",
  },
  assign1: {
    name: "Assign 1",
    kind: "Key (above the first assignable Matrix column)",
    desc: "Chooses what the Assign 1 column modulates: hold it and move a knob. Holding it and turning the [Matrix] encoder to another point makes that point's amount the target, so one modulation can change another.",
  },
  assign2: {
    name: "Assign 2",
    kind: "Key (above the second assignable Matrix column)",
    desc: "Chooses what the Assign 2 column modulates: hold it and move a knob, or hold it and turn the [Matrix] encoder to another point.",
  },
  assign3: {
    name: "Assign 3",
    kind: "Key (above the third assignable Matrix column)",
    desc: "Chooses what the Assign 3 column modulates: hold it and move a knob, or hold it and turn the [Matrix] encoder to another point.",
  },
  paraphonic: {
    name: "Paraphonic",
    kind: "Key",
    desc: "Switches between one voice and four voices that share the analog filter. Hold it and play a chord, then let go, for Chord mode: every key then plays that chord shape. [Shift] + [Paraphonic] switches on Unison.",
  },
  panel: {
    name: "Panel",
    kind: "Key",
    desc: "Makes the sound match where every knob physically is. Until then, a knob only takes over once you move it.",
  },
  screen: {
    name: "Screen",
    kind: "Display",
    desc: "Shows the preset's number and name, and the name and value of whatever you touch.",
  },
  preset: {
    name: "Preset",
    kind: "Encoder (also a push button)",
    desc: "Turn it to load another preset: unsaved changes are lost, unless Click to Load is on in [Utility]. Press it three times quickly to start from an empty sound, called Init. In menus it scrolls and confirms.",
  },
  save: {
    name: "Save",
    kind: "Key",
    desc: "Saves the sound. Press it, turn the [Preset] encoder to pick a slot, click, pick a category, then name it letter by letter and press [Save] again. A long press saves over the current slot at once.",
  },
  utility: {
    name: "Utility",
    kind: "Key",
    desc: "Opens the settings: the preset's own (scale, glide mode, sequence length, pressure or velocity) and the global ones (MIDI, sync, knob behaviour). Turn and press the [Preset] encoder to move around.",
  },
  master: {
    name: "Master",
    kind: "Knob (volume)",
    desc: "Volume of the line and headphone outputs.",
  },
  glide: {
    name: "Glide",
    kind: "Knob",
    desc: "How long the pitch slides from one note to the next, from off to about 10 seconds. The glide mode (time, synced or rate) is in [Utility].",
  },
  type: {
    name: "Type",
    aka: ["Osc Type"],
    kind: "Knob (digital oscillator)",
    desc: "Picks the oscillator: Basic Waves, SuperWave, Wavetable, Harmo, KarplusStr, V.Analog, Waveshaper, Two Op. FM, Formant, Chords, Speech, Modal, Noise, the Noise Engineering Bass, SawX and Harm, WaveUser, and the sample and grain types. The screen shows its name.",
  },
  wave: {
    name: "Wave",
    kind: "Knob (digital oscillator)",
    desc: "The oscillator's first control. What it does depends on the Type, and the screen shows its name: on Basic Waves it morphs from square to saw to two saws.",
  },
  timbre: {
    name: "Timbre",
    kind: "Knob (digital oscillator)",
    desc: "The oscillator's second control, named on the screen. On Basic Waves it changes the pulse width of the square.",
  },
  shape: {
    name: "Shape",
    aka: ["Osc Shape"],
    kind: "Knob (digital oscillator)",
    desc: "The oscillator's third control, named on the screen. On Basic Waves it adds a sine one octave below.",
  },
  filtertype: {
    name: "Filter Type",
    label: "Type",
    kind: "Key (analog filter)",
    desc: "Steps through the filter types, each with its light: LPF (low pass, darkens), BPF (band pass, keeps a band in the middle) and HPF (high pass, thins out the lows).",
  },
  cutoff: {
    name: "Cutoff",
    kind: "Knob (analog filter)",
    desc: "Where the filter starts to cut, from about 30 Hz to above 15 kHz. On LPF, lower means darker.",
  },
  resonance: {
    name: "Resonance",
    kind: "Knob (analog filter)",
    desc: "Boosts the harmonics right at the cutoff, for a sharper, vocal edge. Near the top the filter starts to ring by itself.",
  },
  cycmode: {
    name: "Mode",
    aka: ["Cyc Mode"],
    kind: "Key (cycling envelope)",
    desc: "Steps through the cycling envelope's modes: Env (runs once per note), Run (loops freely, like an LFO) and Loop (loops, restarting with every note).",
  },
  rise: {
    name: "Rise",
    sub: "Shape",
    kind: "Knob (cycling envelope)",
    desc: "How long the cycling envelope takes to rise. With [Shift] held it sets the curve of the rise, from logarithmic to exponential.",
  },
  fall: {
    name: "Fall",
    sub: "Shape",
    kind: "Knob (cycling envelope)",
    desc: "How long the cycling envelope takes to fall. With [Shift] held it sets the curve of the fall.",
  },
  cychold: {
    name: "Hold/Sustain",
    label: "Hold",
    kind: "Knob (cycling envelope)",
    desc: "In Run and Loop: how long the cycling envelope stays at the top. In Env: the level it holds while you hold a key.",
  },
  amount: {
    name: "Amount",
    kind: "Knob (cycling envelope)",
    desc: "How much of the cycling envelope reaches the Matrix. It only moves the sound once a point in the CycEnv row is set.",
  },
  octdown: {
    name: "Octave Down",
    kind: "Key (octave)",
    desc: "Shifts the keyboard down an octave, down to three octaves. The light blinks faster the further you go.",
  },
  octup: {
    name: "Octave Up",
    kind: "Key (octave)",
    desc: "Shifts the keyboard up an octave, up to three octaves.",
  },
  shift: {
    name: "Shift",
    kind: "Modifier key",
    desc: "Hold it to reach the second function printed in blue.",
  },
  arpseq: {
    name: "Arp | Seq",
    kind: "Key",
    desc: "Switches the arpeggiator on or off. [Shift] + [Arp | Seq] switches to the sequencer instead, and back.",
  },
  octmod: {
    name: "Oct | Mod",
    kind: "Key (with lights 1–4)",
    desc: "On the arpeggiator: its range, one to four octaves. On the sequencer: picks one of the four modulation tracks.",
  },
  rate: {
    name: "Rate/Swing",
    label: "Rate",
    sub: "Swing",
    aka: ["Arp Rate"],
    kind: "Encoder (arp and sequencer; also a push button)",
    desc: "The arpeggiator's and sequencer's speed in BPM. Press it to sync to note values (1/8, 1/16, triplets…). With [Shift] held it sets the swing, 50–75%. While recording steps it moves through them.",
  },
  lfoshape: {
    name: "LFO Shape",
    label: "Shape",
    kind: "Key (LFO, with six lights)",
    desc: "Steps through the LFO's waves: sine, triangle, rising saw, square, stepped random and smooth random.",
  },
  lforate: {
    name: "LFO Rate",
    label: "Rate",
    kind: "Encoder (LFO; also a push button)",
    desc: "The LFO's speed, from very slow to audio rate. Press it to sync it to note values.",
  },
  ampmod: {
    name: "Amp Mod",
    kind: "Key (envelope)",
    desc: "When lit, the envelope shapes the volume as well as the filter. When off, the volume simply opens while a key is held and closes when you let go, like an organ.",
  },
  attack: {
    name: "Attack",
    kind: "Knob (envelope)",
    desc: "How long the envelope takes to rise when you press a key, up to 10 seconds.",
  },
  decay: {
    name: "Decay/Rel",
    label: "Decay",
    aka: ["Decay"],
    kind: "Knob (envelope)",
    desc: "How long the envelope takes to fall to the sustain level, and also how long it fades after you let go (release).",
  },
  sustain: {
    name: "Sustain",
    kind: "Knob (envelope)",
    desc: "The level the envelope holds while you hold a key.",
  },
  filteramt: {
    name: "Filter Amt",
    kind: "Knob (envelope)",
    desc: "How far the envelope moves the filter's cutoff. The middle is none. Right opens the filter as the note starts; left closes it, which can silence a dark sound.",
  },
  hold: {
    name: "Hold",
    aka: ["Tie/Rest"],
    kind: "Touch icon",
    desc: "Keeps the notes you played sounding after you let go, so you can play over an arpeggio. In the sequencer it enters a rest, or a tie when you hold a key.",
  },
  up: {
    name: "Up | A",
    aka: ["Up", "A"],
    kind: "Touch icon",
    desc: "Arpeggiator: plays the held notes from low to high. Sequencer: picks sequence A.",
  },
  order: {
    name: "Order | B",
    aka: ["Order", "B"],
    kind: "Touch icon",
    desc: "Arpeggiator: plays the notes in the order you pressed them. Sequencer: picks sequence B.",
  },
  random: {
    name: "Random | ●",
    aka: ["Random", "●", "Record"],
    kind: "Touch icon",
    desc: "Arpeggiator: plays the held notes in random order. Sequencer: record.",
  },
  pattern: {
    name: "Pattern | ▶",
    aka: ["Pattern", "▶", "Play"],
    kind: "Touch icon",
    desc: "Arpeggiator: makes up a pattern from the held notes, a new one each time you change them. Sequencer: play and stop.",
  },
  spice: {
    name: "Spice",
    kind: "Touch icon",
    desc: "Turns the touch strip into the Spice control: slide right for more of the variation that Dice rolled.",
  },
  dice: {
    name: "Dice",
    kind: "Touch icon",
    desc: "Turns the touch strip into Dice: each touch rolls a new random variation of the arpeggio or sequence's timing, left small and right big.",
  },
  bend: {
    name: "Bend",
    kind: "Touch icon",
    desc: "Turns the touch strip into a pitch bend: the middle is no bend.",
  },
  strip: {
    name: "Touch strip",
    kind: "Touch strip",
    desc: "Bends pitch, or sets Spice or Dice, depending on which icon is lit.",
  },
};

/* the Matrix: 5 sources (rows) by 7 destinations (columns), each point a light */
export const MX_ROWS = [
  ["cycenv", "CycEnv"],
  ["env", "Env"],
  ["lfo", "LFO"],
  ["press", "Press"],
  ["key", "Key/Arp"],
];
export const MX_COLS = [
  ["pitch", "Pitch"],
  ["wave", "Wave"],
  ["timbre", "Timbre"],
  ["cutoff", "Cutoff"],
  ["a1", "Assign 1"],
  ["a2", "Assign 2"],
  ["a3", "Assign 3"],
];
MX_ROWS.forEach(([r, rn]) =>
  MX_COLS.forEach(([c, cn]) => {
    MF_CONTROLS[`mx-${r}-${c}`] = {
      name: `${rn} to ${cn}`,
      kind: "Matrix point",
      desc: `Sends ${rn} to ${cn}. Turn the [Matrix] encoder until this light blinks, press it, turn to set the amount (negative turns it upside down) and press again.`,
    };
  })
);

/* the 25 touch keys, C to C */
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
for (let i = 1; i <= 25; i++) {
  const n = NOTE_NAMES[(i - 1) % 12];
  MF_CONTROLS["k" + i] = {
    name: "Key " + i,
    kind: n.length > 1 ? "Touch key (raised)" : "Touch key",
    desc: `Plays ${n}${i > 12 ? (i > 24 ? ", two octaves above the lowest C" : ", an octave higher") : ""}. Pressure grows with how much of your finger touches the key, not how hard you press.`,
  };
}
