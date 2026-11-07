/* A key combo drawn as numbered rows. A step lists its moves in `combo`, e.g. ["hold [PATTERN]",
   "hold [TRIG 1]", "press [RECORD]", "release [TRIG 1]", "hold [TRIG 4]", "hold [STOP] until the countdown ends"].
   Keys held from the start and never let go get row 1 ("hold until the end") and an amber line beside the
   rows they stay down for. Every other row is one chord: the keys held for it (amber) and the key that
   finishes it: a press (coral), a turn of a knob or a hold "until ...". A move can end with a note, such as
   "press [LEVEL/DATA] until VEL shows" or "turn [LEVEL/DATA] to about 30". A release opens the next row with
   "let go of [KEY], then"; releases at the end get a last row of their own. */
import { esc } from "./html.js";
import { keyify } from "./text.js";

export const COMBO_MOVE = /^(hold|press|release|turn) \[([^\]]+)\](?: (.+))?$/;

/* checks the moves (no release of a key that isn't held, no hold of a key already held, no note on a release)
   and groups them */
export function parseCombo(moves) {
  const held = new Set(),
    parsed = moves.map((m) => {
      const [, act, key, note] = m.match(COMBO_MOVE) || [];
      if (!act) throw new Error(`Not a combo move: "${m}"`);
      if (act === "release" && note) throw new Error(`"${m}": a release takes no note`);
      if (act === "release" && !held.delete(key)) throw new Error(`"${m}": ${key} is not held`);
      if (act === "hold") {
        if (held.has(key)) throw new Error(`"${m}": ${key} is already held`);
        held.add(key);
      }
      return { act, key, note };
    });
  /* releases at the very end close the combo; a key let go only there still counts as held throughout */
  let end = parsed.length;
  while (end > 0 && parsed[end - 1].act === "release") end--;
  const tail = parsed.slice(end).map((x) => x.key);
  const releasedMid = new Set(
    parsed
      .slice(0, end)
      .filter((x) => x.act === "release")
      .map((x) => x.key)
  );
  let i = 0;
  const outer = [];
  while (i < end && parsed[i].act === "hold" && !parsed[i].note && !releasedMid.has(parsed[i].key))
    outer.push(parsed[i++].key);
  const rows = [];
  let cur = { keys: [], letGo: [] };
  for (; i < end; i++) {
    const x = parsed[i];
    if (x.act === "release") cur.letGo.push(x.key);
    else {
      cur.keys.push(x);
      if (x.act !== "hold" || x.note) {
        rows.push(cur);
        cur = { keys: [], letGo: [] };
      }
    }
  }
  if (cur.keys.length) rows.push(cur);
  return { outer, rows, letGo: tail };
}

export function renderCombo(I, moves) {
  const { outer, rows, letGo } = parseCombo(moves);
  const cap = (k, cls) => keyify(I, `[${k}]`, "").replace('class="k ', `class="k ${cls} `);
  const words = (x) => `${x.act} ${x.key}${x.note ? " " + x.note : ""}`;
  const label = [
    ...(outer.length ? [`hold ${outer.join(" and ")} until the end`] : []),
    ...rows.map((r) => [...r.letGo.map((k) => `let go of ${k}`), ...r.keys.map(words)].join(", ")),
    ...(letGo.length ? [`let go of ${letGo.join(" and ")}`] : []),
  ];
  const plus = `<span class="combo-plus">+</span>`;
  const row = (n, body) =>
    `<div class="combo-row"><span class="combo-n">${n}</span><span class="combo-body">${body}</span></div>`;
  let n = 0;
  let h = `<div class="combo" role="img" aria-label="${esc("Key combo: " + label.map((t, i) => `${i + 1}. ${t}`).join(" "))}">`;
  if (outer.length)
    h += row(
      ++n,
      `<span class="combo-keys">${outer.map((k) => cap(k, "hold")).join(plus)}</span><span class="combo-note">hold until the end</span>`
    );
  h += `<div class="combo-rows${outer.length ? " held" : ""}">`;
  rows.forEach((r) => {
    const keys = r.keys.map((x) => cap(x.key, x.act === "hold" ? "hold" : x.act)).join(plus);
    const last = r.keys.at(-1);
    const pre = r.letGo.length
      ? `<span class="combo-note">let go of ${r.letGo.map((k) => cap(k, "")).join(" ")}, then</span>`
      : "";
    const post = last && last.note ? `<span class="combo-note">${esc(last.note)}</span>` : "";
    h += row(++n, `${pre}<span class="combo-keys">${keys}</span>${post}`);
  });
  h += `</div>`;
  if (letGo.length)
    h += row(++n, `<span class="combo-note">let go of ${letGo.map((k) => cap(k, "")).join(" ")}</span>`);
  return h + `</div>`;
}
