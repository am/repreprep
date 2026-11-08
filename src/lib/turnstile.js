import { TURNSTILE_SECRET_KEY } from "astro:env/server";

/* Cloudflare Turnstile on the contact form. The widget's site key is public (TURNSTILE_SITE_KEY);
   the secret stays on the Worker. Without a secret (on your computer, in tests, or before it's set)
   there is no check, so the form keeps working. */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/* true when Cloudflare says the token came from a person on this site */
export async function passedTurnstile(token, request) {
  if (!TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;
  const body = new FormData();
  body.append("secret", TURNSTILE_SECRET_KEY);
  body.append("response", String(token));
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) body.append("remoteip", ip);
  try {
    const r = await fetch(VERIFY_URL, { method: "POST", body });
    const j = await r.json();
    if (!j.success) console.warn("turnstile rejected", j["error-codes"]);
    return !!j.success;
  } catch (e) {
    console.error("turnstile check failed", e);
    return false;
  }
}
