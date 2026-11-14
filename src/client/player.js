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
const $ = (s) => document.querySelector(s);

/* the player fills the window below the header */
function fitPlayer() {
  const el = player();
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  el.style.setProperty("--ph", `calc(100dvh - ${Math.round(top) + 20}px)`);
}
window.addEventListener("resize", fitPlayer);

onProgress(() => {
  const c = curLesson();
  if (!c) return;
  const s = ist(c.k);
  /* the done screen isn't a step: you stay where you finished */
  if (s.lesson !== c.id || (!c.done && (s.active[c.id] ?? 0) !== c.act)) {
    s.lesson = c.id;
    if (!c.done) s.active[c.id] = c.act;
    persist();
  }
  document
    .querySelectorAll(".dots [data-step]")
    .forEach((a) => a.classList.toggle("done", !!s.steps[stepKey(c, +a.dataset.step)]));
  const mx = $("[data-max]");
  if (mx) {
    const l = state.focus ? "Exit full window (Esc)" : "Maximize";
    mx.setAttribute("aria-label", l);
    mx.title = l;
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
function clampStepW(w) {
  const b = $("#pbody");
  const max = b ? Math.max(320, b.clientWidth * 0.7) : 900;
  return Math.round(Math.min(Math.max(w, 260), max));
}
function setStepW(w, save) {
  state.stepW = clampStepW(w);
  document.documentElement.style.setProperty("--sw", state.stepW + "px");
  if (save) persist();
}
document.addEventListener("pointerdown", (e) => {
  const g = e.target.closest("#gutter");
  if (!g) return;
  e.preventDefault();
  g.setPointerCapture(e.pointerId);
  g.classList.add("drag");
  document.body.classList.add("resizing");
  const right = $("#pbody").getBoundingClientRect().right;
  const move = (ev) => setStepW(right - ev.clientX, false);
  const up = () => {
    g.removeEventListener("pointermove", move);
    g.classList.remove("drag");
    document.body.classList.remove("resizing");
    persist();
  };
  g.addEventListener("pointermove", move);
  g.addEventListener("pointerup", up, { once: true });
  g.addEventListener("pointercancel", up, { once: true });
});
document.addEventListener("dblclick", (e) => {
  if (e.target.closest("#gutter")) {
    delete state.stepW;
    document.documentElement.style.removeProperty("--sw");
    persist();
  }
});

/* lesson picker: close when clicking elsewhere or pressing Esc */
document.addEventListener(
  "click",
  (e) => {
    document.querySelectorAll("details.picker[open]").forEach((d) => {
      if (!d.contains(e.target)) d.open = false;
    });
  },
  true
);
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Escape") {
      const d = $("details.picker[open]");
      if (d) {
        d.open = false;
        e.stopImmediatePropagation();
      }
    }
  },
  true
);

document.addEventListener(
  "click",
  (e) => {
    if (e.target.closest("[data-closectl]")) {
      $("#ctlinfo").hidden = true;
      return;
    }
    if (e.target.closest("[data-max]")) {
      setFocus(!state.focus);
      return;
    }
    /* a control on the panel: what it does, in a box over the step */
    const ctl = e.target.closest("svg .c");
    if (ctl) {
      if (ctl.closest("[data-panel-guide]")) return;
      const I = PANELS[document.body.dataset.inst],
        c = I && I.controls[ctl.dataset.id],
        box = $("#ctlinfo");
      if (c && box) {
        box.hidden = false;
        box.innerHTML = `<div class="h">${esc(c.kind)} <button class="x" data-closectl aria-label="Close">×</button></div><b>${esc(c.name)}</b>${c.sub ? ` <span class="sec">(${esc(c.sub)})</span>` : ""}. ${keyify(I, c.desc, "")}`;
      }
      return;
    }
    /* Next ticks the step you're on; on the last step it also closes the lesson and opens the done screen.
       Next lesson there fills, ticks and plays, then opens the next lesson */
    const nav = e.target.closest("[data-nav]");
    const c = nav && nav.dataset.nav === "1" && curLesson();
    if (!c) return;
    const s = ist(c.k);
    if (nav.hasAttribute("data-end")) {
      e.preventDefault();
      clickFinish(nav, () => finished(c), nextLessonHref(s, c, nav));
      return;
    }
    tickHere(s, c);
    /* the lesson counts as done even if you skipped a step (the done screen shows how many you ticked) */
    if (c.act === c.n + (c.challenge ? 1 : 0) - 1) s.done[c.id] ||= Date.now();
    persist(); /* the link opens the next step */
  },
  true
); /* capture: runs before the router follows a link, so Next lesson can pick where to go */

/* ticks the step you're on; the optional challenge is never a rep */
function tickHere(s, c) {
  if (c.act < c.n) {
    s.steps[stepKey(c, c.act)] = true;
    markAllDone(s, c);
  }
}
/* Next lesson on the done screen: done, if you came straight to it */
function finished(c) {
  const s = ist(c.k);
  s.done[c.id] ||= Date.now();
  persist();
  refresh();
}
/* holding Next lesson fills it slowly; a long press doesn't open the link menu */
document.addEventListener("pointerdown", (e) => {
  const b = e.button === 0 && e.target.closest("[data-end]"),
    c = b && curLesson();
  if (c) pressFinish(b, () => finished(c), nextLessonHref(ist(c.k), c, b));
});
/* nor drags the link away, which would end the press */
document.addEventListener("contextmenu", (e) => {
  if (e.target.closest("[data-end]")) e.preventDefault();
});
document.addEventListener("dragstart", (e) => {
  if (e.target.closest && e.target.closest("[data-end]")) e.preventDefault();
});

document.addEventListener("keydown", (e) => {
  if (e.target.id === "gutter" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    e.preventDefault();
    const cur = $(".pstep").getBoundingClientRect().width;
    setStepW(cur + (e.key === "ArrowLeft" ? 40 : -40), true);
    return;
  }
  if (player() && !e.target.closest("textarea,input,select") && !e.metaKey && !e.ctrlKey && !e.altKey) {
    if (e.key === "Escape" && state.focus) {
      setFocus(false);
      return;
    }
    const nav = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (nav) {
      const b = $(`[data-nav="${nav}"]`);
      if (b) {
        e.preventDefault();
        b.click();
      }
    }
  }
});
