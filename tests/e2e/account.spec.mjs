// Signed in, with the local test account, on a build with sign-in on running in Cloudflare's local runtime
// (the "signed-in" project in playwright.config.mjs). Every test is the same account, so they run in order.
import { test, expect, LS_KEY } from "./fixtures.mjs";
import { COURSES } from "../../src/course/files.js";

const [I] = COURSES;
const [L1] = I.lessons;
test.describe.configure({ mode: "serial" });

async function signIn(page) {
  await page.goto("/account");
  await page.getByRole("link", { name: "Continue with a local test account" }).click();
  await expect(page).toHaveURL("/account");
  await expect(page.locator("[data-who]")).toHaveText("Local tester (local-tester@example.invalid)");
}

test("signing in from the progress page", async ({ page }) => {
  await page.goto("/account");
  await expect(page.locator("#acct")).toHaveText("Sign in");
  await expect(page.locator("[data-signed-in]").first()).toBeHidden();
  await signIn(page);
  await expect(page.locator("#acct")).toHaveText("Local tester");
  await expect(page.locator("[data-signed-out]")).toBeHidden();
  await expect(page.locator("#sync")).toHaveText("Progress saved to your account.");
});

test("asking for a sign-in link by email", async ({ page }) => {
  await page.goto("/account");
  const form = page.locator("[data-email-signin]");
  await expect(form).toBeVisible();
  await form.getByRole("textbox").fill("someone@example.com");
  await form.getByRole("button", { name: "Email me a link" }).click();
  await expect(form.locator("[data-email-msg]")).toHaveText(
    /Check your inbox: a sign-in link is on its way to someone@example\.com/
  );
});

test("creating an account with a password, and signing in with one", async ({ page }) => {
  await page.goto("/account");
  const form = page.locator("[data-email-signin]");
  const password = form.getByLabel(/Password/);
  await expect(password).toBeHidden();
  await form.getByRole("button", { name: "Use a password instead" }).click();
  await expect(password).toBeFocused();
  await expect(form.getByRole("button", { name: "Email me a link", exact: true })).toBeHidden();
  const email = `pw-${Date.now()}@example.com`;
  await form.locator(`input[name="email"]`).fill(email);
  await password.fill("a long and fresh passphrase");
  await form.getByRole("button", { name: "Create account" }).click();
  await expect(form.locator("[data-email-msg]")).toHaveText(
    `Almost there: confirm your address with the link we sent to ${email}, and you're signed in.`
  );
  /* before the address is confirmed, signing in asks for that first */
  await password.fill("a long and fresh passphrase");
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(form.locator("[data-email-msg]")).toHaveText(
    `Please confirm your address first: we've sent a new link to ${email}.`
  );
  await password.fill("not the right password");
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(form.locator("[data-email-msg]")).toHaveText(/That email and password don't match/);
  await form.getByRole("button", { name: "Forgot password?" }).click();
  await expect(form.locator("[data-email-msg]")).toHaveText(/a link to choose a new password is on its way/);
  await form.getByRole("button", { name: "Email me a link instead" }).click();
  await expect(password).toBeHidden();
});

test("a reset link that's used up says so", async ({ page }) => {
  await page.goto("/account/reset?error=INVALID_TOKEN");
  await expect(page.locator("[data-reset-msg]")).toHaveText(/This link has expired or was already used/);
  await expect(page.locator("[data-reset]")).toBeHidden();
  await page.goto("/account/reset?token=made-up");
  await expect(page).toHaveURL("/account/reset");
  await page.getByLabel(/New password/).fill("a long and fresh passphrase");
  await page.getByRole("button", { name: "Save and sign in again" }).click();
  await expect(page.locator("[data-reset-msg]")).toHaveText(/This link has expired or was already used/);
});

test("deleting the account starts it over", async ({ page }) => {
  await signIn(page);
  page.on("dialog", (d) => d.accept());
  await page.locator("[data-delete]").click();
  await expect(page.locator("[data-signed-out]")).toBeVisible();
  await expect(page.locator("#acct")).toHaveText("Sign in");
});

test("progress saved to the account follows you to another browser", async ({ page, browser }) => {
  await signIn(page);
  await page.goto(L1.path);
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${L1.path}/1`);
  await expect(page.locator("#sync")).toHaveText("Progress saved to your account.");
  await page.waitForResponse((r) => r.request().method() !== "GET" && r.ok());

  const other = await browser.newPage();
  await signIn(other);
  await other.goto(`/${I.slug}`);
  await expect(other.locator(`.umap [data-prog="${L1.id}"]`)).toHaveClass("s part");
  await expect(other.locator("#meterTxt")).toHaveText(/^1 of \d+ reps$/);
  await other.close();
});

test("signing out leaves no progress in the browser", async ({ page }) => {
  await signIn(page);
  await page.goto(`/${I.slug}`);
  await expect(page.locator("#meterTxt")).toHaveText(/^1 of \d+ reps$/);
  await page.goto("/account");
  await page.locator("[data-signout]").click();
  await expect(page.locator("[data-signed-out]")).toBeVisible();
  await expect(page.locator("#acct")).toHaveText("Sign in");
  expect(await page.evaluate((k) => localStorage.getItem(k), LS_KEY)).toBeNull();
});
