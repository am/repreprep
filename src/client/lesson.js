/* The lesson on this page, as the player describes it, and moving on from it. Shared by the player and
   the Complete button under it. */
import { navigate } from "astro:transitions/client";
import { persist, refresh, stepHref } from "./progress.js";

export const player = () => document.getElementById("player");
export const curLesson = () => { const p = player(); return p && { k: p.dataset.inst, id: p.dataset.lesson, act: +p.dataset.step, n: +p.dataset.steps, next: p.dataset.next, nextPath: p.dataset.nextPath }; };
export function markAllDone(s, c) { if (!s.done[c.id] && [...Array(c.n).keys()].every((i) => s.steps[c.id + ":" + i])) s.done[c.id] = Date.now(); }
/* finishing a lesson opens the next one where you left it (or its intro); the last lesson stays put */
export function goNextLesson(s, c) {
  persist();
  if (c.next) navigate(stepHref(c.nextPath, s.active[c.next] || 0));
  else refresh();
}
