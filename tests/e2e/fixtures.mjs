// Shared setup for the browser tests: no requests leave the machine (fonts fall back), and any
// error in the page's scripts fails the test.
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text());
    });
    await page.route(/^https?:\/\//, (r) => (r.request().url().startsWith(baseURL) ? r.continue() : r.abort()));
    await use(page);
    expect(errors, "errors in the page").toEqual([]);
  },
});
export { expect };

/* progress as the site keeps it in localStorage */
export const LS_KEY = "repreprep-progress-v1";
export const progress = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || "null"), LS_KEY);
export const setProgress = (page, state) =>
  page.addInitScript(
    ([k, s]) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem(k, JSON.stringify(s));
        sessionStorage.setItem("seeded", "1");
      }
    },
    [LS_KEY, state]
  );
/* a step's tick as progress keeps it: "w05:set-decay" */
export const tick = (L, i) => `${L.id}:${L.steps[i].id}`;
