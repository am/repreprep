/* download, load and delete your progress; with sign-in on, who you are and your account */
import { onProgress, flush, update, combine, state, account, LS_KEY } from "./progress.js";
import { drawTurnstile, resetTurnstile, turnstileToken } from "./turnstile.js";
import { strengthMeter } from "./strength.js";
import { esc } from "../course/shared/html.js";
import { SIGN_IN } from "astro:env/client";

const PROVIDER_ICON = {
  dev: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="5.5" r="2.75" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2.75 14a5.25 5.25 0 0 1 10.5 0z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  google:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zm-5.6-8c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1a10 10 0 0 0 0 9.2l3.3-2.6zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z"/></svg>',
};
onProgress(() => {
  const root = document.getElementById("account");
  if (!SIGN_IN || !root || !account.loaded) return;
  const q = new URLSearchParams(location.search),
    me = account.me,
    view = root.dataset.view;
  /* the old address for signing up, and the Sign up page once you're logged in */
  if (view === "login" && q.get("mode") === "signup" && !me) return location.replace("/account/signup");
  if (view === "signup" && me) return location.replace("/account");
  const err = root.querySelector("[data-acct-error]");
  if (err) err.hidden = q.get("error") !== "signin";
  root.querySelectorAll("[data-signed-in]").forEach((el) => (el.hidden = !me));
  root.querySelectorAll("[data-signed-out]").forEach((el) => (el.hidden = !!me));
  root.querySelectorAll("[data-show]").forEach((el) => (el.hidden = (el.dataset.show === "in") !== !!me));
  const sec = root.querySelector("[data-signed-out]");
  if (me) document.title = document.title.replace(/^(Log in|Your data)/, "Your account");
  if (me) {
    const who = root.querySelector("[data-who]");
    if (who) who.textContent = [me.name, me.email && `(${me.email})`].filter(Boolean).join(" ");
  } else if (sec) {
    const next = q.get("next") || "/account";
    const ids = account.providers.map((p) => p.id);
    const link = (p) =>
      p.id === "dev"
        ? `<a class="btn" href="/auth/dev?next=${encodeURIComponent(next)}" data-astro-reload>${PROVIDER_ICON.dev}Continue with a local test account</a>`
        : `<a class="btn" href="/auth/${p.id}?next=${encodeURIComponent(next)}" data-astro-reload>${PROVIDER_ICON[p.id] || ""}Continue with ${esc(p.name)}</a>`;
    /* the other ways in, one button each: a new provider is one more entry in providers() */
    const items = account.providers.filter((p) => !["email", "password"].includes(p.id)).map(link);
    const box = sec.querySelector("[data-providers]"),
      html = items.join("");
    if (box.dataset.html !== html) box.innerHTML = box.dataset.html = html;
    const form = sec.querySelector("[data-email-signin]");
    form.hidden = !ids.includes("email");
    sec.querySelector("[data-email-way]").hidden = form.hidden;
    if (!form.hidden) drawTurnstile(form.querySelector("[data-turnstile]"));
    if (view === "signup")
      strengthMeter({
        input: form.password,
        meter: form.querySelector("[data-strength]"),
        button: form.querySelector('[data-act="signup"]'),
      });
    root.querySelector("[data-no-providers]").hidden = account.providers.length > 0;
  }
});

/* a password or an email link */
const signedOut = () => document.querySelector("[data-signed-out]");
function clearMsg(sec) {
  const m = sec.querySelector("[data-email-msg]");
  m.textContent = "";
  m.className = "msg";
  delete sec.dataset.sent;
}
function setMethod(method) {
  const sec = signedOut(),
    form = sec.querySelector("[data-email-signin]");
  sec.dataset.method = method;
  clearMsg(sec);
  (method === "password" && form.email.value ? form.password : form.email).focus();
}
document.addEventListener("click", (e) => {
  const m = e.target.closest("[data-method-to]"),
    eye = e.target.closest("[data-eye]");
  if (m) setMethod(m.dataset.methodTo);
  else if (eye) {
    const input = eye.previousElementSibling,
      show = input.type === "password";
    input.type = show ? "text" : "password";
    eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
    eye.classList.toggle("on", show);
  }
});

/* the email form: a password, or a one-use sign-in link. Each request goes to Better Auth with the Turnstile
   token; what comes back is said in plain words under the form. */
