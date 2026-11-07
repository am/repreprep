/* Reference sounds for drawings: tap a row of a figure to hear what it shows. A figure marks a playable part
   with sndPart(id, ...); the browser plays FIG_SOUNDS[id] (src/client/fig-sounds.js). Each recipe gets
   the audio context, the node to play into and a start time, builds its sound and returns how long it lasts.
   Recipes only use plain Web Audio nodes, so they sound the same in every browser. */

/* a note with a soft start and end, so nothing clicks: the gain node to play through, open from t to t + dur */
function env(ac, out, t, dur, level) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(level, t + 0.02);
  g.gain.setValueAtTime(level, t + dur - 0.25);
  g.gain.linearRampToValueAtTime(0, t + dur);
  g.connect(out);
  return g;
}
function osc(ac, type, f, t, dur) {
  const o = ac.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.start(t);
  o.stop(t + dur + 0.05);
  return o;
}
/* the four waveforms at the same note, louder ones turned down so they sound about as loud as each other */
const wave = (type, level) => (ac, out, t) => {
  const dur = 1.4;
  osc(ac, type, 220, t, dur).connect(env(ac, out, t, dur, level));
  return dur;
};
/* a sawtooth, bright as it is or dark through a low-pass filter around its 4th harmonic, like the drawing */
const saw = (dark) => (ac, out, t) => {
  const dur = 1.8,
    o = osc(ac, "sawtooth", 110, t, dur),
    g = env(ac, out, t, dur, dark ? 0.32 : 0.16);
  if (!dark) o.connect(g);
  else {
    let node = o;
    for (let i = 0; i < 2; i++) {
      const f = ac.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 440;
      f.Q.value = 0.7;
      node = node.connect(f);
    }
    node.connect(g);
  }
  return dur;
};
/* FM: a modulator at twice the carrier's pitch wobbles the carrier; depth (the modulation index) is how much.
   With `to`, the depth turns up from `depth` to `to` while the note plays. */
const fm =
  (depth, to = depth) =>
  (ac, out, t) => {
    const dur = to === depth ? 1.6 : 3.6,
      fc = 220,
      fmod = 440;
    const car = osc(ac, "sine", fc, t, dur),
      mod = osc(ac, "sine", fmod, t, dur),
      amt = ac.createGain();
    amt.gain.setValueAtTime(depth * fmod, t);
    if (to !== depth) amt.gain.linearRampToValueAtTime(to * fmod, t + dur - 0.3);
    mod.connect(amt).connect(car.frequency);
    car.connect(env(ac, out, t, dur, 0.28));
    return dur;
  };

export const FIG_SOUNDS = {
  "wave:sine": wave("sine", 0.34),
  "wave:triangle": wave("triangle", 0.32),
  "wave:square": wave("square", 0.13),
  "wave:sawtooth": wave("sawtooth", 0.16),
  "filter:bright": saw(false),
  "filter:dark": saw(true),
  "fm:none": fm(0),
  "fm:little": fm(1.2),
  "fm:lot": fm(5),
  "fm:sweep": fm(0, 6),
};

/* a playable part of a figure: a highlight box (x, y, w, h) you can tap or focus, a play/stop sign at (px, py),
   then the drawing it plays */
export function sndPart(id, label, [x, y, w, h], [px, py], body) {
  if (!FIG_SOUNDS[id]) throw new Error(`No figure sound "${id}"`);
  return (
    `<g class="snd" data-snd="${id}" role="button" tabindex="0" aria-pressed="false" aria-label="${label}">` +
    `<rect class="snd-hit" x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>` +
    `<g class="snd-btn" transform="translate(${px} ${py})"><circle r="12"/>` +
    `<path class="snd-play" d="M-4 -6.5 L7 0 L-4 6.5 Z"/><rect class="snd-stop" x="-5" y="-5" width="10" height="10" rx="1.5"/></g>` +
    body +
    `</g>`
  );
}
