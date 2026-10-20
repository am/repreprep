/* ============================================================
   COURSE DATA. Add an instrument by adding an entry to INSTRUMENTS
   with: key (progress key), slug (URL), name, controls, icon, draw, figs, machines, shortcuts, saving,
   and its lessons as YAML files in src/content/lessons/<slug>/.
   ============================================================ */
import { MODEL_CYCLES } from "./model-cycles/index.js";
import { MICROFREAK } from "./microfreak/index.js";
import { esc } from "./shared/html.js";
import { renderGrid } from "./shared/grid.js";
import { CONCEPT_FIGS } from "./concepts.js";

export const INSTRUMENTS = [
  MODEL_CYCLES,
  MICROFREAK,
  { key: "live", slug: "live", name: "Ableton Live", ready: false },
];

export const lessonLabel = (L) => (L.song ? "Song study" : "Lesson " + L.number);
export const pad2 = (n) => String(n).padStart(2, "0");
/* the goal as it reads after "you will": "Feel the beat" -> "feel the beat" */
export const goalPhrase = (L) => L.goal.charAt(0).toLowerCase() + L.goal.slice(1);
/* lessons grouped by unit, in course order, with song studies as the last group */
export function byUnit(lessons) {
  const groups = [];
  lessons.forEach((l) => {
    const u = l.song ? "Song studies" : l.unit || "";
    let g = groups.find((g) => g.u === u);
    if (!g) groups.push((g = { u, ls: [] }));
    g.ls.push(l);
  });
  return groups;
}
const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* An instrument with its lessons, ready for the pages: lessons in course order (song studies last), each
   opening with an intro step (what you will learn, what to listen to) and with its address and short name.
   Step ids stay the old ones (lesson id + ":" + index, intro = 0), so saved progress keeps working.
   A shared step (`use: <id>`) takes its text and drawing from concepts, the steps in src/content/concepts.
   The lesson data comes from src/content: content.js reads it for the pages, files.js for scripts and tests. */
export function withLessons(I, data, concepts = {}) {
  const lessons = structuredClone(data).sort(
    (a, b) => !!a.song - !!b.song || (a.song ? a.id.localeCompare(b.id) : a.number - b.number)
  );
  const songs = lessons.filter((l) => l.song);
  lessons.forEach((L) => {
    L.steps = L.steps.map((st) => {
      if (!st.use) return st;
      const c = concepts[st.use];
      if (!c) throw new Error(`${I.slug} lesson ${L.id}: no shared step "${st.use}" in src/content/concepts`);
      const { id, ...shared } = structuredClone(c);
      return { ...shared, t: st.extra ? `${shared.t} ${st.extra}` : shared.t, shared: id };
    });
    L.steps.unshift({
      intro: true,
      k: "intro",
      hl: "",
      t: `${lessonLabel(L)}: ${L.title}. In this lesson you will ${goalPhrase(L)}`,
    });
    L.slug = L.song ? slugify(L.title) : pad2(L.number);
    L.path = `/${I.slug}/${L.song ? "songs" : "lessons"}/${L.slug}`;
    L.short = L.song ? "S" + pad2(songs.indexOf(L) + 1) : "L" + pad2(L.number);
  });
  return { ...I, lessons };
}
/* each shared step learns which other courses have it too (also: their names), for the player's "Skip" offer */
export function linkShared(courses) {
  const users = {};
  courses.forEach((I) =>
    I.lessons.forEach((L) => L.steps.forEach((st) => st.shared && (users[st.shared] ||= new Set()).add(I.name)))
  );
  courses.forEach((I) =>
    I.lessons.forEach((L) =>
      L.steps.forEach((st) => st.shared && (st.also = [...users[st.shared]].filter((n) => n !== I.name)))
    )
  );
  return courses;
}
/* the step a "Skip, I know this" on step i leads to: the first step after this run of shared steps
   (L.steps.length when the run ends the lesson) */
export function skipTo(L, i) {
  let j = i;
  while (L.steps[j]?.shared) j++;
  return j;
}
export const stepPath = (L, i) => (i ? `${L.path}/${i}` : L.path);
export const nextLesson = (I, L) => I.lessons[I.lessons.indexOf(L) + 1];

/* a step's drawing: a named figure, or a playable grid whose spec travels with the page */
export function renderFig(I, f, id) {
  if (!f) return "";
  if (typeof f === "string") {
    const draw = I.figs[f] || CONCEPT_FIGS[f];
    return draw ? draw() : "";
  }
  if (f.grid)
    return `<div class="gridhost" data-grid="${esc(id)}" data-spec="${esc(JSON.stringify(f.grid))}">${renderGrid(f.grid, id)}</div>`;
  return "";
}
