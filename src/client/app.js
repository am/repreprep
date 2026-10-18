/* Browser side of Rep Rep Rep. Pages arrive already built; this script adds your progress
   (ticks, finished lessons, notes, layout), saves it, and runs the interactive bits.
   Progress is always kept in this browser; when you're signed in it is also saved to your account. */
import { navigate } from "astro:transitions/client";
import { CYCLES_CONTROLS, iconSvg } from "../course/model-cycles/controls.js";
import { keyify } from "../course/shared/text.js";
import { esc } from "../course/shared/html.js";
import { gridStop, mountGrids } from "./audio.js";
import { SIGN_IN } from "../lib/features.js";

const PANELS = { cycles: { controls: CYCLES_CONTROLS, icon: iconSvg } };
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ============================================================
   STATE + SAVING
   Same shape as the single-file app, so old progress files load as they are:
   {inst:{cycles:{lesson, steps:{"w05:3":true}, done:{w05:ts}, notes:{w05:"…"}, active:{w05:3}}}, focus, stepW, updatedAt}
   ============================================================ */
const LS_KEY = "repreprep-progress-v1";
let state = { updatedAt: 0, inst: {}, introSteps: 1 };
function ist(k) { return state.inst[k] || (state.inst[k] = { lesson: null, steps: {}, done: {}, notes: {}, active: {} }); }
/* progress saved before lessons had an intro step: shift every step by one */
function migrate(st) {
  if (!st || !st.inst || st.introSteps) return st;
  Object.values(st.inst).forEach((v) => {
    const ns = {}; Object.entries(v.steps || {}).forEach(([k, on]) => { const [id, i] = k.split(":"); ns[id + ":" + (+i + 1)] = on; }); v.steps = ns;
    Object.keys(v.active || {}).forEach((id) => { v.active[id] = +v.active[id] + 1; });
    Object.keys(ns).forEach((k) => { ns[k.split(":")[0] + ":0"] = true; });
  });
  st.introSteps = 1; return st;
}
const clean = (st) => { const { instrument, tab, ...rest } = st; return rest; };
try { const s = JSON.parse(localStorage.getItem(LS_KEY) || "null"); if (s && s.inst) state = Object.assign(state, migrate(s)); } catch (e) {}

let me = null, providers = [], meLoaded = false;
let saveTimer = null, saving = false, dirty = false;
function setSync(t) { const el = $("#sync"); if (el) el.textContent = t; }
const syncMsg = () => (me ? "Progress saved to your account." : "Progress saved in this browser.");
function persist() {
  state.updatedAt = Date.now();
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  if (!me) return;
  dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(flush, 1200);
}
async function flush(keepalive = false) {
  if (!me || saving || !dirty) return;
  saving = true; dirty = false;
  try {
    const r = await fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: state }), keepalive });
    if (r.status === 401) { me = null; renderAcct(); }
    else if (!r.ok) throw new Error("save failed");
    setSync(syncMsg());
  } catch (e) { dirty = true; setSync("Saved in this browser. Will retry saving to your account."); }
  saving = false; if (dirty && me) { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 5000); }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });

/* who's signed in; then merge: the newer of this browser and the account wins */
async function loadAccount() {
  if (!SIGN_IN) { meLoaded = true; hydrate(); return; }
  try {
    const r = await fetch("/api/me", { cache: "no-store" });
    if (r.ok) { const j = await r.json(); me = j.user; providers = j.providers || []; }
  } catch (e) {}
  meLoaded = true;
  if (me) {
    try {
      const r = await fetch("/api/progress", { cache: "no-store" });
      const j = r.ok ? await r.json() : null;
      const remote = j && j.data;
      if (remote && remote.inst && (remote.updatedAt || 0) > (state.updatedAt || 0)) {
        state = Object.assign({ updatedAt: 0, inst: {}, introSteps: 1 }, migrate(clean(remote)));
        try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
      } else if (state.updatedAt && (state.updatedAt || 0) > ((remote && remote.updatedAt) || 0)) { dirty = true; flush(); }
    } catch (e) { setSync("Couldn't reach your account. Progress is saved in this browser."); }
  }
  hydrate();
}

