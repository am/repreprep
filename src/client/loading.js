/* The page loading sign (PageLoading.astro). The ClientRouter fetches the next page itself, so the browser shows
   nothing while it waits. If the page isn't there after a moment, <html> gets .pl-on: a coral line creeps across the
   top, the link or button you tapped (.pl-from) pulses and the step dot you're heading to (.pl-to) blinks. When the
   new page is in, .pl-done runs the line to the end and fades it. Fast loads show nothing. */
const WAIT = 150; /* ms before the sign shows */
const root = document.documentElement;
let timer = 0,
  shown = false,
  tapped = null,
  tappedAt = 0;

/* remember what was tapped: the router may open the page a little later (Next lesson plays first). Only links the
   router opens itself count; a link to another site, a new tab, a download or a full reload is left to the browser */
function routed(a, e) {
  return (
    a &&
    e.button === 0 &&
    !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) &&
    (!a.target || a.target === "_self") &&
    !a.hasAttribute("download") &&
    !a.hasAttribute("data-astro-reload") &&
    a.origin === location.origin
  );
}
document.addEventListener(
  "click",
  (e) => {
    const a = e.target.closest?.("a[href]");
    tapped = routed(a, e) ? a : null;
    tappedAt = Date.now();
  },
  true
);

function say(text) {
  const s = document.querySelector(".pl-say");
  if (s) s.textContent = text;
}

function clear() {
  document.querySelectorAll(".pl-from, .pl-to").forEach((el) => el.classList.remove("pl-from", "pl-to"));
}

document.addEventListener("astro:before-preparation", (e) => {
  clearTimeout(timer);
  const from = tapped && Date.now() - tappedAt < 3000 && tapped.isConnected ? tapped : null;
  const to = e.to?.pathname;
  timer = setTimeout(() => {
    clear();
    root.classList.remove("pl-done");
    root.classList.add("pl-on");
    shown = true;
    from?.classList.add("pl-from");
    if (to)
      document.querySelectorAll(".dots a[href]").forEach((a) => {
        if (new URL(a.href, location.href).pathname === to) a.classList.add("pl-to");
      });
    say("Loading the page");
  }, WAIT);
});

/* the sign off at once, as on a fresh page */
function reset() {
  clearTimeout(timer);
  shown = false;
  clear();
  root.classList.remove("pl-on", "pl-done");
  say("");
}

/* a failed fetch hands the page to the browser (a full load), so no swap follows; if the browser later brings this
   page back from its back/forward cache, it would come back mid-load */
window.addEventListener("pageshow", (e) => {
  if (e.persisted) reset();
});

document.addEventListener("astro:after-swap", () => {
  clearTimeout(timer);
  tapped = null;
  /* the swap resets <html>'s classes, so keep track here */
  if (!shown) return;
  shown = false;
  root.classList.remove("pl-on");
  root.classList.add("pl-done");
  say("");
  setTimeout(() => root.classList.remove("pl-done"), 450);
});
