// The page loading sign: on a slow page change a coral line creeps across the top, the tapped link pulses and the step dot you're
// heading to blinks; when the page lands the line finishes and they clear. Fast page changes show nothing.
import { test, expect } from "./fixtures.mjs";
import { COURSES } from "../../src/course/files.js";

const [I] = COURSES;
const lesson = (n) => `/${I.slug}/lessons/03${n ? `/${n}` : ""}`;

/* hold the next page back until release() is called */
async function slow(page, glob) {
  let release;
  const held = new Promise((r) => (release = r));
  await page.route(glob, async (route) => {
    await held;
    await route.continue();
  });
  return () => release();
}

test("a slow lesson link shows the line and lights the tapped link", async ({ page }) => {
  await page.goto(`/${I.slug}`);
  const release = await slow(page, `**${lesson()}`);
  const link = page.locator(`#view a[href="${lesson()}"]`).first();
  await link.click({ noWaitAfter: true });
  const html = page.locator("html");
  await expect(html).toHaveClass(/pl-on/);
  await expect(link).toHaveClass(/pl-from/);
  await expect(page.locator(".pl-say")).toHaveText("Loading the page");
  release();
  await expect(page).toHaveURL(lesson());
  await expect(html).not.toHaveClass(/pl-on/);
  await expect(page.locator(".pl-from")).toHaveCount(0);
  await expect(page.locator(".pl-say")).toHaveText("");
  await expect(html).not.toHaveClass(/pl-done/);
});

test("a slow Next lights the button and the step dot it goes to", async ({ page }) => {
  await page.goto(lesson(2));
  const release = await slow(page, `**${lesson(3)}`);
  const next = page.locator('a[data-nav="1"]').first();
  await next.click({ noWaitAfter: true });
  await expect(next).toHaveClass(/pl-from/);
  await expect(page.locator(`.dots a[href="${lesson(3)}"]`)).toHaveClass(/pl-to/);
  await expect(page.locator(".pl-to")).toHaveCount(1);
  release();
  await expect(page).toHaveURL(lesson(3));
  await expect(page.locator(".pl-to, .pl-from")).toHaveCount(0);
});

test("a quick page change shows no sign", async ({ page }) => {
  await page.goto(lesson(2));
  await page.evaluate(() => {
    window.__seen = false;
    new MutationObserver(() => {
      if (document.documentElement.classList.contains("pl-on")) window.__seen = true;
    }).observe(document.documentElement, { attributes: true });
  });
  await page.locator('a[data-nav="1"]').first().click();
  await expect(page).toHaveURL(lesson(3));
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__seen)).toBe(false);
});
