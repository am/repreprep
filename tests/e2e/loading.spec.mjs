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
  /* the page's clock is ours, so the 150 ms wait doesn't depend on how fast the test server answers */
  await page.clock.install();
  await page.goto(lesson(2));
  const release = await slow(page, `**${lesson(3)}`);
  await page.locator('a[data-nav="1"]').first().click({ noWaitAfter: true });
  await page.clock.runFor(100);
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/pl-on/);
  release();
  await expect(page).toHaveURL(lesson(3));
  await page.clock.runFor(500);
  await expect(html).not.toHaveClass(/pl-on|pl-done/);
  await expect(page.locator(".pl-from, .pl-to")).toHaveCount(0);
});

test("a link the router doesn't open isn't lit by the next page change", async ({ page }) => {
  await page.goto(lesson(2));
  await page.locator('a[data-nav="1"]').first().click();
  await expect(page).toHaveURL(lesson(3));
  /* a link the browser opens itself (here it goes nowhere), then Back */
  await page.evaluate(() => {
    const a = Object.assign(document.createElement("a"), { href: "/elsewhere", textContent: "elsewhere" });
    a.setAttribute("data-astro-reload", "");
    a.addEventListener("click", (e) => e.preventDefault());
    document.querySelector("#view").append(a);
  });
  await page.locator('#view a[href="/elsewhere"]').click();
  const release = await slow(page, `**${lesson(2)}`);
  await page.evaluate(() => history.back());
  await expect(page.locator("html")).toHaveClass(/pl-on/);
  await expect(page.locator(".pl-from")).toHaveCount(0);
  release();
  await expect(page).toHaveURL(lesson(2));
});

test("a page brought back from the back/forward cache isn't left loading", async ({ page }) => {
  await page.goto(lesson(2));
  await slow(page, `**${lesson(3)}`);
  await page.locator('a[data-nav="1"]').first().click({ noWaitAfter: true });
  const html = page.locator("html");
  await expect(html).toHaveClass(/pl-on/);
  /* what the browser fires when it restores a page it kept in memory */
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await expect(html).not.toHaveClass(/pl-on|pl-done/);
  await expect(page.locator(".pl-from, .pl-to")).toHaveCount(0);
  await expect(page.locator(".pl-say")).toHaveText("");
});
