/* Combining two copies of your progress (this tab and another one, a loaded file, or your account), so
   what you did on one device is never lost on another. Every entry (a ticked step, a finished lesson, a note,
   where you are in a lesson, the layout) has the time it last changed in `stamps`, and for each entry the
   newer change wins. A removed entry keeps its stamp, so removing it also carries over. Entries saved before
   stamps existed count as time 0: kept when either copy has them, from the newer copy when both do.
   Used in the browser (src/client/progress.js) and by the server when it saves to your account. */

const FIELDS = ["steps", "done", "notes", "active"];
const LAYOUT = ["focus", "stepW"];

/* every entry of a progress object, by path: "cycles/steps/w05:3", "cycles/lesson", "focus" */
export function entries(s) {
  const out = {};
  for (const [k, v] of Object.entries((s && s.inst) || {})) {
    if (!v || typeof v !== "object") continue;
    if (v.lesson != null) out[`${k}/lesson`] = v.lesson;
    for (const f of FIELDS) for (const [id, x] of Object.entries(v[f] || {})) out[`${k}/${f}/${id}`] = x;
  }
  for (const t of LAYOUT) if (s && s[t] != null) out[t] = s[t];
  return out;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* after a change: stamp every entry that differs from `before` (entries() of the last save) with now.
   Returns the new entries, to pass as `before` next time. */
export function stamp(s, before, now = Date.now()) {
  const after = entries(s);
  const st = (s.stamps = s.stamps || {});
  for (const p of new Set([...Object.keys(before), ...Object.keys(after)])) if (!same(before[p], after[p])) st[p] = now;
  return after;
}

/* a progress object from entries, keeping the other top-level fields of `base` */
function build(base, ent, stamps, updatedAt) {
  const { inst, stamps: _, ...rest } = base;
  for (const t of LAYOUT) delete rest[t];
  const out = { ...rest, updatedAt, stamps, inst: {} };
  for (const [p, x] of Object.entries(ent)) {
    const [k, f, ...id] = p.split("/");
    if (f === undefined) {
      out[k] = x;
      continue;
    }
    const v = (out.inst[k] = out.inst[k] || { lesson: null, steps: {}, done: {}, notes: {}, active: {} });
    if (f === "lesson") v.lesson = x;
    else v[f][id.join("/")] = x;
  }
  return out;
}

/* a and b combined; neither is changed */
export function merge(a, b) {
  if (!b || !b.inst) return a;
  if (!a || !a.inst) return b;
  const ea = entries(a),
    eb = entries(b),
    sa = a.stamps || {},
    sb = b.stamps || {};
  const bNewer = (b.updatedAt || 0) > (a.updatedAt || 0);
  const ent = {},
    stamps = {};
  for (const p of new Set([...Object.keys(ea), ...Object.keys(eb), ...Object.keys(sa), ...Object.keys(sb)])) {
    const ta = sa[p] || 0,
      tb = sb[p] || 0;
    let x;
    if (ta !== tb) x = ta > tb ? ea[p] : eb[p];
    else if (p in ea && p in eb) x = bNewer ? eb[p] : ea[p];
    else x = p in ea ? ea[p] : eb[p];
    if (ta || tb) stamps[p] = Math.max(ta, tb);
    if (x !== undefined) ent[p] = x;
  }
  return build(bNewer ? b : a, ent, stamps, Math.max(a.updatedAt || 0, b.updatedAt || 0));
}

/* whether two copies hold the same progress (ignoring when they were saved) */
const sameMap = (a, b) => {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => k in b && same(a[k], b[k]));
};
export const sameProgress = (a, b) =>
  sameMap(entries(a), entries(b)) && sameMap((a && a.stamps) || {}, (b && b.stamps) || {});
