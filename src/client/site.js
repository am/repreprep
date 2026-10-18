/* The parts of every page: the header's step count, account link and knob menu, the theme switch, and the
   footer's note on where your progress is saved. Loaded by Base.astro at the end of the page. */
import { onProgress, here, sizes, account, setSync, syncMsg } from "./progress.js";
import { SIGN_IN } from "../lib/features.js";

onProgress(() => {
  setSync(account.loaded ? syncMsg() : "");
  const a = document.getElementById("acct");
  if (a && SIGN_IN) a.textContent = account.me ? account.me.name || account.me.email || "Your account" : "Sign in";
  const s = here(), mt = document.getElementById("meterTxt"); if (!s || !mt) return;
  let t = 0, d = 0;
  Object.entries(sizes()).forEach(([id, n]) => { t += n; for (let i = 0; i < n; i++) if (s.steps[id + ":" + i]) d++; });
  mt.textContent = `${d} of ${t} reps`;
});

/* the knob menu on phones: the knob toggles it, a click outside it or on one of its links closes it, and so does Esc */
function setOpen(top, open) { top.classList.toggle("open", open); top.querySelector("[data-menu]").setAttribute("aria-expanded", String(open)); }
document.addEventListener("click", (e) => {
  const top = document.querySelector(".top:not(.bare)"), knob = e.target.closest("[data-menu]");
  if (top && (knob || (top.classList.contains("open") && (!e.target.closest(".hmenu") || e.target.closest(".hmenu a"))))) setOpen(top, knob ? !top.classList.contains("open") : false);
});
document.addEventListener("keydown", (e) => {
  const top = document.querySelector(".top.open");
  if (e.key === "Escape" && top) { setOpen(top, false); top.querySelector("[data-menu]").focus(); }
});

/* theme switch: save the choice, apply it (Base.astro's head script), and tell the logo so it can pick colors for the new background */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-theme-set]"); if (!b) return;
  try { localStorage.setItem("rrr-theme", b.getAttribute("data-theme-set")); } catch (err) {}
  window.__rrrTheme();
  window.dispatchEvent(new Event("rrr-theme"));
});
