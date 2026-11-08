/* Cloudflare Turnstile, the check that a form is sent by a person: its script loads once, then the check is drawn
   into a box with data-turnstile="<site key>". The token it gives lands in the form as cf-turnstile-response. */
let turnstile = null;
const load = () =>
  (turnstile ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve(window.turnstile);
    s.onerror = () => {
      turnstile = null;
      reject(new Error("Turnstile didn't load"));
    };
    document.head.append(s);
  }));

export function drawTurnstile(box) {
  if (!box || box.childElementCount) return;
  const theme = document.documentElement.dataset.theme || "auto";
  load()
    .then((t) => (box.dataset.widget = t.render(box, { sitekey: box.dataset.turnstile, theme, size: "flexible" })))
    .catch(() => {});
}
/* a used token can't be sent twice: a fresh check for the next try */
export const resetTurnstile = (box) => box?.dataset.widget && window.turnstile?.reset(box.dataset.widget);
