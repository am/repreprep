/* A key combo drawn as a timeline: one lane per key, read left to right. A bar is a key you keep held
   (until its "release" move, or to the end), a dot a key you press and let go. A step lists its moves in
   `combo`, e.g. ["hold [PATTERN]", "hold [TRIG 1]", "press [RECORD]", "release [TRIG 1]", "hold [TRIG 4]",
   "hold [STOP] until the countdown ends"]. */
import { esc } from "./html.js";
import { keyify } from "./text.js";

export const COMBO_MOVE = /^(hold|press|release) \[([^\]]+)\](?: (until .+))?$/;

export function parseCombo(moves) {
  const keys = [],
    lanes = {};
  moves.forEach((m, i) => {
    const [, act, key, until] = m.match(COMBO_MOVE) || [];
    if (!act) throw new Error(`Not a combo move: "${m}"`);
    if (!lanes[key]) {
      keys.push(key);
      lanes[key] = [];
    }
    const L = lanes[key];
    const open = L.find((x) => x.kind === "hold" && x.end == null);
    if (act === "release") {
      if (!open) throw new Error(`"${m}": ${key} is not held`);
      open.end = i;
    } else {
      if (open) throw new Error(`"${m}": ${key} is already held`);
      L.push({ kind: act, start: i, end: act === "press" ? i : null, until });
    }
  });
  return { keys, lanes, cols: moves.length };
}

export function renderCombo(I, moves) {
  const { keys, lanes, cols } = parseCombo(moves);
  const words = { hold: "hold", press: "press", release: "let go" };
  const label = moves
    .map((m) => m.replace(COMBO_MOVE, (s, a, k, u) => `${words[a]} ${k}${u ? " " + u : ""}`))
    .join(", then ");
  let h = `<div class="combo" style="--cols:${cols}" role="img" aria-label="${esc("Key timeline: " + label)}">`;
  h += `<div class="combo-n" aria-hidden="true"></div>`;
  for (let c = 0; c < cols; c++) h += `<div class="combo-n" aria-hidden="true">${c + 1}</div>`;
  keys.forEach((k, r) => {
    const row = r + 2;
    h += `<div class="combo-key" style="grid-row:${row}">${keyify(I, `[${k}]`, "")}</div>`;
    h += `<div class="combo-lane" style="grid-row:${row}"></div>`;
    lanes[k].forEach((x) => {
      if (x.kind === "press") {
        h += `<div class="combo-tap" style="grid-row:${row};grid-column:${x.start + 2}"></div>`;
        return;
      }
      const end = x.end == null ? cols : x.end;
      h +=
        `<div class="combo-hold${x.end == null ? " to-end" : ""}" style="grid-row:${row};grid-column:${x.start + 2} / ${end + 2}">` +
        (x.until ? `<span>${esc(x.until)}</span>` : "") +
        `</div>`;
    });
  });
  h += `<div class="combo-legend" style="grid-row:${keys.length + 2}"><span class="combo-hold sw"></span> keep held <span class="combo-tap sw"></span> press and let go</div>`;
  return h + `</div>`;
}
