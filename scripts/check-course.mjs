// Renders every step, drawing and question of every course, so a broken lesson edit fails here
// instead of on the site. Run with `npm run check`.
import { INSTRUMENTS, renderFig } from "../src/course/index.js";
import { stepParts, keyify } from "../src/course/shared/text.js";

let steps = 0;
const ids = new Set();
for (const I of INSTRUMENTS.filter((i) => i.ready)) {
  I.draw();
  for (const L of I.lessons) {
    if (ids.has(L.id)) throw new Error(`Two lessons share the id ${L.id}`);
    ids.add(L.id);
    L.steps.forEach((st, i) => {
      const { lead, first, rest, para, items } = stepParts(st);
      [lead, first, rest, para, ...(items || []), st.hear || "", st.a || "", ...(st.q || [])].forEach((t) => keyify(I, t || "", st.hl));
      if (st.q && !st.q.some((o) => o.startsWith("!"))) throw new Error(`${L.id} step ${i}: no right answer (mark it with !)`);
      if (st.fig && !renderFig(I, st.fig, `${L.id}:${i}`)) throw new Error(`${L.id} step ${i}: unknown drawing ${JSON.stringify(st.fig).slice(0, 40)}`);
      steps++;
    });
    L.concepts.forEach((c) => c.p.forEach((p) => keyify(I, p, "")));
  }
}
console.log(`Course OK: ${ids.size} lessons, ${steps} steps.`);