/* ============================================================
   FILL THE PAGE WITH YOUR PROGRESS
   ============================================================ */
const sizes = () => { try { return JSON.parse(document.body.dataset.sizes || "{}"); } catch (e) { return {}; } };
function lessonPct(s, id, n) { let d = 0; for (let i = 0; i < n; i++) if (s.steps[id + ":" + i]) d++; return n ? d / n : 0; }
const stepHref = (path, i) => (i ? `${path}/${i}` : path);
const P = () => $("#player");

function hydrate() {
  const k = document.body.dataset.inst;
  renderAcct();
  setSync(meLoaded ? syncMsg() : "");
  if (k) {
    const s = ist(k), sz = sizes();
    let t = 0, d = 0;
    Object.entries(sz).forEach(([id, n]) => { t += n; for (let i = 0; i < n; i++) if (s.steps[id + ":" + i]) d++; });
    const mt = $("#meterTxt"); if (mt) mt.textContent = `${d} of ${t} reps`;
    /* progress dots next to lessons, and lesson links that reopen the step you were on */
    $$("[data-prog]").forEach((el) => { const id = el.dataset.prog; const p = lessonPct(s, id, sz[id] || 0); el.className = "s " + (s.done[id] || p === 1 ? "full" : p > 0 ? "part" : ""); el.style.setProperty("--p", Math.round(p * 100) + "%"); });
    $$("a[data-lesson][data-path]").forEach((a) => { a.href = stepHref(a.dataset.path, s.active[a.dataset.lesson] || 0); });
    hydrateLesson(k, s);
    hydrateOverview(s);
  }
  hydratePanel();
  hydrateAccountPage();
  hydratePrivacyPage();
}

function hydrateLesson(k, s) {
  const p = P(); if (!p) return;
  const id = p.dataset.lesson, act = +p.dataset.step;
  if (s.lesson !== id || (s.active[id] ?? 0) !== act) { s.lesson = id; s.active[id] = act; persist(); }
  $$(".dots [data-step]").forEach((a) => a.classList.toggle("done", !!s.steps[id + ":" + a.dataset.step]));
  const fb = $("[data-finish]"), stamp = $(".finish .stamp");
  if (fb) { fb.textContent = s.done[id] ? "Completed" : fb.dataset.label; fb.classList.toggle("primary", !s.done[id]); }
  if (stamp) { stamp.hidden = !s.done[id]; if (s.done[id]) stamp.textContent = "Done on " + new Date(s.done[id]).toLocaleDateString(); }
  showNote(s, id);
  const mx = $("[data-max]"); if (mx) { const l = state.focus ? "Exit full window (Esc)" : "Maximize"; mx.setAttribute("aria-label", l); mx.title = l; }
  document.documentElement.classList.toggle("focus", !!state.focus);
  if (state.stepW) document.documentElement.style.setProperty("--sw", state.stepW + "px");
  fitPlayer();
}

function hydrateOverview(s) {
  const c = $("[data-continue]"); if (!c) return;
  const links = [...$$(".umap a[data-lesson]")];
  const cur = links.find((a) => a.dataset.lesson === s.lesson);
  if (cur && Object.keys(s.steps).length) {
    c.href = stepHref(cur.dataset.path, s.active[s.lesson] || 0);
    c.textContent = c.dataset.labelContinue;
    const w = $("[data-continue-what]"); if (w) w.textContent = cur.querySelector(".n").textContent + " · " + cur.querySelector(".t").childNodes[0].textContent;
  }
}

/* ============================================================
   ACCOUNT
   ============================================================ */
