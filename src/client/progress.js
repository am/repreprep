/* Your progress: ticks, finished lessons, notes and layout. Always kept in this browser; when you're signed
   in it is also saved to your account. Pages arrive already built, and each component's script fills in its
   part of your progress with onProgress, which runs on every page view and again whenever progress changes.
   Same shape as the single-file app, so old progress files load as they are:
   {inst:{cycles:{lesson, steps:{"w05:3":true}, done:{w05:ts}, notes:{w05:"…"}, active:{w05:3}}}, focus, stepW, updatedAt} */
import { SIGN_IN } from "astro:env/client";
import { entries, stamp, merge, sameProgress } from "../lib/merge-progress.js";
/* the account calls (src/actions), loaded only when sign-in is on */
const server = () => import("astro:actions");

export const LS_KEY = "repreprep-progress-v1";
const fresh = () => ({ updatedAt: 0, inst: {}, introSteps: 1 });
export let state = fresh();
/* the entries as last saved, to tell which ones a change touched (see src/lib/merge-progress.js) */
let last = {};
/* what this tab last read or wrote in localStorage */
let lastRaw = null;
const readLocal = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const s = raw === lastRaw ? null : JSON.parse(raw || "null");
    lastRaw = raw;
    return s && s.inst ? s : null;
  } catch (e) {
    return null;
  }
};
/* another tab may have saved since this one last looked: combine with that first */
const saveLocal = () => {
  const other = readLocal();
  if (other) take(merge(state, migrate(clean(other))));
  try {
    lastRaw = JSON.stringify(state);
    localStorage.setItem(LS_KEY, lastRaw);
  } catch (e) {}
};
/* progress from elsewhere (another tab, a file, the account), already combined with this one */
function take(s) {
  const changed = !sameProgress(state, s);
  state = Object.assign(fresh(), s);
  last = entries(state);
  return changed;
}
/* a progress object from a file: drop old app fields, bring old step numbers up to date, combine with this
   browser's progress so nothing done here is lost */
export const combine = (s) => take(merge(state, migrate(clean(s))));
export function ist(k) {
  return state.inst[k] || (state.inst[k] = { lesson: null, steps: {}, done: {}, notes: {}, active: {} });
}
/* the progress of the instrument this page belongs to, if any */
export const here = () => {
  const k = document.body.dataset.inst;
  return k ? ist(k) : null;
};
/* progress saved before lessons had an intro step: shift every step by one */
function migrate(st) {
  if (!st || !st.inst || st.introSteps) return st;
  Object.values(st.inst).forEach((v) => {
    const ns = {};
    Object.entries(v.steps || {}).forEach(([k, on]) => {
      const [id, i] = k.split(":");
      ns[id + ":" + (+i + 1)] = on;
    });
    v.steps = ns;
    Object.keys(v.active || {}).forEach((id) => {
      v.active[id] = +v.active[id] + 1;
    });
    Object.keys(ns).forEach((k) => {
      ns[k.split(":")[0] + ":0"] = true;
    });
  });
  st.introSteps = 1;
  return st;
}
const clean = (st) => {
  const { instrument, tab, ...rest } = st;
  return rest;
};
{
  const s = readLocal();
  if (s) state = Object.assign(state, migrate(s));
  last = entries(state);
}
/* ask the browser not to clear the site's storage on its own (Safari otherwise may after a week away) */
try {
  navigator.storage?.persist?.().catch(() => {});
} catch (e) {}

/* steps per lesson, from the page, so progress can be counted without loading the whole course */
export const sizes = () => {
  try {
    return JSON.parse(document.body.dataset.sizes || "{}");
  } catch (e) {
    return {};
  }
};
export function lessonPct(s, id, n) {
  let d = 0;
  for (let i = 0; i < n; i++) if (s.steps[id + ":" + i]) d++;
  return n ? d / n : 0;
}
export const stepHref = (path, i) => (i ? `${path}/${i}` : path);

/* ---------- filling the page ---------- */
const hooks = [];
export function onProgress(fn) {
  hooks.push(fn);
}
/* while redrawing for a change made elsewhere, the page's own small updates (like which lesson is open) are
   only remembered, not saved, so two open tabs can't keep answering each other */
let quiet = false;
export function refresh() {
  hooks.forEach((fn) => fn(state));
}
function refreshQuietly() {
  quiet = true;
  try {
    refresh();
  } finally {
    quiet = false;
  }
}
document.addEventListener("astro:page-load", refresh);
/* a change saved in another tab of this browser */
window.addEventListener("storage", (e) => {
  if (e.key !== LS_KEY) return;
  const other = readLocal();
  if (other && take(merge(state, migrate(clean(other)))) && document.visibilityState === "visible") refreshQuietly();
});

/* ---------- saving ---------- */
export const account = { me: null, providers: [], loaded: false };
let saveTimer = null,
  saving = false,
  dirty = false;
export function setSync(t) {
  const el = document.getElementById("sync");
  if (el) el.textContent = t;
}
export const syncMsg = () => (account.me ? "Progress saved to your account." : "Progress saved in this browser.");
export function persist() {
  const now = Date.now();
  last = stamp(state, last, now);
  state.updatedAt = now;
  if (quiet) return;
  saveLocal();
  if (!account.me) return;
  dirty = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 1200);
}
export async function flush(keepalive = false) {
  if (!account.me || saving || !dirty) return;
  saving = true;
  dirty = false;
  try {
    const { actions, getActionPath } = await server();
    const save = { data: state };
    /* a save as the page is hidden has to outlive the page, which only fetch's keepalive does */
    const { data, error } = keepalive
      ? await fetch(getActionPath(actions.progress.save), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(save),
          keepalive,
        }).then((r) => ({ data: null, error: r.ok ? null : { code: r.status === 401 ? "UNAUTHORIZED" : "FAILED" } }))
      : await actions.progress.save(save);
    if (error?.code === "UNAUTHORIZED") {
      account.me = null;
      refresh();
    } else if (error) throw error;
    /* the account combines what it had with this save, which may bring back changes from another device */
    else if (data?.data && take(merge(state, migrate(clean(data.data))))) {
      saveLocal();
      if (!keepalive) refreshQuietly();
    }
    setSync(syncMsg());
  } catch (e) {
    dirty = true;
    setSync("Saved in this browser. Will retry saving to your account.");
  }
  saving = false;
  if (dirty && account.me) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 5000);
  }
}
/* leaving the tab saves to the account; coming back picks up what other tabs and devices did meanwhile */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flush(true);
  else {
    const other = readLocal();
    if (other) take(merge(state, migrate(clean(other))));
    refresh();
    if (account.me) pull();
  }
});
/* after a change that more than one part of the page shows: save it and redraw */
export function update() {
  persist();
  refresh();
}

/* what the account has, combined with this browser; anything only this browser had goes back up */
async function pull() {
  try {
    const { actions } = await server();
    const { data: j } = await actions.progress.load();
    const remote = j && j.data && j.data.inst ? migrate(clean(j.data)) : null;
    const both = merge(state, remote);
    if (take(both)) saveLocal();
    if (!sameProgress(both, remote)) {
      dirty = true;
      flush();
    }
  } catch (e) {
    setSync("Couldn't reach your account. Progress is saved in this browser.");
  }
}
/* who's signed in; then combine this browser's progress with the account's */
async function loadAccount() {
  if (SIGN_IN) {
    try {
      const { actions } = await server();
      const { data } = await actions.account.me();
      if (data) {
        account.me = data.user;
        account.providers = data.providers || [];
      }
    } catch (e) {}
  }
  account.loaded = true;
  if (account.me) await pull();
  refresh();
}
loadAccount();
