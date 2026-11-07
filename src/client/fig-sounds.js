/* tap (or Enter/Space on) a playable part of a drawing to hear it; tap it again, or another, to stop it */
import { FIG_SOUNDS } from "../course/shared/fig-sounds.js";
import { audio, audioOut } from "./audio.js";

let cur = null;
export function figSoundStop() {
  if (!cur) return;
  const { el, bus, timer } = cur;
  cur = null;
  clearTimeout(timer);
  const AC = audio();
  if (AC) {
    bus.gain.setTargetAtTime(0, AC.currentTime, 0.02);
    setTimeout(() => bus.disconnect(), 200);
  }
  el.classList.remove("playing");
  el.setAttribute("aria-pressed", "false");
}
function play(el) {
  const same = cur && cur.el === el;
  figSoundStop();
  if (same) return;
  const AC = audio();
  const recipe = FIG_SOUNDS[el.dataset.snd];
  if (!AC || !recipe) return;
  const bus = AC.createGain();
  bus.connect(audioOut());
  const dur = recipe(AC, bus, AC.currentTime + 0.03);
  el.classList.add("playing");
  el.setAttribute("aria-pressed", "true");
  const me = { el, bus };
  me.timer = setTimeout(() => cur === me && figSoundStop(), (dur + 0.1) * 1000);
  cur = me;
}
document.addEventListener("click", (e) => {
  const el = e.target.closest && e.target.closest(".fig [data-snd]");
  if (el) play(el);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = e.target.closest && e.target.closest(".fig [data-snd]");
  if (!el) return;
  e.preventDefault();
  e.stopPropagation();
  play(el);
});
