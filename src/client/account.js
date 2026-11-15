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
  const query = new URLSearchParams(location.search),
    me = account.me,
    view = root.dataset.view;
  /* the old address for signing up, and the Sign up page once you're logged in */
  if (view === "login" && query.get("mode") === "signup" && !me) return location.replace("/account/signup");
  if (view === "signup" && me) return location.replace("/account");
  const errorBox = root.querySelector("[data-acct-error]");
  if (errorBox) errorBox.hidden = query.get("error") !== "signin";
  root.querySelectorAll("[data-signed-in]").forEach((element) => (element.hidden = !me));
  root.querySelectorAll("[data-signed-out]").forEach((element) => (element.hidden = !!me));
  root
    .querySelectorAll("[data-show]")
    .forEach((element) => (element.hidden = (element.dataset.show === "in") !== !!me));
  const section = root.querySelector("[data-signed-out]");
  if (me) document.title = document.title.replace(/^(Log in|Your data)/, "Your account");
  if (me) {
    const who = root.querySelector("[data-who]");
    if (who) who.textContent = [me.name, me.email && `(${me.email})`].filter(Boolean).join(" ");
  } else if (section) {
    const next = query.get("next") || "/account";
    const ids = account.providers.map((provider) => provider.id);
    const link = (provider) =>
      provider.id === "dev"
        ? `<a class="btn" href="/auth/dev?next=${encodeURIComponent(next)}" data-astro-reload>${PROVIDER_ICON.dev}Continue with a local test account</a>`
        : `<a class="btn" href="/auth/${provider.id}?next=${encodeURIComponent(next)}" data-astro-reload>${PROVIDER_ICON[provider.id] || ""}Continue with ${esc(provider.name)}</a>`;
    /* the other ways in, one button each: a new provider is one more entry in providers() */
    const items = account.providers.filter((provider) => !["email", "password"].includes(provider.id)).map(link);
    const box = section.querySelector("[data-providers]"),
      html = items.join("");
    if (box.dataset.html !== html) box.innerHTML = box.dataset.html = html;
    const form = section.querySelector("[data-email-signin]");
    form.hidden = !ids.includes("email");
    section.querySelector("[data-email-way]").hidden = form.hidden;
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
function clearMessage(section) {
  const message = section.querySelector("[data-email-msg]");
  message.textContent = "";
  message.className = "msg";
  delete section.dataset.sent;
}
function setMethod(method) {
  const section = signedOut(),
    form = section.querySelector("[data-email-signin]");
  section.dataset.method = method;
  clearMessage(section);
  (method === "password" && form.email.value ? form.password : form.email).focus();
}
document.addEventListener("click", (event) => {
  const methodLink = event.target.closest("[data-method-to]"),
    eye = event.target.closest("[data-eye]");
  if (methodLink) setMethod(methodLink.dataset.methodTo);
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
async function sendEmailForm(form, action) {
  const message = form.querySelector("[data-email-msg]");
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
  }[action];
  form.querySelectorAll("button").forEach((button) => (button.disabled = true));
  message.className = "msg";
  message.textContent = "One moment…";
  const token = await turnstileToken(form.querySelector("[data-turnstile]"));
  const response = await fetch(API[action], {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-captcha-response": token },
    body: JSON.stringify(body),
  }).catch(() => null);
  const result = await response?.json().catch(() => ({}));
  form.querySelectorAll("button").forEach((button) => (button.disabled = false));
  resetTurnstile(form.querySelector("[data-turnstile]"));
  const say = (text, bad) => {
    message.className = bad ? "msg bad" : "msg";
    message.textContent = text;
  };
  if (response?.ok) {
    if (action === "signin") return (location.href = next);
    form.password.value = "";
    signedOut().dataset.sent = "";
    return say(
      {
        link: `Check your inbox: a login link is on its way to ${email}. It works once, for 10 minutes.`,
        signup: `Almost there: confirm your address with the link we sent to ${email}, and you're logged in.`,
        forgot: `If there's an account for ${email}, a link to choose a new password is on its way. It works for an hour.`,
      }[action]
    );
  }
  if (response?.status === 429) return say("Too many tries. Please wait a minute and try again.", true);
  if (result?.code === "EMAIL_NOT_VERIFIED")
    return say(`Please confirm your address first: we've sent a new link to ${email}.`, true);
  if (ERRORS[result?.code]) return say(ERRORS[result.code], true);
  if (response?.status === 400 || response?.status === 403)
    return say("That didn't go through. Check the address and the box above, then try again.", true);
  say("Something went wrong. Please try again.", true);
}
document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-email-signin]");
  if (!form) return;
  event.preventDefault();
  const section = signedOut();
  /* Enter in a field picks the button shown for this view */
  const shown = event.submitter?.offsetParent ? event.submitter : null;
  const action = shown?.dataset.act || (section.dataset.method === "password" ? section.dataset.tab : "link");
  if ((action === "signin" && !form.password.value) || (action === "signup" && form.password.value.length < 12)) {
    form.password.focus();
    return form.password.reportValidity?.() || undefined;
  }
  sendEmailForm(form, action);
});

async function signOut() {
  await flush();
  const { actions } = await import("astro:actions");
  await actions.account.signOut().catch(() => {});
  /* a shared computer shouldn't keep your progress after you sign out */
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
  location.href = "/account";
}
async function deleteAccount() {
  if (!confirm("Delete your account and the progress saved with it? This can't be undone.")) return;
  const { actions } = await import("astro:actions");
  const { error } = await actions.account.delete().catch((caught) => ({ error: caught }));
  if (!error) {
    account.me = null;
    location.href = "/account";
  } else alert("Couldn't delete the account. Please try again.");
}
function exportProgress() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: "repreprep-progress.json",
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
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
  const message = document.querySelector("[data-clear-msg]");
  if (message) message.textContent = "Progress deleted.";
}
async function importProgress(file) {
  const message = document.querySelector("[data-import-msg]");
  try {
    const loaded = JSON.parse(await file.text());
    if (!loaded || typeof loaded.inst !== "object") throw new Error("not a progress file");
    combine(loaded);
    update();
    const ticked = Object.values(state.inst).reduce(
      (total, progress) => total + Object.keys(progress.steps || {}).length,
      0
    );
    if (message) message.textContent = `Loaded and combined. ${ticked} ticked steps.`;
  } catch {
    if (message) message.textContent = "That file isn't a Rep Rep Rep progress file.";
  }
}
document.addEventListener("click", (event) => {
  if (event.target.closest("[data-signout]")) signOut();
  else if (event.target.closest("[data-delete]")) deleteAccount();
  else if (event.target.closest("[data-export]")) exportProgress();
  else if (event.target.closest("[data-clear]")) clearProgress();
});
document.addEventListener("change", (event) => {
  const input = event.target.closest("[data-import]");
  if (input && input.files[0]) {
    importProgress(input.files[0]);
    input.value = "";
  }
});
