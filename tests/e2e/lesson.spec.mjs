// The lesson player: moving through steps, ticks, finishing, notes, quizzes, the panel and the grids.
import { test, expect, progress, tick } from "./fixtures.mjs";
import { COURSES } from "../../src/course/files.js";

const [I] = COURSES;
const [L1, L2] = I.lessons;
const steps = (L) => L.steps.length;

test("Start and Next tick steps and move through the lesson", async ({ page }) => {
  await page.goto(L1.path);
  await expect(page.locator(".navrow .btn.primary")).toHaveText("Start");
  await expect(page.locator(".navrow button.btn")).toBeDisabled();
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${L1.path}/1`);
  await expect(page.locator('.dots [data-step="0"]')).toHaveClass(/done/);
  await expect(page.locator('.dots [data-step="1"]')).toHaveAttribute("aria-current", "true");
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${L1.path}/2`);
  const p = await progress(page);
  expect(p.inst.cycles.steps).toEqual({ [tick(L1, 0)]: true, [tick(L1, 1)]: true });
  expect(p.inst.cycles.active[L1.id]).toBe(2);
  expect(p.inst.cycles.lesson).toBe(L1.id);
  await expect(page.locator("#meterTxt")).toHaveText(`2 of ${I.lessons.reduce((a, l) => a + steps(l), 0)} reps`);
  /* Back goes to the previous step without ticking */
  await page.locator('.navrow [data-nav="-1"]').click();
  await expect(page).toHaveURL(`${L1.path}/1`);
});

test("arrow keys move between steps", async ({ page }) => {
  await page.goto(`${L1.path}/4`);
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(`${L1.path}/5`);
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(`${L1.path}/4`);
});