function renderAcct() {
  const a = $("#acct"); if (!a || !SIGN_IN) return;
  a.textContent = me ? me.name || me.email || "Your account" : "Sign in";
}
const PROVIDER_ICON = {
  google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zm-5.6-8c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2l3.3-2.6zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>',
};
function hydrateAccountPage() {
  const root = $("#account"); if (!SIGN_IN || !root || !meLoaded) return;
  const q = new URLSearchParams(location.search);
  root.querySelector("[data-acct-error]").hidden = q.get("error") !== "signin";
  root.querySelectorAll("[data-signed-in]").forEach((el) => (el.hidden = !me));
  root.querySelectorAll("[data-signed-out]").forEach((el) => (el.hidden = !!me));
  if (me) root.querySelector("[data-who]").textContent = [me.name, me.email && `(${me.email})`].filter(Boolean).join(" ");
  else {
    const box = root.querySelector("[data-providers]");
    const next = q.get("next") || "/account";
    box.innerHTML = providers.map((p) => `<a class="btn" href="/auth/${p.id}?next=${encodeURIComponent(next)}" data-astro-reload>${PROVIDER_ICON[p.id] || ""}Continue with ${esc(p.name)}</a>`).join("");
    root.querySelector("[data-no-providers]").hidden = providers.length > 0;
  }
}
const CONTACT_MSG = {
  sent: ["Thanks, your message was sent.", ""],
  empty: ["Please write a message first.", "bad"],
  long: ["That message is too long. Please keep it under 4000 characters.", "bad"],
  busy: ["The form is getting a lot of messages right now. Please try again tomorrow.", "bad"],
};
function hydratePrivacyPage() {
  const el = $("[data-contact-msg]"); if (!el) return;
  const q = new URLSearchParams(location.search);
  const m = CONTACT_MSG[q.get("sent") ? "sent" : q.get("error")];
  el.hidden = !m;
  if (m) { el.textContent = m[0]; el.className = "msg " + m[1]; }
}
async function signOut() {
  await flush();
  await fetch("/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
  /* a shared computer shouldn't keep your progress after you sign out */
  try { localStorage.removeItem(LS_KEY); } catch (e) {}
  location.href = "/account";
}
async function deleteAccount() {
  if (!confirm("Delete your account and the progress saved with it? This can't be undone.")) return;
  const r = await fetch("/api/me", { method: "DELETE", headers: { "Content-Type": "application/json" } }).catch(() => null);
  if (r && r.ok) { me = null; location.href = "/account"; } else alert("Couldn't delete the account. Please try again.");
}
function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "repreprep-progress.json" });
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
/* clears ticks, finished lessons and notes; layout choices stay */
function clearProgress() {
  if (!confirm("Delete your progress? Your ticks, finished lessons and notes will be removed. Download a copy first if you might want them back.")) return;
  state.inst = {};
  persist(); hydrate();
  const msg = $("[data-clear-msg]"); if (msg) msg.textContent = "Progress deleted.";
}
async function importProgress(file) {
  const msg = $("[data-import-msg]");
  try {
    const s = JSON.parse(await file.text());
    if (!s || typeof s.inst !== "object") throw new Error("not a progress file");
    state = Object.assign({ updatedAt: 0, inst: {}, introSteps: 1 }, migrate(clean(s)));
    persist(); hydrate();
    const n = Object.values(state.inst).reduce((a, v) => a + Object.keys(v.steps || {}).length, 0);
    if (msg) msg.textContent = `Loaded. ${n} ticked steps.`;
  } catch (e) { if (msg) msg.textContent = "That file isn't a Rep Rep Rep progress file."; }
}

/* ============================================================
   LESSON PLAYER
   ============================================================ */
function fitPlayer() {
  const el = P(); if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  el.style.setProperty("--ph", `calc(100dvh - ${Math.round(top) + 20}px)`);
}
window.addEventListener("resize", fitPlayer);
const curLesson = () => { const p = P(); return p && { k: p.dataset.inst, id: p.dataset.lesson, act: +p.dataset.step, n: +p.dataset.steps, next: p.dataset.next, nextPath: p.dataset.nextPath }; };
function markAllDone(s, c) { if (!s.done[c.id] && [...Array(c.n).keys()].every((i) => s.steps[c.id + ":" + i])) s.done[c.id] = Date.now(); }
/* finishing a lesson opens the next one where you left it (or its intro); the last lesson stays put */
function goNextLesson(s, c) {
  persist();
  if (c.next) navigate(stepHref(c.nextPath, s.active[c.next] || 0));
  else hydrate();
}
function setFocus(on) { state.focus = on; persist(); hydrate(); }

