/* Complete (it opens the done screen, and undoing it), Clear progress, and the notes box: read mode by default; Edit opens it, and only Save keeps what you typed */
import { onProgress, persist, refresh, ist } from "./progress.js";
import { navigate } from "astro:transitions/client";
import { curLesson } from "./lesson.js";

function showNote(s, id, saved) {
  const box = document.querySelector(`[data-notebox="${id}"]`);
  if (!box) return;
  const t = s.notes[id] || "",
    txt = box.querySelector(".nb-text");
  txt.textContent = t;
  txt.hidden = !t;
  box.querySelector(".nb-empty").hidden = !!t;
  const ed = box.querySelector("[data-note-edit]");
  ed.textContent = t ? "Edit" : "Add a note";
  if (!box.classList.contains("editing")) {
    box.querySelector(".nb-view").hidden = false;
    box.querySelector(".nb-edit").hidden = true;
    ed.hidden = false;
  }
  const st = box.querySelector(".nb-stamp");
  if (saved !== undefined) st.hidden = !saved;
}
function noteMode(box, edit) {
  box.classList.toggle("editing", edit);
  box.querySelector(".nb-view").hidden = edit;
  box.querySelector(".nb-edit").hidden = !edit;
  box.querySelector("[data-note-edit]").hidden = edit;
  box.querySelector(".nb-stamp").hidden = true;
}

onProgress(() => {
  const c = curLesson();
  if (!c) return;
  const s = ist(c.k),
    done = s.done[c.id];
  const fb = document.querySelector("[data-finish]"),
    stamp = document.querySelector(".finish .stamp");
  if (fb) {
    fb.textContent = done ? "Completed" : fb.dataset.label;
    fb.classList.toggle("primary", !done);
  }
  if (stamp) {
    stamp.hidden = !done;
    if (done) stamp.textContent = "Done on " + new Date(done).toLocaleDateString();
  }
  const cb = document.querySelector("[data-clear]");
  if (cb) cb.hidden = !started(s, c);
  showNote(s, c.id);
});

/* any ticked step, a finished lesson or a place in it past the intro */
const started = (s, c) =>
  !!s.done[c.id] || +s.active[c.id] > 0 || Object.keys(s.steps).some((k) => k.startsWith(c.id + ":"));

/* Clear progress: unticks the lesson's steps, un-finishes it and starts it again from the intro. Notes stay. */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-clear]"),
    c = b && curLesson();
  if (!c) return;
  if (
    !confirm(
      "Clear your progress on this lesson? Your ticked steps go and it starts again from the intro. Your notes stay."
    )
  )
    return;
  const s = ist(c.k);
  Object.keys(s.steps).forEach((k) => {
    if (k.startsWith(c.id + ":")) delete s.steps[k];
  });
  delete s.done[c.id];
  delete s.active[c.id];
  persist();
  if (c.act) navigate(b.dataset.path);
  else refresh();
});

document.addEventListener(
  "click",
  (e) => {
    const fin = e.target.closest("[data-finish]"),
      c = fin && curLesson();
    if (!c) return;
    const s = ist(c.k);
    if (s.done[c.id]) {
      delete s.done[c.id];
      persist();
      refresh();
      return;
    }
    s.done[c.id] = Date.now();
    c.ids.forEach((x) => (s.steps[c.id + ":" + x] = true));
    persist();
    navigate(c.donePath);
  },
  true
);

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-note-edit],[data-note-save],[data-note-cancel]");
  if (!b) return;
  const box = b.closest("[data-notebox]"),
    id = box.dataset.notebox,
    c = curLesson();
  if (!c) return;
  const s = ist(c.k),
    ta = box.querySelector("textarea");
  if (b.hasAttribute("data-note-edit")) {
    ta.value = s.notes[id] || "";
    noteMode(box, true);
    ta.focus();
    return;
  }
  if (b.hasAttribute("data-note-save")) {
    const v = ta.value.trim();
    if (v) s.notes[id] = v;
    else delete s.notes[id];
    persist();
  }
  noteMode(box, false);
  showNote(s, id, b.hasAttribute("data-note-save"));
  box.querySelector("[data-note-edit]").focus();
});
document.addEventListener("keydown", (e) => {
  const ta = e.target.closest && e.target.closest("[data-notebox] textarea");
  if (!ta) return;
  const box = ta.closest("[data-notebox]");
  if (e.key === "Escape") {
    e.preventDefault();
    box.querySelector("[data-note-cancel]").click();
  } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    box.querySelector("[data-note-save]").click();
  }
});
