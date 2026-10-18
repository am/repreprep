/* playable step grid with a tiny drum synth (Web Audio) */
import { renderGrid, gridPreset } from "../course/shared/grid.js";

let AC = null,
  master = null,
  noiseBuf = null;
function audio() {
  if (!AC) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    AC = new C();
    master = AC.createGain();
    master.gain.value = 0.8;
    master.connect(AC.destination);
    noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (AC.state === "suspended") AC.resume();
  return AC;
}
function noise(t, dur, type, freq, vel, q = 1) {
  const n = AC.createBufferSource();
  n.buffer = noiseBuf;
  const f = AC.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = AC.createGain();
  g.gain.setValueAtTime(vel, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  n.connect(f).connect(g).connect(master);
  n.start(t);
  n.stop(t + dur + 0.02);
}
function tone(t, f0, f1, dur, vel, type = "sine") {
  const o = AC.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
  const g = AC.createGain();
  g.gain.setValueAtTime(vel, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function mtof(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}
const VOICES = {
  kick: (t, v) => tone(t, 120, 42, 0.45, v),
  snare: (t, v) => {
    noise(t, 0.22, "bandpass", 1800, v * 0.7, 0.8);
    tone(t, 220, 160, 0.12, v * 0.5, "triangle");
  },
  clap: (t, v) => {
    [0, 0.012, 0.024].forEach((d) => noise(t + d, 0.14, "bandpass", 1300, v * 0.6, 1.2));
  },
  rim: (t, v) => {
    tone(t, 1700, 1600, 0.04, v * 0.5, "square");
    noise(t, 0.03, "bandpass", 3000, v * 0.4, 3);
  },
  hat: (t, v) => noise(t, 0.05, "highpass", 8000, v * 0.45),
  ohat: (t, v) => noise(t, 0.32, "highpass", 7000, v * 0.35),
  perc: (t, v) => tone(t, 640, 600, 0.18, v * 0.55),
  shaker: (t, v) => noise(t, 0.08, "bandpass", 6000, v * 0.4, 1.5),
  /* pitched voices: n is a MIDI note (60 = middle C) from the row's p[] array or its note */
  keys: (t, v, n = 60) => {
    const f = mtof(n);
    tone(t, f, f, 1.4, v * 0.32, "triangle");
    tone(t, f * 2, f * 2, 0.6, v * 0.1);
  },
  pluck: (t, v, n = 60) => {
    const f = mtof(n);
    tone(t, f, f, 0.26, v * 0.22, "sawtooth");
    tone(t, f, f, 0.3, v * 0.25, "triangle");
  },
  bass: (t, v, n = 36) => {
    const f = mtof(n);
    tone(t, f, f, 0.55, v * 0.55, "triangle");
    tone(t, f, f, 0.4, v * 0.3);
  },
};

/* grid state lives here while you browse, so edits survive moving between steps */
const GRIDS = {};
let gridRun = null;
export function gridStop() {
  if (gridRun) {
    clearInterval(gridRun.timer);
    cancelAnimationFrame(gridRun.raf);
    gridRun = null;
  }
  document.querySelectorAll(".gp [data-gplay]").forEach((b) => (b.textContent = "Play"));
  document.querySelectorAll(".gp .cell.now").forEach((c) => c.classList.remove("now"));
}
const gridState = (id) => gridPreset(GRIDS[id]);
/* on each page: pick up the grids' specs, and redraw any grid you already edited */
export function mountGrids() {
  document.querySelectorAll(".gridhost[data-grid]").forEach((host) => {
    const id = host.dataset.grid;
    if (GRIDS[id]) {
      host.innerHTML = renderGrid(GRIDS[id], id, false);
      return;
    }
    try {
      GRIDS[id] = JSON.parse(host.dataset.spec);
      GRIDS[id].cur ??= 0;
    } catch (e) {}
  });
}
function gridPlay(id) {
  if (gridRun && gridRun.id === id) {
    gridStop();
    return;
  }
  gridStop();
  if (!audio()) return;
  const run = { id, step: 0, next: AC.currentTime + 0.06, queue: [] };
  gridRun = run;
  const tick = () => {
    const P = gridState(id);
    const sx = 60 / P.bpm / 4;
    while (run.next < AC.currentTime + 0.12) {
      const k = run.step;
      const pair = sx * 2;
      const sw = ((P.swing || 50) - 50) / 50;
      P.rows.forEach((r) => {
        const len = r.len || 16;
        const i = k % len;
        const v = r.v[i];
        if (!v) return;
        let t = run.next + (i % 2 ? (sw * pair) / 2 : 0) + ((r.off && r.off[i]) || 0) * sx;
        (VOICES[r.s] || VOICES.perc)(Math.max(t, AC.currentTime), v, (r.p && r.p[i]) || r.note);
      });
      run.queue.push([run.next, k]);
      run.step++;
      run.next += sx;
    }
  };
  run.timer = setInterval(tick, 25);
  tick();
  const draw = () => {
    while (run.queue.length && run.queue[0][0] <= AC.currentTime) {
      const [, k] = run.queue.shift();
      const root = document.querySelector(`.gp[data-gid="${CSS.escape(id)}"]`);
      if (root) {
        const P = gridState(id);
        root.querySelectorAll(".cell.now").forEach((c) => c.classList.remove("now"));
        P.rows.forEach((r, ri) => {
          const i = k % (r.len || 16);
          root.querySelector(`.cell[data-r="${ri}"][data-i="${i}"]`)?.classList.add("now");
        });
      }
    }
    run.raf = requestAnimationFrame(draw);
  };
  run.raf = requestAnimationFrame(draw);
  document.querySelectorAll(`[data-gplay="${CSS.escape(id)}"]`).forEach((b) => (b.textContent = "Stop"));
}
document.addEventListener("click", (e) => {
  const p = e.target.closest("[data-gplay]");
  if (p) {
    gridPlay(p.dataset.gplay);
    return;
  }
  const pr = e.target.closest("[data-gpre]");
  if (pr) {
    const id = pr.dataset.g;
    const G = GRIDS[id];
    G.cur = +pr.dataset.gpre;
    const host = pr.closest(".gridhost");
    if (host) host.innerHTML = renderGrid(G, id, !!(gridRun && gridRun.id === id));
    return;
  }
  const c = e.target.closest(".gp .cell");
  if (c && !c.disabled) {
    const G = GRIDS[c.dataset.g];
    if (!G || G.edit === false) return;
    const P = gridState(c.dataset.g);
    const r = P.rows[+c.dataset.r];
    const i = +c.dataset.i;
    r.v[i] = r.v[i] ? 0 : 0.85;
    c.classList.toggle("on", !!r.v[i]);
    c.style.setProperty("--v", r.v[i]);
    if (r.v[i] && audio()) (VOICES[r.s] || VOICES.perc)(AC.currentTime, r.v[i]);
  }
});
document.addEventListener("input", (e) => {
  const id = e.target.dataset && e.target.dataset.gswing;
  if (!id || !GRIDS[id]) return;
  const P = gridState(id);
  P.swing = +e.target.value;
  e.target.nextElementSibling.textContent = P.swing + "%";
});
