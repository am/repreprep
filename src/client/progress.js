/* Your progress: ticks, finished lessons, notes and layout. Always kept in this browser; when you're signed
   in it is also saved to your account. Pages arrive already built, and each component's script fills in its
   part of your progress with onProgress, which runs on every page view and again whenever progress changes.
   Same shape as the single-file app, so old progress files load as they are:
   {inst:{cycles:{lesson, steps:{"w05:3":true}, done:{w05:ts}, notes:{w05:"…"}, active:{w05:3}, seen:{w05:"0.3.0"}}},
    focus, stepW, updatedAt, since, ver}
   since is the site's version when this progress began (lesson updates older than that aren't news to you),
   ver the version its step numbers follow; seen holds, per lesson, the version whose update note you closed. */
import { SIGN_IN } from "astro:env/client";
import { FIRST_VERSION, moveSteps } from "../course/shared/updates.js";
/* the account calls (src/actions), loaded only when sign-in is on */
const server = () => import("astro:actions");

export const LS_KEY = "repreprep-progress-v1";
const fresh = () => ({ updatedAt: 0, inst: {}, introSteps: 1 });
export let state = fresh();
const saveLocal = () => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {}
};
/* a progress object from the account or a file: drop old app fields, bring old step numbers up to date */
export const adopt = (s) => {
  state = catchUp(Object.assign(fresh(), migrate(clean(s))));
};
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
/* progress from an older version of the site: its step numbers follow the steps that releases since then
   added (the moves come with the page, see Base.astro) */
function catchUp(st) {
  const b = document.body.dataset;
  if (!b.version) return st;
  st.since ||= FIRST_VERSION;
  try {
    moveSteps(st, JSON.parse(b.moves || "[]"), b.version);
  } catch (e) {}
  return st;
}
const clean = (st) => {
  const { instrument, tab, ...rest } = st;
  return rest;
};
try {
  const s = JSON.parse(localStorage.getItem(LS_KEY) || "null");
  if (s && s.inst) {
    const was = s.ver;
    state = catchUp(Object.assign(state, migrate(s)));
    if (state.ver !== was) saveLocal();
  }
} catch (e) {}
/* new here: today's lesson updates are already in the lessons you'll open */
if (!state.since) state.since = state.ver = document.body.dataset.version;

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
export function refresh() {
  hooks.forEach((fn) => fn(state));
}
document.addEventListener("astro:page-load", refresh);

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
  state.updatedAt = Date.now();
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
    const { error } = keepalive
      ? await fetch(getActionPath(actions.progress.save), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(save),
          keepalive,
        }).then((r) => ({ error: r.ok ? null : { code: r.status === 401 ? "UNAUTHORIZED" : "FAILED" } }))
      : await actions.progress.save(save);
    if (error?.code === "UNAUTHORIZED") {
      account.me = null;
      refresh();
    } else if (error) throw error;
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
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flush(true);
});
/* after a change that more than one part of the page shows: save it and redraw */
export function update() {
  persist();
  refresh();
}

/* who's signed in; then merge: the newer of this browser and the account wins */
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
  if (account.me) {
    try {
      const { actions } = await server();
      const { data: j } = await actions.progress.load();
      const remote = j && j.data;
      if (remote && remote.inst && (remote.updatedAt || 0) > (state.updatedAt || 0)) {
        adopt(remote);
        saveLocal();
      } else if (state.updatedAt && (state.updatedAt || 0) > ((remote && remote.updatedAt) || 0)) {
        dirty = true;
        flush();
      }
    } catch (e) {
      setSync("Couldn't reach your account. Progress is saved in this browser.");
    }
  }
  refresh();
}
loadAccount();
