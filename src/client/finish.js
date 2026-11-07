/* Leaving a finished lesson: Next lesson on the done screen fills green while you hold it (a click fills it
   quickly), then ticks, plays a short arpeggio, sweeps the step dots and, after a breath, opens the next
   lesson. Keep holding after the tick and it turns into a little jam: the arpeggio keeps going round
   Am, F, C and G, the step dots run like a sequencer's playhead and the sound opens up the longer you
   hold; letting go lands on a last A and moves on. The sound only ever starts from a press. */
import { navigate } from "astro:transitions/client";

const HOLD = 900; /* ms for a held press to fill the button */
const QUICK = 220; /* ms to fill the rest once you let go, or for a click or a key */
const PAUSE = 1300; /* ms between the tick and the done screen */
const JAM_MAX = 60; /* s: a jam stops by itself after this, in case the release never arrives */
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
function pluck(t, f, v = 0.6, bright = 0.9) {
  const car = AC.createOscillator(),
    mod = AC.createOscillator(),
    mg = AC.createGain(),
    g = AC.createGain();
  car.frequency.value = f;
  mod.frequency.value = f;
  mg.gain.setValueAtTime(f * bright, t);
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
/* ---------- the jam: 16ths at 90 BPM, up and down each chord, two beats a chord ---------- */
const S16 = 60 / 90 / 4;
const CHORDS = [
  [440, 523.25, 659.25, 880], // Am
  [349.23, 440, 523.25, 698.46], // F
  [392, 523.25, 659.25, 783.99], // C
  [392, 493.88, 587.33, 783.99], // G
];
const UPDOWN = [0, 1, 2, 3, 2, 1, 0, 1];
/* plays on from the end of the arpeggio until stop(); onStep(n, delay ms) fires for every 16th, for the visuals */
function jam(onStep) {
  if (!audio()) return { stop: () => {} };
  let n = 0,
    next = AC.currentTime + 4 * S16;
  const t0 = next,
    timer = setInterval(() => {
      /* look a little ahead so the timing holds even if the page is busy */
      while (next < AC.currentTime + 0.12) {
        const held = next - t0,
          ch = CHORDS[Math.floor(n / 8) % 4],
          f = ch[UPDOWN[n % 8]] * (Math.floor(n / 32) % 2 ? 2 : 1);
        /* brighter and a touch louder the longer you hold, with an accent on each beat */
        pluck(next, f, (n % 4 ? 0.4 : 0.6) * Math.min(1, 0.7 + held / 20), Math.min(3, 0.9 + held / 6));
        onStep(n, Math.max(0, (next - AC.currentTime) * 1000));
        n++;
        next += S16;
      }
    }, 25);
  const j = {
    stop() {
      if (!timer) return;
      clearInterval(timer);
      /* land on the root, an octave up */
      pluck(Math.max(next, AC.currentTime + 0.02), 880, 0.7, 1.2);
      j.stop = () => {};
    },
  };
  return j;
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

/* the steps of the celebration: the button turns into a tick, the sound, the dots light up one by one; if the
   button is still held, the jam carries on until it's let go */
function celebrate(btn, onDone, to) {
  btn.classList.remove("fin-filling");
  btn.classList.add("fin-done");
  btn.innerHTML = CHECK + "Done";
  arpeggio();
  onDone();
  const dots = document.querySelector(".dots");
  if (dots && !still()) {
    dots.querySelectorAll("a").forEach((a, i) => a.style.setProperty("--i", i));
    dots.classList.add("fin-sweep");
  }
  document.querySelector(".player")?.classList.add("fin-player");
  document.getElementById("meterTxt")?.classList.add("fin-bump");
  const f = btn._fill;
  if (f.held) {
    f.jam = jam((n, ms) => setTimeout(() => playhead(btn, dots, n), ms));
    f.release = () => {
      f.jam.stop();
      btn.classList.remove("fin-jam");
      dots?.querySelectorAll("a.fin-head").forEach((a) => a.classList.remove("fin-head"));
      setTimeout(() => navigate(to), 450);
    };
    setTimeout(() => {
      if (!f.released) {
        f.released = true;
        f.release();
      }
    }, JAM_MAX * 1000);
  } else setTimeout(() => navigate(to), still() ? 700 : PAUSE);
}
/* one 16th of the jam: the step dots light in turn like a playhead, and the button beats on the quarters */
function playhead(btn, dots, n) {
  if (!btn._fill.jam || btn._fill.released) return;
  btn.classList.add("fin-jam");
  if (n % 4 === 0 && !still()) {
    btn.classList.remove("fin-beat");
    void btn.offsetWidth; /* restart the beat animation */
    btn.classList.add("fin-beat");
  }
  if (!dots) return;
  const all = dots.querySelectorAll("a");
  all.forEach((a, i) => a.classList.toggle("fin-head", i === n % all.length));
}

/* a press on Finish: holding fills it slowly, letting go finishes the fill quickly */
export function pressFinish(btn, onDone, to) {
  if (btn._fill) return;
  fill(btn, HOLD, () => celebrate(btn, onDone, to));
  btn._fill.held = true;
  /* on the document, so letting go off the button counts too */
  const up = () => {
    const f = btn._fill;
    f.held = false;
    if (f.v < 1) fill(btn, QUICK);
    else if (f.release && !f.released) {
      f.released = true;
      f.release();
    }
  };
  document.addEventListener("pointerup", up, { once: true });
  document.addEventListener("pointercancel", up, { once: true });
}
/* a click or a key on Finish: start (or finish) the fill quickly */
export function clickFinish(btn, onDone, to) {
  if (btn._fill) {
    if (btn._fill.v < 1) fill(btn, QUICK);
    return;
  }
  fill(btn, QUICK, () => celebrate(btn, onDone, to));
}
