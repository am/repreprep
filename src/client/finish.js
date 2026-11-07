/* Finishing a lesson: the Finish button on the last step fills green while you hold it (a click fills it
   quickly), then ticks, plays a short arpeggio, sweeps the step dots and, after a breath, opens the done
   screen. Complete under the player plays the same sound. The sound only ever starts from a press. */
import { navigate } from "astro:transitions/client";

const HOLD = 900; /* ms for a held press to fill the button */
const QUICK = 220; /* ms to fill the rest once you let go, or for a click or a key */
const PAUSE = 1300; /* ms between the tick and the done screen */
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const CHECK = `<svg class="fin-ck" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>`;

/* ---------- sound: a quiet riser while you hold, then A minor up the octave with a dub echo, at 90 BPM ---------- */
let AC = null,
  out = null;
function audio() {
  if (!AC) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    AC = new C();
    out = AC.createGain();
    out.gain.value = 0.22;
    /* echo: three sixteenths, each repeat a little darker */
    const dl = AC.createDelay(1),
      fb = AC.createGain(),
      lp = AC.createBiquadFilter(),
      wet = AC.createGain();
    dl.delayTime.value = (60 / 90 / 4) * 3;
    fb.gain.value = 0.38;
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    wet.gain.value = 0.35;
    out.connect(AC.destination);
    out.connect(dl);
    dl.connect(lp).connect(fb).connect(dl);
    lp.connect(wet).connect(AC.destination);
  }
  if (AC.state === "suspended") AC.resume();
  return AC;
}
/* a soft FM pluck */
function pluck(t, f, v = 0.6) {
  const car = AC.createOscillator(),
    mod = AC.createOscillator(),
    mg = AC.createGain(),
    g = AC.createGain();
  car.frequency.value = f;
  mod.frequency.value = f;
  mg.gain.setValueAtTime(f * 0.9, t);
  mg.gain.exponentialRampToValueAtTime(1, t + 0.25);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  mod.connect(mg).connect(car.frequency);
  car.connect(g).connect(out);
  [car, mod].forEach((o) => {
    o.start(t);
    o.stop(t + 0.75);
  });
}
export function arpeggio() {
  if (!audio()) return;
  const t = AC.currentTime + 0.02,
    s16 = 60 / 90 / 4;
  [440, 523.25, 659.25, 880].forEach((f, i) => pluck(t + i * s16, f, i === 3 ? 0.7 : 0.55));
}
/* rises from A3 toward A4 as the button fills; stopped (faded) when the fill ends */
function riser(ms) {
  if (!audio()) return () => {};
  const t = AC.currentTime,
    o = AC.createOscillator(),
    g = AC.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(220, t);
  o.frequency.exponentialRampToValueAtTime(440, t + ms / 1000);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.12, t + 0.08);
  o.connect(g).connect(out);
  o.start(t);
  return () => {
    const n = AC.currentTime;
    g.gain.cancelScheduledValues(n);
    g.gain.setValueAtTime(g.gain.value, n);
    g.gain.exponentialRampToValueAtTime(0.0001, n + 0.08);
    o.stop(n + 0.1);
  };
}

/* ---------- the button ---------- */
/* fills btn from where it is to full over ms, then calls done; a later call speeds it up */
function fill(btn, ms, done) {
  const f = btn._fill || (btn._fill = { v: 0, done, stop: riser(ms) });
  f.from = f.v;
  f.t0 = performance.now();
  f.ms = ms;
  if (f.raf) return;
  btn.classList.add("fin-filling");
  const step = (now) => {
    f.v = Math.min(1, f.from + ((1 - f.from) * (now - f.t0)) / f.ms);
    btn.style.setProperty("--fill", f.v.toFixed(3));
    if (f.v < 1) f.raf = requestAnimationFrame(step);
    else {
      f.stop();
      f.done();
    }
  };
  f.raf = requestAnimationFrame(step);
}

/* the steps of the celebration: the button turns into a tick, the sound, the dots light up one by one */
function celebrate(btn, onDone, to) {
  btn.classList.remove("fin-filling");
  btn.classList.add("fin-done");
  btn.innerHTML = CHECK + "Done";
  btn.setAttribute("aria-label", "Lesson done");
  arpeggio();
  onDone();
  const dots = document.querySelector(".dots");
  if (dots && !still()) {
    dots.querySelectorAll("a").forEach((a, i) => a.style.setProperty("--i", i));
    dots.classList.add("fin-sweep");
  }
  document.querySelector(".player")?.classList.add("fin-player");
  document.getElementById("meterTxt")?.classList.add("fin-bump");
  setTimeout(() => navigate(to), still() ? 700 : PAUSE);
}

/* a press on Finish: holding fills it slowly, letting go finishes the fill quickly */
export function pressFinish(btn, onDone, to) {
  if (btn._fill) return;
  fill(btn, HOLD, () => celebrate(btn, onDone, to));
  const up = () => {
    if (btn._fill && btn._fill.v < 1) fill(btn, QUICK);
  };
  btn.addEventListener("pointerup", up, { once: true });
  btn.addEventListener("pointercancel", up, { once: true });
}
/* a click or a key on Finish: start (or finish) the fill quickly */
export function clickFinish(btn, onDone, to) {
  if (btn._fill) {
    if (btn._fill.v < 1) fill(btn, QUICK);
    return;
  }
  fill(btn, QUICK, () => celebrate(btn, onDone, to));
}
