// Progress across the site: the course map, Continue, old progress files, and the progress page.
import { test, expect, progress, setProgress, LS_KEY } from "./fixtures.mjs";
import { INSTRUMENTS } from "../../src/course/index.js";

const I = INSTRUMENTS.find((i) => i.ready);
const [L1, L2] = I.lessons;
const ticks = (L, n) => Object.fromEntries([...Array(n).keys()].map((i) => [`${L.id}:${i}`, true]));
const state = (cycles, extra = {}) => ({ updatedAt: 1, introSteps: 1, inst: { cycles: { lesson: null, steps: {}, done: {}, notes: {}, active: {}, ...cycles } }, ...extra });

test("course map shows progress dots and Continue picks up where you left off", async ({ page }) => {
  await setProgress(page, state({ lesson: L2.id, steps: { ...ticks(L1, L1.steps.length), ...ticks(L2, 3) }, done: { [L1.id]: 1 }, active: { [L2.id]: 3 } }));
  await page.goto(`/${I.slug}`);
  await expect(page.locator(`.umap [data-prog="${L1.id}"]`)).toHaveClass("s full");
  await expect(page.locator(`.umap [data-prog="${L2.id}"]`)).toHaveClass("s part");
  await expect(page.locator(`.umap [data-prog="${I.lessons[2].id}"]`)).toHaveClass("s ");
  await expect(page.locator("[data-continue]")).toHaveText("Continue");
  await expect(page.locator("[data-continue]")).toHaveAttribute("href", `${L2.path}/3`);
  await expect(page.locator("[data-continue-what]")).toHaveText(`${L2.short} · ${L2.title}`);
  await expect(page.locator(`.umap a[data-lesson="${L2.id}"]`)).toHaveAttribute("href", `${L2.path}/3`);
  await expect(page.locator("#meterTxt")).toHaveText(new RegExp(`^${L1.steps.length + 3} of \\d+ reps$`));
});

test("with no progress the course home offers lesson 1", async ({ page }) => {
  await page.goto(`/${I.slug}`);
  await expect(page.locator("[data-continue]")).toHaveText("Start lesson 1");
  await expect(page.locator("[data-continue]")).toHaveAttribute("href", L1.path);
  await expect(page.locator("#meterTxt")).toHaveText(/^0 of \d+ reps$/);
});

test("progress saved before lessons had an intro step moves every step by one", async ({ page }) => {
  await setProgress(page, { updatedAt: 1, inst: { cycles: { lesson: L1.id, steps: { [`${L1.id}:0`]: true, [`${L1.id}:1`]: true }, done: {}, notes: { [L1.id]: "old" }, active: { [L1.id]: 2 } } } });
  await page.goto(`/${I.slug}`);
  await expect(page.locator("[data-continue]")).toHaveAttribute("href", `${L1.path}/3`);
  await page.goto(`${L1.path}/3`);
  await expect(page.locator(".dots a.done")).toHaveCount(3);
  for (const i of [0, 1, 2]) await expect(page.locator(`.dots [data-step="${i}"]`)).toHaveClass(/done/);
  /* the next save writes the new shape */
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${L1.path}/4`);
  const p = await progress(page);
  expect(p.introSteps).toBe(1);
  expect(p.inst.cycles.steps).toEqual(ticks(L1, 4));
  await page.goto(`${L1.path}/3`);
  await expect(page.locator(`[data-notebox="${L1.id}"] .nb-text`)).toHaveText("old");
});

test("progress page: download, load and delete", async ({ page }, info) => {
  await setProgress(page, state({ lesson: L1.id, steps: ticks(L1, 2), notes: { [L1.id]: "hi" } }, { stepW: 400 }));
  await page.goto("/account");
  await expect(page.locator("main h2")).toHaveText("Your progress");

  const [dl] = await Promise.all([page.waitForEvent("download"), page.locator("[data-export]").click()]);
  expect(dl.suggestedFilename()).toBe("repreprep-progress.json");
  const saved = JSON.parse(await (await import("node:fs/promises")).readFile(await dl.path(), "utf8"));
  expect(saved.inst.cycles.steps).toEqual(ticks(L1, 2));

  /* an old progress.json (no intro steps, old fields) loads and is moved by one step */
  const file = info.outputPath("old-progress.json");
  await (await import("node:fs/promises")).writeFile(file, JSON.stringify({ instrument: "cycles", tab: "x", inst: { cycles: { steps: { [`${L2.id}:0`]: true }, done: {}, notes: {}, active: {} } } }));
  await page.locator("[data-import]").setInputFiles(file);
  await expect(page.locator("[data-import-msg]")).toHaveText("Loaded. 2 ticked steps.");
  let p = await progress(page);
  expect(p.inst.cycles.steps).toEqual({ [`${L2.id}:0`]: true, [`${L2.id}:1`]: true });
  expect(p.instrument).toBeUndefined();

  await page.locator("[data-import]").setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from("[1,2]") });
  await expect(page.locator("[data-import-msg]")).toHaveText("That file isn't a Rep Rep Rep progress file.");

  page.once("dialog", (d) => d.dismiss());
  await page.locator("[data-clear]").click();
  expect((await progress(page)).inst.cycles.steps).toEqual({ [`${L2.id}:0`]: true, [`${L2.id}:1`]: true });
  page.once("dialog", (d) => d.accept());
  await page.locator("[data-clear]").click();
  await expect(page.locator("[data-clear-msg]")).toHaveText("Progress deleted.");
  p = await progress(page);
  expect(p.inst).toEqual({});
});

test("a broken progress entry doesn't break the site", async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, "{not json"), LS_KEY);
  await page.goto(L1.path);
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${L1.path}/1`);
  expect((await progress(page)).inst.cycles.steps).toEqual({ [`${L1.id}:0`]: true });
});
