/* Lesson updates: the note on a lesson you'd started when a release changed it, and the "Updated" tag next to
   it in the lesson lists. What changed comes with the page (Base.astro, data-updates); closing the note marks
   that lesson's updates as read in your progress. */
import { onProgress, here, state, update } from "./progress.js";
import { unseen, started } from "../course/shared/updates.js";
import { esc } from "../course/shared/html.js";

const all = () => {
  try {
    return JSON.parse(document.body.dataset.updates || "{}");
  } catch (e) {
    return {};
  }
};
const news = (s, ups, id) => (started(s, id) ? unseen(ups[id], state.since, s.seen && s.seen[id]) : []);

onProgress(() => {
  const s = here();
  if (!s) return;
  const ups = all();
  document.querySelectorAll("[data-upd-tag]").forEach((el) => {
    el.hidden = !news(s, ups, el.dataset.updTag).length;
  });
  document.querySelectorAll("[data-upd-note]").forEach((el) => {
    const n = news(s, ups, el.dataset.updNote);
    el.hidden = !n.length;
    el.querySelector("[data-upd-list]").innerHTML = n
      .map((u) => `<li><span class="v">Version ${esc(u.v)}</span> ${esc(u.what)}</li>`)
      .join("");
  });
});

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-upd-ok]");
  const s = here();
  if (!b || !s) return;
  (s.seen ||= {})[b.closest("[data-upd-note]").dataset.updNote] = document.body.dataset.version;
  update();
});
