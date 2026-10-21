/* ---------- Reference: the oscillator types, from the manual's oscillator chapter (FW 5.0, pp.41–57) ---------- */
const osc = (n, tag, p, wave, timbre, shape) => ({ n, tag, p, m: { Wave: wave, Timbre: timbre, Shape: shape } });
export const MF_MACHINES = [
  osc(
    "Basic Waves",
    "classic subtractive",
    "The plain analog-style shapes, and the best place to learn the filter.",
    "Morph: square, then saw, then two saws",
    "Symmetry: pulse width, or the phase of the two saws",
    "Adds a sine sub-oscillator an octave below"
  ),
  osc(
    "SuperWave",
    "big detuned leads and pads",
    "Several copies of one wave, detuned against each other.",
    "Waveform: saw, square, triangle or sine",
    "Detune between the copies",
    "Volume of the detuned copies"
  ),
  osc(
    "Wavetable",
    "moving, morphing tones",
    "Steps through a table of 32 waveforms. Modulate the position for tones that keep changing.",
    "Table: one of 16",
    "Position in the table",
    "Chorus"
  ),
  osc(
    "Harmo",
    "organs, additive tones",
    "Builds the tone from harmonics, like an organ's drawbars.",
    "Content: which harmonics, and how loud",
    "Sculpting: from sine to triangle partials",
    "Chorus"
  ),
  osc(
    "KarplusStr",
    "plucked and bowed strings",
    "A physical model of a string, plucked or bowed.",
    "Bow: how much it's bowed",
    "Position: where and how hard it's struck",
    "Decay: how long it rings"
  ),
  osc(
    "V.Analog",
    "analog-style leads and basses",
    "Two analog-style waves, one variable saw and one variable square.",
    "Variable saw",
    "Detune between the two waves",
    "Variable square, up to hard-sync tones"
  ),
  osc(
    "Waveshaper",
    "folded, growling tones",
    "A wave sent through a wavefolder, for rich and aggressive tones.",
    "The waveshaper's waveform",
    "Wavefolder amount",
    "Asymmetry"
  ),
  osc(
    "Two Op. FM",
    "bells, electric pianos, metal",
    "Two-operator FM: one wave bends the pitch of another.",
    "Ratio between the two operators",
    "Amount: how hard it bends (more is brighter)",
    "Feedback of the second operator"
  ),
  osc(
    "Formant",
    "vocal tones",
    "Tones shaped like the resonances of a voice.",
    "Interval between the two formants",
    "Formant frequency",
    "Formant width and shape"
  ),
  osc(
    "Chords",
    "one-finger chords",
    "Plays a whole chord from each key. Paraphonic mode is off on this type.",
    "Chord type: octave, 5th, sus4, m, m7, m9, m11, 6/9, M9, M7, M",
    "Inversion and transposition",
    "Waveform, from string-machine waves to a table of 16"
  ),
  osc(
    "Speech",
    "talking sounds",
    "Formants, then libraries of spoken colours, numbers, letters and words.",
    "Type: formants, then the word libraries",
    "Formant shift",
    "Word"
  ),
  osc(
    "Modal",
    "bells, mallets, struck objects",
    "A bank of tuned resonators, like a struck bar of wood or metal.",
    "Inharmonicity: the material",
    "Brightness of the strike",
    "Decay: damping"
  ),
  osc(
    "Noise",
    "hi-hats, claps, breath",
    "Unpitched noise, with a pitched wave you can mix in.",
    "From particles to white to metallic noise",
    "Sample-rate reduction, or metallic pitch",
    "Mixes in a sine, triangle or square"
  ),
  osc("Bass", "heavy basses", "A bass voice by Noise Engineering.", "Saturation", "Fold", "Noise"),
  osc(
    "Sawx",
    "buzzy saw leads",
    "A saw voice with phase noise, by Noise Engineering.",
    "Saw modulation",
    "Chorus amount",
    "Noise"
  ),
  osc(
    "Harm",
    "spread, harmonic tones",
    "A harmonic voice by Noise Engineering.",
    "Spread: from unison to an octave",
    "Rectification",
    "Noise and clipping"
  ),
  osc(
    "WaveUser",
    "your own wavetables",
    "Like Wavetable, with tables you load from a computer.",
    "Table: one of 16",
    "Position in the table",
    "Bit depth"
  ),
  osc(
    "Sample",
    "recordings on the keys",
    "Plays a stored recording. Hold [Shift] and turn [Type] to choose the sample.",
    "Start point",
    "Length; left of the middle plays it backwards",
    "Loop, with a crossfade"
  ),
  osc(
    "Scan Grains",
    "stretched recordings",
    "Moves through a sample in tiny grains, so time can slow or freeze.",
    "Scan speed",
    "Grain density",
    "Chaos"
  ),
  osc(
    "Cloud Grains",
    "clouds and textures",
    "Scatters many grains from one part of a sample.",
    "Grain start",
    "Grain density",
    "Chaos"
  ),
  osc(
    "Hit Grains",
    "percussive grains",
    "Short, percussive bursts of grains.",
    "Start",
    "Grain density",
    "Grain shape and size"
  ),
  osc(
    "Vocoder",
    "robot voices",
    "Needs a microphone: the keys play the pitch, your voice shapes the tone.",
    "Carrier wave, from saw to pulse to noise",
    "Analysis frequency range",
    "Band filter width"
  ),
];
export const MF_MACHINES_COMMON = [
  ["Type", "picks the oscillator; the screen names what the other three knobs do"],
  ["Wave, Timbre, Shape", "the oscillator's three controls, different on each type"],
  ["Filter", "the same analog filter after every type: LPF, BPF or HPF"],
  ["Envelopes", "the same envelope and cycling envelope on every type"],
];

