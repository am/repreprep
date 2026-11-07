/* The lesson on this page, as the player describes it, and moving on from it. Shared by the player and
   the Complete button under it. */
import { stepHref, resumeAt } from "./progress.js";

export const player = () => document.getElementById("player");
export const curLesson = () => {
  const p = player();
  return (
    p && {
      k: p.dataset.inst,
      id: p.dataset.lesson,
      act: +p.dataset.step,
      done: p.hasAttribute("data-done"),
      donePath: p.dataset.donePath,
      ids: p.dataset.stepIds.split(" "),
      n: p.dataset.stepIds.split(" ").length,
      challenge: p.hasAttribute("data-challenge"),
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
/* "Next lesson" on the done screen opens the next one where you left it (or its intro); after the last
   lesson the button leads to the course page */
export const nextLessonHref = (s, c, btn) =>
  c.next ? stepHref(c.nextPath, resumeAt(s, c.next)) : btn.getAttribute("href");