const API = {
  link: "/api/auth/sign-in/magic-link",
  signin: "/api/auth/sign-in/email",
  signup: "/api/auth/sign-up/email",
  forgot: "/api/auth/request-password-reset",
};
const ERRORS = {
  PASSWORD_COMPROMISED: "That password has turned up in a data breach, so it's easy to guess. Please choose another.",
  PASSWORD_TOO_SHORT: "Please use a password of at least 12 characters.",
  PASSWORD_TOO_LONG: "Please use a password of at most 128 characters.",
  INVALID_EMAIL_OR_PASSWORD: "That email and password don't match. Try again, or use “Forgot your password?”.",
  INVALID_EMAIL: "That doesn't look like an email address.",
};
async function sendEmailForm(form, act) {
  const msg = form.querySelector("[data-email-msg]");
  const email = form.email.value.trim();
  const password = form.password.value;
  /* only a path on this site, never another address */
  const asked = new URLSearchParams(location.search).get("next") || "";
  const next = /^\/(?![/\\])/.test(asked) && !asked.includes("\\") ? asked : "/account";
  const body = {
    link: { email, callbackURL: next, errorCallbackURL: "/account?error=signin" },
    signin: { email, password, callbackURL: next },
    signup: { email, password, name: email.split("@")[0], callbackURL: next },
    forgot: { email, redirectTo: "/account/reset" },
  }[act];
  form.querySelectorAll("button").forEach((b) => (b.disabled = true));
  msg.className = "msg";
  msg.textContent = "One moment…";
  const token = await turnstileToken(form.querySelector("[data-turnstile]"));
  const r = await fetch(API[act], {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-captcha-response": token },
    body: JSON.stringify(body),
  }).catch(() => null);
  const j = await r?.json().catch(() => ({}));
  form.querySelectorAll("button").forEach((b) => (b.disabled = false));
  resetTurnstile(form.querySelector("[data-turnstile]"));
  const say = (text, bad) => {
    msg.className = bad ? "msg bad" : "msg";
    msg.textContent = text;
  };
  if (r?.ok) {
    if (act === "signin") return (location.href = next);
    form.password.value = "";
    signedOut().dataset.sent = "";
    return say(
      {
        link: `Check your inbox: a login link is on its way to ${email}. It works once, for 10 minutes.`,
        signup: `Almost there: confirm your address with the link we sent to ${email}, and you're logged in.`,
        forgot: `If there's an account for ${email}, a link to choose a new password is on its way. It works for an hour.`,
      }[act]
    );
  }
  if (r?.status === 429) return say("Too many tries. Please wait a minute and try again.", true);
  if (j?.code === "EMAIL_NOT_VERIFIED")
    return say(`Please confirm your address first: we've sent a new link to ${email}.`, true);
  if (ERRORS[j?.code]) return say(ERRORS[j.code], true);
  if (r?.status === 400 || r?.status === 403)
    return say("That didn't go through. Check the address and the box above, then try again.", true);
  say("Something went wrong. Please try again.", true);
}
document.addEventListener("submit", (e) => {
  const f = e.target.closest("[data-email-signin]");
  if (!f) return;
  e.preventDefault();
  const sec = signedOut();
  /* Enter in a field picks the button shown for this view */
  const shown = e.submitter?.offsetParent ? e.submitter : null;
  const act = shown?.dataset.act || (sec.dataset.method === "password" ? sec.dataset.tab : "link");
  if ((act === "signin" && !f.password.value) || (act === "signup" && f.password.value.length < 12)) {
    f.password.focus();
    return f.password.reportValidity?.() || undefined;
  }
  sendEmailForm(f, act);
});

async function signOut() {
  await flush();
  const { actions } = await import("astro:actions");
  await actions.account.signOut().catch(() => {});
  /* a shared computer shouldn't keep your progress after you sign out */
  try {
    localStorage.removeItem(LS_KEY);
  } catch (e) {}
  location.href = "/account";
}
async function deleteAccount() {
  if (!confirm("Delete your account and the progress saved with it? This can't be undone.")) return;
  const { actions } = await import("astro:actions");
  const { error } = await actions.account.delete().catch((e) => ({ error: e }));
  if (!error) {
    account.me = null;
    location.href = "/account";
  } else alert("Couldn't delete the account. Please try again.");
}
function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "repreprep-progress.json",
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
/* clears ticks, finished lessons and notes; layout choices stay */
function clearProgress() {
  if (
    !confirm(
      "Delete your progress? Your ticks, finished lessons and notes will be removed, here and from your account if you're logged in. This can't be undone, so download a copy first if you might want them back."
    )
  )
    return;
  state.inst = {};
  update();
  const msg = document.querySelector("[data-clear-msg]");
  if (msg) msg.textContent = "Progress deleted.";
}
async function importProgress(file) {
  const msg = document.querySelector("[data-import-msg]");
  try {
    const s = JSON.parse(await file.text());
    if (!s || typeof s.inst !== "object") throw new Error("not a progress file");
    combine(s);
    update();
    const n = Object.values(state.inst).reduce((a, v) => a + Object.keys(v.steps || {}).length, 0);
    if (msg) msg.textContent = `Loaded and combined. ${n} ticked steps.`;
  } catch (e) {
    if (msg) msg.textContent = "That file isn't a Rep Rep Rep progress file.";
  }
}
document.addEventListener("click", (e) => {
  if (e.target.closest("[data-signout]")) signOut();
  else if (e.target.closest("[data-delete]")) deleteAccount();
  else if (e.target.closest("[data-export]")) exportProgress();
  else if (e.target.closest("[data-clear]")) clearProgress();
});
document.addEventListener("change", (e) => {
  const f = e.target.closest("[data-import]");
  if (f && f.files[0]) {
    importProgress(f.files[0]);
    f.value = "";
  }
});
