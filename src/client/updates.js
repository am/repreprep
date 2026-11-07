/* What's new: the dot on the header's What's new icon while the site has a version you haven't seen there
   (opening the page clears it, and tags the releases that were new to you), the note on a lesson you'd started
   when a release changed it, and the "Updated" tag next to it in the lesson lists. What changed comes with the page (Base.astro, data-updates); closing the note marks
   that lesson's updates as read in your progress, and so does opening a lesson you hadn't started. */
import { onProgress, here, state, update, persist } from "./progress.js";
import { unseen, started, isNew } from "../course/shared/updates.js";
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
  const v = document.body.dataset.version;
  const page = document.getElementById("whats-new");
  if (page && state.read !== v) {
    page.querySelectorAll("[data-release]").forEach((el) => {
      el.querySelector("[data-rel-new]").hidden = !isNew(el.dataset.release, state.since, state.read);
    });
    state.read = v;
    persist();
  }
  document.querySelectorAll("[data-news-dot]").forEach((el) => {
    el.hidden = !isNew(v, state.since, state.read);
  });
  const s = here();
  if (!s) return;
  const ups = all();
  document.querySelectorAll("[data-upd-tag]").forEach((el) => {
    el.hidden = !news(s, ups, el.dataset.updTag).length;
  });
  document.querySelectorAll("[data-upd-note]").forEach((el) => {
    const id = el.dataset.updNote;
    /* a lesson you open for the first time already has today's changes: nothing in it is news later */
    if (!started(s, id) && !(s.seen && s.seen[id])) {
      (s.seen ||= {})[id] = document.body.dataset.version;
      persist();
    }
    const n = news(s, ups, id);
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