/* the Shortcuts tab, from the manual's cheat sheet (pp.144–145) */
export const MF_SHORTCUTS = [
  ["Reset the sound to Init", "Press [Preset] three times quickly"],
  ["Save in place", "Long-press [Save]"],
  ["Cancel saving", "Press [Save] again"],
  ["Match the sound to the knobs", "[Panel]"],
  ["Clear one Matrix point", "Hold [Matrix] for half a second"],
  ["Clear every Matrix point", "[Shift] + long-press [Matrix]"],
  ["Set an Assign column's target", "Hold [Assign 1], [Assign 2] or [Assign 3] + move a knob"],
  ["Chord mode", "Hold [Paraphonic], play a chord, let go"],
  ["Unison", "[Shift] + [Paraphonic]"],
  ["Sequencer on", "[Shift] + [Arp | Seq]"],
  ["Swing", "[Shift] + turn [Rate/Swing]"],
  ["Sync the arp, or the LFO", "Press [Rate/Swing] / press [LFO Rate]"],
  ["Transpose the arp or sequence", "[Shift] + a key"],
  ["Arpeggio into sequence A / B", "[Shift] + [Up | A] / [Shift] + [Order | B]"],
  ["Step record / play", "[Random | ●] / [Pattern | ▶]"],
  ["Tie / rest while step recording", "Hold a key + [Hold] / [Hold] alone"],
  ["Move through the steps", "Turn [Rate/Swing] (Play off)"],
  ["Change the sequence length", "[Shift] + turn [Rate/Swing] (step recording)"],
  ["Copy sequence A to B", "Hold [Up | A] + [Order | B]"],
  ["Clear sequence A / B", "Hold [Up | A] / [Order | B] + [Hold] for a second (Record off)"],
  ["Reload the saved sequence", "[Shift] + [Up | A] or [Order | B], in the sequencer"],
  ["Clear a modulation track", "Hold [Oct | Mod] + [Hold]"],
  ["Cycling envelope curves", "[Shift] + turn [Rise] / [Fall]"],
  ["Choose a sample", "[Shift] + turn [Type], on a Sample or Grains type"],
  ["Other knob speed", "[Shift] + turn [Wave], [Timbre] or [Shape]"],
];

/* the Saving tab: when your work is kept (manual pp.16, 28–30, 75–81, 104–115) */
export const MF_SAVING = [
  [
    "Not until you save",
    "Edits",
    "Turning knobs changes the sound you hear, not the saved preset. Load another preset without saving and your changes are gone. Pressing [Preset] three times starts from Init, still without saving anything.",
  ],
  [
    "Permanent",
    "Save",
    "Long-press [Save] to save over the preset you're on. Or press [Save], turn [Preset] to another slot, press it, choose a category, name it letter by letter and press [Save] again. Slots 129 to 512 are yours; empty ones are named Init.",
  ],
  [
    "Saved with the preset",
    "What a preset holds",
    "Every knob, the Matrix, both sequences with their modulation tracks, the Utility settings under Preset (scale, sequence length, bend range…) and the octave.",
  ],
  [
    "Not saved",
    "Spice, Dice, Hold and arp patterns",
    "Spice and Dice, the Hold state and the arpeggiator's Pattern mode are lost. To keep an arpeggio you like, move it into a sequence with [Shift] + [Up | A], then save.",
  ],
  [
    "On your computer",
    "Backup",
    "Arturia's free MIDI Control Center app backs up all your presets over USB. Sending samples to the MicroFreak replaces its whole sample bank, so back up first.",
  ],
];
