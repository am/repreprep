// Lesson updates: the note on a lesson you'd started when a newer release changed it, the "Updated" tag in
// the course map, marking it as read, and saved ticks moving along when a release added steps. The lesson
// and versions come from the changelog, so these keep working as releases are added.
import { test, expect, progress, setProgress } from "./fixtures.mjs";
import { COURSES, RELEASES } from "../../src/course/files.js";

const [I] = COURSES;
const version = RELEASES[0].id;
/* the newest release that changed a lesson of this course, and that change */
const r = RELEASES.find((x) => (x.lessons || []).some((c) => c.lesson.startsWith(I.slug + "/")));
const change = r && r.lessons.find((c) => c.lesson.startsWith(I.slug + "/"));
const L = change && I.lessons.find((l) => l.id === change.lesson.split("/")[1]);
const other = I.lessons.find(
  (l) => !RELEASES.some((x) => (x.lessons || []).some((c) => c.lesson.endsWith("/" + l.id)))
);
/* progress from just before that release */
const before = r && RELEASES[RELEASES.indexOf(r) + 1].id;
const state = (cycles, extra = {}) => ({
  updatedAt: 1,
  introSteps: 1,
  since: "0.1.0",
  ver: before,
  inst: { cycles: { lesson: null, steps: {}, done: {}, notes: {}, active: {}, ...cycles } },
  ...extra,
});

test("new visitors start on today's version and see no update notes", async ({ page }) => {
  await page.goto(`${I.lessons[0].path}`);
  await expect(page.locator("[data-upd-note]")).toBeHidden();
  await expect(page.locator(".news [data-news-dot]")).toBeHidden();
  await page.locator(".navrow .btn.primary").click();
  const p = await progress(page);
  expect(p.since).toBe(version);
  expect(p.ver).toBe(version);
});

test("the header's What's new icon shows a dot until you open What's new", async ({ page }) => {
  test.skip(RELEASES.length < 2, "only one release so far");
  await setProgress(page, state({}, { ver: RELEASES[1].id, since: RELEASES[1].id }));
  await page.goto(`/${I.slug}`);
  await expect(page.locator(".news [data-news-dot]")).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".news [data-news-dot]")).toBeVisible();
  await page.goto("/whats-new");
  await expect(page.locator(".news [data-news-dot]")).toBeHidden();
  await expect(page.locator(`[data-release="${version}"] [data-rel-new]`)).toBeVisible();
  await expect(page.locator(`[data-release="${RELEASES[1].id}"] [data-rel-new]`)).toBeHidden();
  expect((await progress(page)).read).toBe(version);
  await page.goto(`/${I.slug}`);
  await expect(page.locator(".news [data-news-dot]")).toBeHidden();
  await page.goto("/whats-new");
  await expect(page.locator(`[data-release="${version}"] [data-rel-new]`)).toBeHidden();
});

test("phone: the bell is in the header menu, and the knob shows its dot @phone", async ({ page }) => {
  test.skip(RELEASES.length < 2, "only one release so far");
  await setProgress(page, state({}, { ver: RELEASES[1].id, since: RELEASES[1].id }));
  await page.goto(`/${I.slug}`);
  await expect(page.locator(".news")).toBeHidden();
  await expect(page.locator(".knob [data-news-dot]")).toBeVisible();
  await page.locator("[data-menu]").click();
  await expect(page.locator(".news [data-news-dot]")).toBeVisible();
  await page.locator(".news").click();
  await expect(page).toHaveURL(/whats-new/);
  await expect(page.locator(".knob [data-news-dot]")).toBeHidden();
});

test("a started lesson that changed shows what's new until you mark it read", async ({ page }) => {
  test.skip(!L, "no release has changed a lesson yet");
  await setProgress(
    page,
    state({ steps: { [`${L.id}:0`]: true, [`${other.id}:0`]: true }, active: { [L.id]: 0, [other.id]: 0 } })
  );
  await page.goto(`/${I.slug}`);
  await expect(page.locator(`[data-upd-tag="${L.id}"]`).first()).toBeVisible();
  await expect(page.locator(`.umap [data-upd-tag="${other.id}"]`)).toBeHidden();
  await page.goto(L.path);
  const note = page.locator("[data-upd-note]");
  await expect(note).toBeVisible();
  await expect(note).toContainText(`Version ${r.id}`);
  await expect(note).toContainText(change.what);
  await note.locator("[data-upd-ok]").click();
  await expect(note).toBeHidden();
  expect((await progress(page)).inst.cycles.seen[L.id]).toBe(version);
  await page.goto(other.path);
  await expect(page.locator("[data-upd-note]")).toBeHidden();
  await page.goto(L.path);
  await expect(page.locator("[data-upd-note]")).toBeHidden();
  /* opening it counts as reading today's changes, so they don't show up once you start it */
  expect((await progress(page)).inst.cycles.seen[L.id]).toBe(version);
  await page.locator(".navrow .btn.primary").click();
  await expect(page.locator("[data-upd-note]")).toBeHidden();
});

test("a changed lesson you never opened gets no note", async ({ page }) => {
  test.skip(!L, "no release has changed a lesson yet");
  await setProgress(page, state({ steps: { [`${other.id}:0`]: true } }));
  await page.goto(L.path);
  await expect(page.locator("[data-upd-note]")).toBeHidden();
  /* opening it counts as reading today's changes, so they don't show up once you start it */
  expect((await progress(page)).inst.cycles.seen[L.id]).toBe(version);
  await page.locator(".navrow .btn.primary").click();
  await expect(page.locator("[data-upd-note]")).toBeHidden();
});

test("ticks saved before a release added steps move with their steps", async ({ page }) => {
  const add = RELEASES.flatMap((x) => (x.lessons || []).filter((c) => c.added).map((c) => ({ r: x, c })))[0];
  test.skip(!add, "no release has added steps yet");
  const id = add.c.lesson.split("/")[1];
  const first = add.c.added[0];
  /* the step that sat at the first added position before the release, and the one after it */
  await setProgress(
    page,
    state(
      { steps: { [`${id}:${first - 1}`]: true, [`${id}:${first}`]: true }, active: { [id]: first } },
      { ver: RELEASES[RELEASES.indexOf(add.r) + 1].id }
    )
  );
  await page.goto(`/${I.slug}`);
  const p = await progress(page);
  const moved = Object.keys(p.inst.cycles.steps).filter((k) => k.startsWith(id + ":"));
  expect(moved).toContain(`${id}:${first - 1}`);
  expect(moved).not.toContain(`${id}:${first}`);
  expect(p.inst.cycles.active[id]).toBeGreaterThan(first);
  expect(p.ver).toBe(version);
});
