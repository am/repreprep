// Site-wide pieces: home page, header, theme, panel guide, reference pages, privacy form messages.
import { test, expect } from "./fixtures.mjs";
import { INSTRUMENTS } from "../../src/course/index.js";

const I = INSTRUMENTS.find((i) => i.ready);

test("home page leads to the course; tapping its logo stays on it", async ({ page }) => {
  await page.goto("/");
  await page.locator(".logo[data-dance]").click();
  await expect(page).toHaveURL("/");
  await expect(page.locator(".logo[data-dance] span")).toHaveCount(3);
  await page.locator(".gear a.go").click();
  await expect(page).toHaveURL(`/${I.slug}`);
  await expect(page.locator("main h2")).toContainText(I.name);
});

test("the header logo gets its colors and links home", async ({ page }) => {
  await page.goto(`/${I.slug}/machines`);
  const colors = await page.locator(".top .logo span").evaluateAll((s) => s.map((x) => x.style.getPropertyValue("--c")));
  expect(colors.every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true);
  await page.locator(".top .logo").click();
  await expect(page).toHaveURL("/");
});

test("theme switch: light and dark are remembered, auto follows the system", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`/${I.slug}`);
  const html = page.locator("html");
  await expect(html).not.toHaveAttribute("data-theme");
  await page.locator('.top [data-theme-set="light"]').click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(page.locator('.top [data-theme-set="light"]')).toHaveAttribute("aria-checked", "true");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await bg()).toBe("rgb(239, 237, 232)");
  await page.goto(`/${I.slug}/shortcuts`);
  await expect(html).toHaveAttribute("data-theme", "light");
  await page.locator('.top [data-theme-set="auto"]').click();
  await expect(html).not.toHaveAttribute("data-theme");
  expect(await bg()).toBe("rgb(20, 21, 23)");
  await page.emulateMedia({ colorScheme: "light" });
  expect(await bg()).toBe("rgb(239, 237, 232)");
  /* a saved dark choice wins over a light system */
  await page.locator('.top [data-theme-set="dark"]').click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  expect(await bg()).toBe("rgb(20, 21, 23)");
});

test("section tabs mark the current page", async ({ page }) => {
  for (const [path, label] of [["", "Lessons"], ["/panel", "Panel guide"], ["/machines", "Machines"], ["/shortcuts", "Shortcuts"]]) {
    await page.goto(`/${I.slug}${path}`);
    await expect(page.locator('.tabs a[aria-current="page"]')).toHaveText(label);
  }
});

test("panel guide: clicking a control opens its page", async ({ page }) => {
  await page.goto(`/${I.slug}/panel`);
  await expect(page.locator("#info h3")).toHaveText(Object.values(I.controls)[0].name);
  await page.locator('[data-panel-guide] svg .c[data-id="tempo"]').click();
  await expect(page).toHaveURL(`/${I.slug}/panel/tempo`);
  await expect(page.locator("#info h3")).toHaveText(I.controls.tempo.name);
  await expect(page.locator('[data-panel-guide] svg .c.sel')).toHaveAttribute("data-id", "tempo");
});

test("machines and shortcuts list the reference data", async ({ page }) => {
  await page.goto(`/${I.slug}/machines`);
  await expect(page.locator(".band")).toHaveCount(I.machines.length + 1);
  await page.goto(`/${I.slug}/shortcuts`);
  await expect(page.locator("table.sc tr")).toHaveCount(I.shortcuts.length);
});

test("privacy page shows the contact form's result", async ({ page }) => {
  await page.goto("/privacy?sent=1");
  await expect(page.locator("[data-contact-msg]")).toHaveText("Thanks, your message was sent.");
  await page.goto("/privacy?error=long");
  await expect(page.locator("[data-contact-msg]")).toHaveText(/too long/);
  await expect(page.locator("[data-contact-msg]")).toHaveClass("msg bad");
  await page.goto("/privacy");
  await expect(page.locator("[data-contact-msg]")).toBeHidden();
});

test("unknown addresses get the not-found page", async ({ page }) => {
  const r = await page.goto("/model-cycles/lessons/99");
  expect(r.status()).toBe(404);
  await expect(page.locator("main h2")).toHaveText("That page isn't here");
});

test("phone: the knob opens and closes the header menu @phone", async ({ page }) => {
  await page.goto(`/${I.slug}`);
  const top = page.locator(".top"), knob = page.locator("[data-menu]");
  await expect(page.locator(".hmenu")).toBeHidden();
  await knob.click();
  await expect(top).toHaveClass(/open/);
  await expect(knob).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".hmenu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(top).not.toHaveClass(/open/);
  await knob.click();
  await page.mouse.click(10, page.viewportSize().height - 10); /* anywhere outside the menu */
  await expect(top).not.toHaveClass(/open/);
});

test("phone: no page scrolls sideways @phone", async ({ page }) => {
  for (const path of ["/", `/${I.slug}`, `/${I.slug}/panel`, `/${I.slug}/machines`, `/${I.slug}/shortcuts`, "/account", "/privacy", I.lessons[0].path, `${I.lessons[0].path}/2`]) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(page.viewportSize().width);
  }
});

test("moving around without reloading: each page's parts work after the site's own navigation", async ({ page }) => {
  await page.goto("/privacy");
  await page.evaluate(() => (window.__noReload = true));
  /* course home, then a lesson: the player's script arrives with the page */
  await page.locator(`.instr a[href="/${I.slug}"]`).click();
  await expect(page).toHaveURL(`/${I.slug}`);
  await expect(page.locator("#meterTxt")).toHaveText(/^0 of \d+ reps$/);
  await page.locator(`.umap a[data-lesson="${I.lessons[0].id}"]`).click();
  await expect(page).toHaveURL(I.lessons[0].path);
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${I.lessons[0].path}/1`);
  await expect(page.locator('.dots [data-step="0"]')).toHaveClass(/done/);
  await expect(page.locator("#meterTxt")).toHaveText(/^1 of \d+ reps$/);
  /* the panel guide's clicks, then back to the course map with its dots filled in */
  await page.locator('.tabs a[href$="/panel"]').click();
  await page.locator('[data-panel-guide] svg .c[data-id="tempo"]').click();
  await expect(page).toHaveURL(`/${I.slug}/panel/tempo`);
  await page.locator('.tabs a[href="/' + I.slug + '"]').click();
  await expect(page.locator(`.umap [data-prog="${I.lessons[0].id}"]`)).toHaveClass("s part");
  await expect(page.locator("[data-continue]")).toHaveText("Continue");
  expect(await page.evaluate(() => window.__noReload)).toBe(true);
});
