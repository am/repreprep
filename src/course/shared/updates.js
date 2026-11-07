/* Versions and lesson updates, from the changelog (src/content/changelog.yaml). The same code runs at build
   time, for the pages, and in the browser, for the What's new dot and the update notes on lessons. A release
   lists the lessons it changed as "<instrument slug>/<lesson id>". */

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
/* a lesson counts as yours once you've ticked any of its steps (opening it alone doesn't count) */
export const started = (s, id) => !!(s && (s.done[id] || Object.keys(s.steps).some((k) => k.startsWith(id + ":"))));
/* a release is news to you when it came after you started using the site and after the last version you saw
   on What's new; while the site's own version is, the header's What's new icon shows a dot */
export const isNew = (v, since, read) =>
  cmpVersion(v, since || FIRST_VERSION) > 0 && (!read || cmpVersion(v, read) > 0);
/* the updates to tell you about on a lesson: newer than when you started using the site and than the last one
   you marked as read on it */
export const unseen = (updates, since, seen) => (updates || []).filter((u) => isNew(u.v, since, seen));