/* drag the gutter to resize the step column; the width is saved with your progress */
function clampStepW(w) { const b = $("#pbody"); const max = b ? Math.max(320, b.clientWidth * 0.7) : 900; return Math.round(Math.min(Math.max(w, 260), max)); }
function setStepW(w, save) { state.stepW = clampStepW(w); document.documentElement.style.setProperty("--sw", state.stepW + "px"); if (save) persist(); }
document.addEventListener("pointerdown", (e) => {
  const g = e.target.closest("#gutter"); if (!g) return;
  e.preventDefault(); g.setPointerCapture(e.pointerId); g.classList.add("drag"); document.body.classList.add("resizing");
  const right = $("#pbody").getBoundingClientRect().right;
  const move = (ev) => setStepW(right - ev.clientX, false);
  const up = () => { g.removeEventListener("pointermove", move); g.classList.remove("drag"); document.body.classList.remove("resizing"); persist(); };
  g.addEventListener("pointermove", move); g.addEventListener("pointerup", up, { once: true }); g.addEventListener("pointercancel", up, { once: true });
});
document.addEventListener("dblclick", (e) => { if (e.target.closest("#gutter")) { delete state.stepW; document.documentElement.style.removeProperty("--sw"); persist(); } });

/* lesson picker: close when clicking elsewhere or pressing Esc */
document.addEventListener("click", (e) => { $$("details.picker[open]").forEach((d) => { if (!d.contains(e.target)) d.open = false; }); }, true);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const d = $("details.picker[open]"); if (d) { d.open = false; e.stopImmediatePropagation(); } } }, true);

/* multiple-choice checks */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-opt]"); if (!b) return;
  e.stopPropagation(); const q = b.closest(".quiz"); if (q.classList.contains("solved")) return; const m = q.querySelector(".qmsg"); m.hidden = false;
  if (b.dataset.opt === "1") { b.classList.add("right"); q.classList.add("solved"); m.textContent = "Right."; m.className = "qmsg ok"; q.querySelector(".qexp").hidden = false; q.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); }
  else { b.classList.add("wrong"); b.disabled = true; m.textContent = "Not quite. Try another one."; m.className = "qmsg no"; }
}, true);

