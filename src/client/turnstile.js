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

/* The check stays invisible and only shows itself, in place, when Cloudflare isn't sure the visitor is a person
   ("interaction-only"); most people never see it. */
export function drawTurnstile(box) {
  if (!box || box.childElementCount || box.dataset.state) return;
  if (!box.dataset.turnstile) return void (box.dataset.state = "off");
  box.dataset.state = "loading";
  const theme = document.documentElement.dataset.theme || "auto";
  load()
    .then(
      (t) =>
        (box.dataset.widget = t.render(box, {
          sitekey: box.dataset.turnstile,
          theme,
          size: "flexible",
          appearance: "interaction-only",
        }))
    )
    /* without the check (blocked, offline), forms are sent without a token: the server decides */
    .catch(() => (box.dataset.state = "off"));
}
/* the token, once the check has passed: waits up to `ms` for it (it's still being made, or the visitor is being
   asked to tick the box), then gives what there is. No wait when the check isn't there at all. */
export async function turnstileToken(box, ms = 8000) {
  const field = () => box?.querySelector('[name="cf-turnstile-response"]');
  for (let waited = 0; !field()?.value && box?.dataset.state === "loading" && waited < ms; waited += 200)
    await new Promise((r) => setTimeout(r, 200));
  return field()?.value || "";
}
/* a used token can't be sent twice: a fresh check for the next try */
export const resetTurnstile = (box) => box?.dataset.widget && window.turnstile?.reset(box.dataset.widget);
