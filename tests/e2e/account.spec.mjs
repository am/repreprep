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
  await expect(page.locator("[data-who]")).toHaveText("Local tester");
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
