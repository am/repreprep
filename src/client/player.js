/* Marks where you are, saves ticks as you move on, and runs the player's controls: the step panel's
   width, the full-window switch, the lesson picker, arrow keys, and clicking a control on the panel. */
import { onProgress, persist, refresh, ist, state } from "./progress.js";
import { player, curLesson, markAllDone, nextLessonHref, stepKey } from "./lesson.js";
import { pressFinish, clickFinish } from "./finish.js";
import { CYCLES_CONTROLS } from "../course/model-cycles/controls.js";
import { iconSvg } from "../course/model-cycles/icons.js";
import { keyify } from "../course/shared/text.js";
import { esc } from "../course/shared/html.js";

const PANELS = { cycles: { controls: CYCLES_CONTROLS, icon: iconSvg } };
const find = (selector) => document.querySelector(selector);

/* the player fills the window below the header */
function fitPlayer() {
  const element = player();
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY;
  element.style.setProperty("--ph", `calc(100dvh - ${Math.round(top) + 20}px)`);
}
window.addEventListener("resize", fitPlayer);

onProgress(() => {
  const lesson = curLesson();
  if (!lesson) return;
  const saved = ist(lesson.k);
  /* the done screen isn't a step: you stay where you finished */
  if (saved.lesson !== lesson.id || (!lesson.done && (saved.active[lesson.id] ?? 0) !== lesson.act)) {
    saved.lesson = lesson.id;
    if (!lesson.done) saved.active[lesson.id] = lesson.act;
    persist();
  }
  document
    .querySelectorAll(".dots [data-step]")
    .forEach((dot) => dot.classList.toggle("done", !!saved.steps[stepKey(lesson, +dot.dataset.step)]));
  const maximize = find("[data-max]");
  if (maximize) {
    const label = state.focus ? "Exit full window (Esc)" : "Maximize";
    maximize.setAttribute("aria-label", label);
    maximize.title = label;
  }
  document.documentElement.classList.toggle("focus", !!state.focus);
  if (state.stepW) document.documentElement.style.setProperty("--sw", state.stepW + "px");
  fitPlayer();
});
function setFocus(on) {
  state.focus = on;
  persist();
  refresh();
}

/* drag the gutter to resize the step column; the width is saved with your progress */
function clampStepWidth(width) {
  const body = find("#pbody");
  const max = body ? Math.max(320, body.clientWidth * 0.7) : 900;
  return Math.round(Math.min(Math.max(width, 260), max));
}
function setStepWidth(width, save) {
  state.stepW = clampStepWidth(width);
  document.documentElement.style.setProperty("--sw", state.stepW + "px");
  if (save) persist();
}
document.addEventListener("pointerdown", (event) => {
  const gutter = event.target.closest("#gutter");
  if (!gutter) return;
  event.preventDefault();
  gutter.setPointerCapture(event.pointerId);
  gutter.classList.add("drag");
  document.body.classList.add("resizing");
  const right = find("#pbody").getBoundingClientRect().right;
  const move = (moveEvent) => setStepWidth(right - moveEvent.clientX, false);
  const up = () => {
    gutter.removeEventListener("pointermove", move);
    gutter.classList.remove("drag");
    document.body.classList.remove("resizing");
    persist();
  };
  gutter.addEventListener("pointermove", move);
  gutter.addEventListener("pointerup", up, { once: true });
  gutter.addEventListener("pointercancel", up, { once: true });
});
document.addEventListener("dblclick", (event) => {
  if (event.target.closest("#gutter")) {
    delete state.stepW;
    document.documentElement.style.removeProperty("--sw");
    persist();
  }
});

/* lesson picker: close when clicking elsewhere or pressing Esc */
document.addEventListener(
  "click",
  (event) => {
    document.querySelectorAll("details.picker[open]").forEach((picker) => {
      if (!picker.contains(event.target)) picker.open = false;
    });
  },
  true
);
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      const picker = find("details.picker[open]");
      if (picker) {
        picker.open = false;
        event.stopImmediatePropagation();
      }
    }
  },
  true
);

document.addEventListener(
  "click",
  (event) => {
    if (event.target.closest("[data-closectl]")) {
      find("#ctlinfo").hidden = true;
      return;
    }
    if (event.target.closest("[data-max]")) {
      setFocus(!state.focus);
      return;
    }
    /* a control on the panel: what it does, in a box over the step */
    const clicked = event.target.closest("svg .c");
    if (clicked) {
      if (clicked.closest("[data-panel-guide]")) return;
      const panel = PANELS[document.body.dataset.inst],
        control = panel && panel.controls[clicked.dataset.id],
        box = find("#ctlinfo");
      if (control && box) {
        box.hidden = false;
        box.innerHTML = `<div class="h">${esc(control.kind)} <button class="x" data-closectl aria-label="Close">×</button></div><b>${esc(control.name)}</b>${control.sub ? ` <span class="sec">(${esc(control.sub)})</span>` : ""}. ${keyify(panel, control.desc, "")}`;
      }
      return;
    }
    /* Next ticks the step you're on; on the last step it also closes the lesson and opens the done screen.
       Next lesson there fills, ticks and plays, then opens the next lesson */
    const nav = event.target.closest("[data-nav]");
    const lesson = nav && nav.dataset.nav === "1" && curLesson();
    if (!lesson) return;
    const saved = ist(lesson.k);
    if (nav.hasAttribute("data-end")) {
      event.preventDefault();
      clickFinish(nav, () => finished(lesson), nextLessonHref(saved, lesson, nav));
      return;
    }
    tickHere(saved, lesson);
    /* the lesson counts as done even if you skipped a step (the done screen shows how many you ticked) */
    if (lesson.act === lesson.n + (lesson.challenge ? 1 : 0) - 1) saved.done[lesson.id] ||= Date.now();
    persist(); /* the link opens the next step */
  },
  true
); /* capture: runs before the router follows a link, so Next lesson can pick where to go */

/* ticks the step you're on; the optional challenge is never a rep */
function tickHere(saved, lesson) {
  if (lesson.act < lesson.n) {
    saved.steps[stepKey(lesson, lesson.act)] = true;
    markAllDone(saved, lesson);
  }
}
/* Next lesson on the done screen: done, if you came straight to it */
function finished(lesson) {
  const saved = ist(lesson.k);
  saved.done[lesson.id] ||= Date.now();
  persist();
  refresh();
}
/* holding Next lesson fills it slowly; a long press doesn't open the link menu */
document.addEventListener("pointerdown", (event) => {
  const button = event.button === 0 && event.target.closest("[data-end]"),
    lesson = button && curLesson();
  if (lesson) pressFinish(button, () => finished(lesson), nextLessonHref(ist(lesson.k), lesson, button));
});
/* nor drags the link away, which would end the press */
document.addEventListener("contextmenu", (event) => {
  if (event.target.closest("[data-end]")) event.preventDefault();
});
document.addEventListener("dragstart", (event) => {
  if (event.target.closest && event.target.closest("[data-end]")) event.preventDefault();
});

document.addEventListener("keydown", (event) => {
  if (event.target.id === "gutter" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
    event.preventDefault();
    const width = find(".pstep").getBoundingClientRect().width;
    setStepWidth(width + (event.key === "ArrowLeft" ? 40 : -40), true);
    return;
  }
  const typing = event.target.closest("textarea,input,select");
  if (player() && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
    if (event.key === "Escape" && state.focus) {
      setFocus(false);
      return;
    }
    const nav = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (nav) {
      const button = find(`[data-nav="${nav}"]`);
      if (button) {
        event.preventDefault();
        button.click();
      }
    }
  }
});
