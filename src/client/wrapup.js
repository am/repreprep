/* Complete (it opens the done screen, and undoing it), Clear progress, and the notes box: read mode by default; Edit opens it, and only Save keeps what you typed */
import { onProgress, persist, refresh, ist } from "./progress.js";
import { navigate } from "astro:transitions/client";
import { curLesson } from "./lesson.js";

function showNote(saved, id, justSaved) {
  const box = document.querySelector(`[data-notebox="${id}"]`);
  if (!box) return;
  const note = saved.notes[id] || "",
    text = box.querySelector(".nb-text");
  text.textContent = note;
  text.hidden = !note;
  box.querySelector(".nb-empty").hidden = !!note;
  const edit = box.querySelector("[data-note-edit]");
  edit.textContent = note ? "Edit" : "Add a note";
  if (!box.classList.contains("editing")) {
    box.querySelector(".nb-view").hidden = false;
    box.querySelector(".nb-edit").hidden = true;
    edit.hidden = false;
  }
  if (justSaved !== undefined) box.querySelector(".nb-stamp").hidden = !justSaved;
}
function noteMode(box, edit) {
  box.classList.toggle("editing", edit);
  box.querySelector(".nb-view").hidden = edit;
  box.querySelector(".nb-edit").hidden = !edit;
  box.querySelector("[data-note-edit]").hidden = edit;
  box.querySelector(".nb-stamp").hidden = true;
}

onProgress(() => {
  const lesson = curLesson();
  if (!lesson) return;
  const saved = ist(lesson.k),
    done = saved.done[lesson.id];
  const finish = document.querySelector("[data-finish]"),
    stamp = document.querySelector(".finish .stamp");
  if (finish) {
    finish.textContent = done ? "Completed" : finish.dataset.label;
    finish.classList.toggle("primary", !done);
  }
  if (stamp) {
    stamp.hidden = !done;
    if (done) stamp.textContent = "Done on " + new Date(done).toLocaleDateString();
  }
  const clear = document.querySelector("[data-clear]");
  if (clear) clear.hidden = !started(saved, lesson);
  showNote(saved, lesson.id);
});

/* any ticked step, a finished lesson or a place in it past the intro */
const started = (saved, lesson) =>
  !!saved.done[lesson.id] ||
  +saved.active[lesson.id] > 0 ||
  Object.keys(saved.steps).some((key) => key.startsWith(lesson.id + ":"));

/* Clear progress: unticks the lesson's steps, un-finishes it and starts it again from the intro. Notes stay. */
document.addEventListener("click", (event) => {
  const clear = event.target.closest("[data-clear]"),
    lesson = clear && curLesson();
  if (!lesson) return;
  if (
    !confirm(
      "Clear your progress on this lesson? Your ticked steps go and it starts again from the intro. Your notes stay."
    )
  )
    return;
  const saved = ist(lesson.k);
  Object.keys(saved.steps).forEach((key) => {
    if (key.startsWith(lesson.id + ":")) delete saved.steps[key];
  });
  delete saved.done[lesson.id];
  delete saved.active[lesson.id];
  persist();
  if (lesson.act) navigate(clear.dataset.path);
  else refresh();
});

document.addEventListener(
  "click",
  (event) => {
    const finish = event.target.closest("[data-finish]"),
      lesson = finish && curLesson();
    if (!lesson) return;
    const saved = ist(lesson.k);
    if (saved.done[lesson.id]) {
      delete saved.done[lesson.id];
      persist();
      refresh();
      return;
    }
    saved.done[lesson.id] = Date.now();
    lesson.ids.forEach((stepId) => (saved.steps[lesson.id + ":" + stepId] = true));
    persist();
    navigate(lesson.donePath);
  },
  true
);

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-note-edit],[data-note-save],[data-note-cancel]");
  if (!button) return;
  const box = button.closest("[data-notebox]"),
    id = box.dataset.notebox,
    lesson = curLesson();
  if (!lesson) return;
  const saved = ist(lesson.k),
    textarea = box.querySelector("textarea");
  if (button.hasAttribute("data-note-edit")) {
    textarea.value = saved.notes[id] || "";
    noteMode(box, true);
    textarea.focus();
    return;
  }
  if (button.hasAttribute("data-note-save")) {
    const note = textarea.value.trim();
    if (note) saved.notes[id] = note;
    else delete saved.notes[id];
    persist();
  }
  noteMode(box, false);
  showNote(saved, id, button.hasAttribute("data-note-save"));
  box.querySelector("[data-note-edit]").focus();
});
document.addEventListener("keydown", (event) => {
  const textarea = event.target.closest && event.target.closest("[data-notebox] textarea");
  if (!textarea) return;
  const box = textarea.closest("[data-notebox]");
  if (event.key === "Escape") {
    event.preventDefault();
    box.querySelector("[data-note-cancel]").click();
  } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    box.querySelector("[data-note-save]").click();
  }
});
