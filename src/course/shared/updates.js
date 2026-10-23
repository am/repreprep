/* Versions and lesson updates, from the changelog (src/content/changelog.yaml). The same code runs at build
   time, for the pages, and in the browser, for the update notes on lessons and for moving saved ticks when a
   release adds steps to a lesson. A release lists the lessons it changed as "<instrument slug>/<lesson id>". */

/* the version saved progress is taken to be from when it doesn't say: the last one before the changelog */
export const FIRST_VERSION = "0.1.0";

/* compares "0.3.0" with "0.10.0" as numbers, part by part: below 0 when a is older */
export function cmpVersion(a, b) {
  const x = String(a).split(".").map(Number),
    y = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
}
export const newestFirst = (releases) => [...releases].sort((a, b) => cmpVersion(b.id, a.id));

/* one instrument's lesson updates, by lesson id, newest first: {w08: [{v, date, what}]} */
export function lessonUpdates(releases, slug) {
  const out = {};
  newestFirst(releases).forEach((r) =>
    (r.lessons || []).forEach((c) => {
      const [s, id] = c.lesson.split("/");
      if (s === slug) (out[id] ||= []).push({ v: r.id, date: r.date, what: c.what });
    })
  );
  return out;
}
/* what the browser needs to bring old progress up to date: the steps each release added, by progress key
   and lesson, oldest release first: [{v, add: {cycles: {w08: [5, 6]}}}] */
export function stepMoves(releases, keyOf) {
  return newestFirst(releases)
    .reverse()
    .map((r) => {
      const add = {};
      (r.lessons || []).forEach((c) => {
        if (!c.added) return;
        const [s, id] = c.lesson.split("/");
        const k = keyOf[s];
        if (k) (add[k] ||= {})[id] = [...c.added].sort((a, b) => a - b);
      });
      return { v: r.id, add };
    })
    .filter((m) => Object.keys(m.add).length);
}
/* where an old step lands after steps were added at these positions (counted in the new lesson) */
export function movedIndex(i, added) {
  let n = i;
  for (const a of added) if (a <= n) n++;
  return n;
}
/* moves the ticks and the open step of every release newer than the progress's version, then marks the
   progress as up to date */
export function moveSteps(state, moves, version) {
  const from = state.ver || FIRST_VERSION;
  moves
    .filter((m) => cmpVersion(m.v, from) > 0 && cmpVersion(m.v, version) <= 0)
    .forEach((m) =>
      Object.entries(m.add).forEach(([k, lessons]) => {
        const s = state.inst && state.inst[k];
        if (!s) return;
        Object.entries(lessons).forEach(([id, added]) => {
          const steps = {};
          Object.entries(s.steps || {}).forEach(([key, on]) => {
            const [lid, i] = key.split(":");
            steps[lid === id ? `${lid}:${movedIndex(+i, added)}` : key] = on;
          });
          s.steps = steps;
          if (s.active && s.active[id] !== undefined) s.active[id] = movedIndex(+s.active[id], added);
        });
      })
    );
  state.ver = version;
  return state;
}
/* a lesson counts as yours once you've opened or ticked any of it */
export const started = (s, id) =>
  !!(s && (s.done[id] || s.active[id] !== undefined || Object.keys(s.steps).some((k) => k.startsWith(id + ":"))));
/* the updates to tell you about: newer than when you started using the site and than the last one you
   marked as read on this lesson */
export const unseen = (updates, since, seen) =>
  (updates || []).filter((u) => cmpVersion(u.v, since || FIRST_VERSION) > 0 && (!seen || cmpVersion(u.v, seen) > 0));