/* panel guide: each control has its own page; keep the scroll position when switching */
let keepScroll = null;
function hydratePanel() { if (keepScroll != null) { window.scrollTo(0, keepScroll); keepScroll = null; } }

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-closectl]")) { $("#ctlinfo").hidden = true; return; }
  if (e.target.closest("[data-max]")) { setFocus(!state.focus); return; }
  if (e.target.closest("[data-signout]")) { signOut(); return; }
  if (e.target.closest("[data-delete]")) { deleteAccount(); return; }
  if (e.target.closest("[data-export]")) { exportProgress(); return; }
  if (e.target.closest("[data-clear]")) { clearProgress(); return; }
  const ctl = e.target.closest("svg .c");
  if (ctl) {
    const guide = ctl.closest("[data-panel-guide]");
    if (guide) { keepScroll = window.scrollY; navigate(`${guide.dataset.panelGuide}/${ctl.dataset.id}`); return; }
    const k = document.body.dataset.inst, I = PANELS[k], c = I && I.controls[ctl.dataset.id], box = $("#ctlinfo");
    if (c && box) { box.hidden = false; box.innerHTML = `<div class="h">${esc(c.kind)} <button class="x" data-closectl aria-label="Close">×</button></div><b>${esc(c.name)}</b>${c.sub ? ` <span class="sec">(${esc(c.sub)})</span>` : ""}. ${keyify(I, c.desc, "")}`; }
    return;
  }
  const c = curLesson(); if (!c) return;
  const s = ist(c.k);
  const nav = e.target.closest("[data-nav]");
  if (nav && nav.dataset.nav === "1") {
    if (c.act < c.n) { s.steps[c.id + ":" + c.act] = true; markAllDone(s, c); } /* the optional challenge is never a rep */
    if (nav.hasAttribute("data-end")) { e.preventDefault(); goNextLesson(s, c); return; }
    persist(); return; /* the link opens the next step */
  }
  const fin = e.target.closest("[data-finish]");
  if (fin) {
    if (s.done[c.id]) { delete s.done[c.id]; persist(); hydrate(); return; }
    s.done[c.id] = Date.now(); for (let i = 0; i < c.n; i++) s.steps[c.id + ":" + i] = true;
    goNextLesson(s, c); return;
  }
}, true); /* capture: runs before the router follows a link, so Finish can pick where to go */
document.addEventListener("change", (e) => { const f = e.target.closest("[data-import]"); if (f && f.files[0]) { importProgress(f.files[0]); f.value = ""; } });
document.addEventListener("keydown", (e) => {
  if (e.target.id === "gutter" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) { e.preventDefault(); const cur = $(".pstep").getBoundingClientRect().width; setStepW(cur + (e.key === "ArrowLeft" ? 40 : -40), true); return; }
  if (P() && !e.target.closest("textarea,input,select") && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (e.key === "Escape" && state.focus) { setFocus(false); return; }
    const nav = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (nav) { const b = $(`[data-nav="${nav}"]`); if (b) { e.preventDefault(); b.click(); } return; }
  }
  if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("c")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
});

/* lesson notes: read mode by default; Edit opens the box, and only Save keeps what you typed */
function showNote(s, id, saved) {
  const box = $(`[data-notebox="${id}"]`); if (!box) return;
  const t = s.notes[id] || "", txt = box.querySelector(".nb-text");
  txt.textContent = t; txt.hidden = !t; box.querySelector(".nb-empty").hidden = !!t;
  const ed = box.querySelector("[data-note-edit]"); ed.textContent = t ? "Edit" : "Add a note";
  if (!box.classList.contains("editing")) { box.querySelector(".nb-view").hidden = false; box.querySelector(".nb-edit").hidden = true; ed.hidden = false; }
  const st = box.querySelector(".nb-stamp"); if (saved !== undefined) st.hidden = !saved;
}
function noteMode(box, edit) {
  box.classList.toggle("editing", edit);
  box.querySelector(".nb-view").hidden = edit; box.querySelector(".nb-edit").hidden = !edit; box.querySelector("[data-note-edit]").hidden = edit;
  box.querySelector(".nb-stamp").hidden = true;
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-note-edit],[data-note-save],[data-note-cancel]"); if (!b) return;
  const box = b.closest("[data-notebox]"), id = box.dataset.notebox, c = curLesson(); if (!c) return;
  const s = ist(c.k), ta = box.querySelector("textarea");
  if (b.hasAttribute("data-note-edit")) { ta.value = s.notes[id] || ""; noteMode(box, true); ta.focus(); return; }
  if (b.hasAttribute("data-note-save")) { const v = ta.value.trim(); if (v) s.notes[id] = v; else delete s.notes[id]; persist(); }
  noteMode(box, false); showNote(s, id, b.hasAttribute("data-note-save")); box.querySelector("[data-note-edit]").focus();
});
document.addEventListener("keydown", (e) => {
  const ta = e.target.closest && e.target.closest("[data-notebox] textarea"); if (!ta) return;
  const box = ta.closest("[data-notebox]");
  if (e.key === "Escape") { e.preventDefault(); box.querySelector("[data-note-cancel]").click(); }
  else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); box.querySelector("[data-note-save]").click(); }
});

/* every page view (first load and each in-site navigation) */
document.addEventListener("astro:before-swap", gridStop);
document.addEventListener("astro:page-load", () => { mountGrids(); hydrate(); });
loadAccount();