test("the last step leads to the optional challenge, and Finish opens the next lesson", async ({ page }) => {
  const last = steps(L1) - 1;
  await page.goto(`${L1.path}/${last}`);
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${L1.path}/${steps(L1)}`);
  await expect(page.locator(".pstep .kind")).toHaveText("Challenge");
  await expect(page.locator(".navrow .btn.primary")).toHaveText("Finish");
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(L2.path);
  const p = await progress(page);
  expect(p.inst.cycles.steps[tick(L1, last)]).toBe(true);
  expect(Object.keys(p.inst.cycles.steps).length).toBe(1); /* the challenge is never a rep */
});

test("ticking every step marks the lesson done", async ({ page }) => {
  await page.goto(L1.path);
  for (let i = 0; i < steps(L1); i++) {
    await page.locator(".navrow .btn.primary").click();
    await expect(page).toHaveURL(`${L1.path}/${i + 1}`);
  }
  const p = await progress(page);
  expect(typeof p.inst.cycles.done[L1.id]).toBe("number");
  await expect(page.locator(".finish [data-finish]")).toHaveText("Completed");
  await expect(page.locator(".finish .stamp")).toContainText("Done on");
});

test("Complete marks the lesson done and opens the next; clicking Completed undoes it", async ({ page }) => {
  await page.goto(`${L1.path}/3`);
  await page.locator("[data-finish]").click();
  await expect(page).toHaveURL(L2.path);
  let p = await progress(page);
  expect(Object.keys(p.inst.cycles.steps).filter((k) => k.startsWith(L1.id + ":")).length).toBe(steps(L1));
  expect(p.inst.cycles.done[L1.id]).toBeTruthy();
  await page.goto(`${L1.path}/3`);
  await expect(page.locator("[data-finish]")).toHaveText("Completed");
  await page.locator("[data-finish]").click();
  await expect(page.locator("[data-finish]")).toHaveText("Complete");
  p = await progress(page);
  expect(p.inst.cycles.done[L1.id]).toBeUndefined();
});

test("notes: add, save, edit, cancel", async ({ page }) => {
  await page.goto(L1.path);
  const box = page.locator(`[data-notebox="${L1.id}"]`);
  await expect(box.locator(".nb-empty")).toBeVisible();
  await box.locator("[data-note-edit]").click();
  await box.locator("textarea").fill("Kick on 1 felt good");
  await box.locator("[data-note-save]").click();
  await expect(box.locator(".nb-text")).toHaveText("Kick on 1 felt good");
  await expect(box.locator(".nb-stamp")).toBeVisible();
  await expect(box.locator("[data-note-edit]")).toHaveText("Edit");
  expect((await progress(page)).inst.cycles.notes[L1.id]).toBe("Kick on 1 felt good");
  /* Cancel and Escape keep the saved note */
  await box.locator("[data-note-edit]").click();
  await box.locator("textarea").fill("thrown away");
  await box.locator("[data-note-cancel]").click();
  await expect(box.locator(".nb-text")).toHaveText("Kick on 1 felt good");
  await box.locator("[data-note-edit]").click();
  await box.locator("textarea").fill("also thrown away");
  await box.locator("textarea").press("Escape");
  await expect(box.locator(".nb-text")).toHaveText("Kick on 1 felt good");
  /* Ctrl+Enter saves; an empty note is removed */
  await box.locator("[data-note-edit]").click();
  await box.locator("textarea").fill("");
  await box.locator("textarea").press("Control+Enter");
  await expect(box.locator(".nb-empty")).toBeVisible();
  expect((await progress(page)).inst.cycles.notes[L1.id]).toBeUndefined();
  /* notes survive a reload */
  await box.locator("[data-note-edit]").click();
  await box.locator("textarea").fill("kept");
  await box.locator("[data-note-save]").click();
  await page.reload();
  await expect(page.locator(`[data-notebox="${L1.id}"] .nb-text`)).toHaveText("kept");
});

test("quiz: a wrong answer is crossed out, the right one shows why", async ({ page }) => {
  const qi = L1.steps.findIndex((s) => s.q);
  await page.goto(`${L1.path}/${qi}`);
  const wrong = page.locator('.quiz [data-opt="0"]').first(),
    right = page.locator('.quiz [data-opt="1"]');
  await wrong.click();
  await expect(wrong).toHaveClass(/wrong/);
  await expect(wrong).toBeDisabled();
  await expect(page.locator(".qmsg")).toHaveText("Not quite. Try another one.");
  await expect(page.locator(".qexp")).toBeHidden();
  await right.click();
  await expect(right).toHaveClass(/right/);
  await expect(page.locator(".qmsg")).toHaveText("Right.");
  await expect(page.locator(".qexp")).toBeVisible();
  await expect(page.locator(".quiz .opt:not([disabled])")).toHaveCount(0);
});

test("lesson picker opens, jumps to a lesson and closes on Escape", async ({ page }) => {
  await page.goto(L1.path);
  const picker = page.locator("details.picker");
  await picker.locator("summary").click();
  await expect(picker).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(picker).not.toHaveAttribute("open", "");
  await picker.locator("summary").click();
  await page.locator(".pmenu .pm-i", { hasText: L2.title }).click();
  await expect(page).toHaveURL(L2.path);
});

test("lesson links reopen the step you were on", async ({ page }) => {
  await page.goto(`${L2.path}/5`);
  await page.goto(L1.path);
  await expect(page.locator(`.pmenu a[data-lesson="${L2.id}"]`)).toHaveAttribute("href", `${L2.path}/5`);
});

test("maximize fills the window, is remembered, and Escape leaves it", async ({ page }) => {
  await page.goto(`${L1.path}/4`);
  await page.locator("[data-max]").click();
  await expect(page.locator("html")).toHaveClass(/focus/);
  await expect(page.locator("[data-max]")).toHaveAttribute("aria-label", "Exit full window (Esc)");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(`${L1.path}/5`);
  await expect(page.locator("html")).toHaveClass(/focus/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/focus/);
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveClass(/focus/);
  expect((await progress(page)).focus).toBe(false);
});

test("the step panel can be resized with the keyboard and reset with a double-click", async ({ page }) => {
  await page.goto(`${L1.path}/4`);
  const w0 = (await page.locator(".pstep").boundingBox()).width;
  await page.locator("#gutter").focus();
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => (await page.locator(".pstep").boundingBox()).width).toBeCloseTo(w0 + 40, 0);
  expect((await progress(page)).stepW).toBeGreaterThan(0);
  await page.locator("#gutter").dblclick();
  await expect.poll(async () => (await page.locator(".pstep").boundingBox()).width).toBeCloseTo(w0, 0);
  expect((await progress(page)).stepW).toBeUndefined();
});

test("Play steps light their controls; clicking a control explains it", async ({ page }) => {
  const i = L1.steps.findIndex((s) => s.k === "play" && s.hl);
  await page.goto(`${L1.path}/${i}`);
  await expect(page.locator(".pstage svg .c[class*='hl-']").first()).toBeVisible();
  await expect(page.locator(".legend")).toBeVisible();
  await page.locator('.pstage svg .c[data-id="play"]').click();
  await expect(page.locator("#ctlinfo")).toBeVisible();
  await expect(page.locator("#ctlinfo")).toContainText(I.controls.play.name);
  await page.locator("#ctlinfo [data-closectl]").click();
  await expect(page.locator("#ctlinfo")).toBeHidden();
});

test("playable grid: squares toggle, Play becomes Stop, edits survive moving between steps", async ({ page }) => {
  let L, i;
  for (L of I.lessons) {
    i = L.steps.findIndex((s) => s.fig?.grid && s.fig.grid.edit !== false && !s.fig.grid.presets);
    if (i > 0) break;
  }
  await page.goto(`${L.path}/${i}`);
  const cell = page.locator(".gp .cell:not(.on):not([disabled])").first();
  const at = `.gp .cell[data-r="${await cell.getAttribute("data-r")}"][data-i="${await cell.getAttribute("data-i")}"]`;
  await cell.click();
  await expect(page.locator(at)).toHaveClass(/\bon\b/);
  await page.locator(".gp [data-gplay]").click();
  await expect(page.locator(".gp [data-gplay]")).toHaveText("Stop");
  await page.locator(".gp [data-gplay]").click();
  await expect(page.locator(".gp [data-gplay]")).toHaveText("Play");
  await page.locator('.navrow [data-nav="1"]').click();
  await page.locator('.navrow [data-nav="-1"]').click();
  await expect(page).toHaveURL(`${L.path}/${i}`);
  await expect(page.locator(at)).toHaveClass(/\bon\b/);
});

test("phone: the lesson step reads full width and Next works @phone", async ({ page }) => {
  await page.goto(`${L1.path}/4`);
  await expect(page.locator("#gutter")).toBeHidden();
  await page.locator(".navrow .btn.primary").click();
  await expect(page).toHaveURL(`${L1.path}/5`);
  const vw = page.viewportSize().width;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vw);
});
