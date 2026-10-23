/* ============================================================
   COURSE DATA. Add an instrument by adding an entry to INSTRUMENTS
   with: key (progress key), slug (URL), name, controls, icon, draw, figs, machines, shortcuts, saving,
   and its lessons as YAML files in src/content/lessons/<slug>/.
   ============================================================ */
import { MODEL_CYCLES } from "./model-cycles/index.js";
import { esc } from "./shared/html.js";
import { renderGrid } from "./shared/grid.js";
import { keyify } from "./shared/text.js";

export const INSTRUMENTS = [
  MODEL_CYCLES,
  { key: "microfreak", slug: "microfreak", name: "MicroFreak", ready: false },
  { key: "move", slug: "move", name: "Ableton Move", ready: false },
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
   Saved ticks are "<lesson id>:<step id>" ("w04:make-b01-four-bars", "w04:intro"), so steps can be added,
   removed or moved without touching anyone's progress; step addresses are numbered (intro = 0).
   The lesson data comes from src/content/lessons: content.js reads it for the pages, files.js for scripts and tests. */
export function withLessons(I, data) {
  const lessons = structuredClone(data).sort(
    (a, b) => !!a.song - !!b.song || (a.song ? a.id.localeCompare(b.id) : a.number - b.number)
  );
  const songs = lessons.filter((l) => l.song);
  lessons.forEach((L) => {
    L.steps.unshift({
      id: "intro",
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
export const stepPath = (L, i) => (i ? `${L.path}/${i}` : L.path);
export const nextLesson = (I, L) => I.lessons[I.lessons.indexOf(L) + 1];

/* a step's drawing: a named figure, or a playable grid whose spec travels with the page */
export function renderFig(I, f, id) {
  if (!f) return "";
  if (typeof f === "string") return I.figs[f] ? I.figs[f]() : "";
  const host = (G) =>
    `<div class="gridhost" data-grid="${esc(id)}" data-spec="${esc(JSON.stringify(G))}">${renderGrid(G, id)}</div>`;
  if (f.grid) return host(f.grid);
  if (f.pattern) return renderPattern(I, f.pattern, host);
  return "";
}

/* a Get ready step's map: the pattern as the lesson expects to find it, as a grid you can play (a tab per
   bar), then what the grid can't show. Outlined squares were added in the last lesson. */
function renderPattern(I, P, host) {
  const G = { title: `${P.slot} as you saved it`, bpm: P.bpm, edit: false };
  if (P.rows) Object.assign(G, { rows: P.rows, swing: P.swing });
  else G.presets = P.bars.map((rows, i) => ({ name: `Bar ${i + 1}`, bpm: P.bpm, swing: P.swing, rows }));
  const list = (h, xs) =>
    xs && xs.length ? `<h4>${h}</h4><ul>${xs.map((x) => `<li>${keyify(I, x, "")}</li>`).join("")}</ul>` : "";
  const nw = [P.rows || [], ...(P.bars || [])].flat().some((r) => r.nw);
  return `<div class="pmap">${host(G)}<div class="pmap-notes">${
    nw ? `<p class="pmap-key"><span class="pmap-nw" aria-hidden="true"></span> Added last lesson</p>` : ""
  }${list("Also in the pattern", P.notes)}${list("Your other patterns", P.others)}</div></div>`;
}
