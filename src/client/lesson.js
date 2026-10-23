/* The lesson on this page, as the player describes it, and moving on from it. Shared by the player and
   the Complete button under it. */
import { navigate } from "astro:transitions/client";
import { persist, refresh, stepHref, resumeAt } from "./progress.js";

export const player = () => document.getElementById("player");
export const curLesson = () => {
  const p = player();
  return (
    p && {
      k: p.dataset.inst,
      id: p.dataset.lesson,
      act: +p.dataset.step,
      ids: p.dataset.stepIds.split(" "),
      n: p.dataset.stepIds.split(" ").length,
      next: p.dataset.next,
      nextPath: p.dataset.nextPath,
    }
  );
};
/* a step's tick, by its id: "w05:set-decay" */
export const stepKey = (c, i) => c.id + ":" + c.ids[i];
export function markAllDone(s, c) {
  if (!s.done[c.id] && c.ids.every((x) => s.steps[c.id + ":" + x])) s.done[c.id] = Date.now();
}
/* finishing a lesson opens the next one where you left it (or its intro); the last lesson stays put */
export function goNextLesson(s, c) {
  persist();
  if (c.next) navigate(stepHref(c.nextPath, resumeAt(s, c.next)));
  else refresh();
}
