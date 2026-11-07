/* A key combo drawn as numbered rows. A step lists its moves in `combo`, e.g. ["hold [PATTERN]",
   "hold [TRIG 1]", "press [RECORD]", "release [TRIG 1]", "hold [TRIG 4]", "hold [STOP] until the countdown ends"].
   Keys held from the start and never let go get row 1 ("hold until the end") and an amber line beside the
   rows they stay down for. Every other row is one chord: the keys held for it (amber) and the key that
   finishes it, a press (coral) or a hold "until ...". A release opens the next row with "let go of [KEY], then". */
import { esc } from "./html.js";
import { keyify } from "./text.js";

export const COMBO_MOVE = /^(hold|press|release) \[([^\]]+)\](?: (until .+))?$/;

/* checks the moves (no release of a key that isn't held, no hold of a key already held) and groups them */
export function parseCombo(moves) {
  const held = new Set(),
    parsed = moves.map((m) => {
      const [, act, key, until] = m.match(COMBO_MOVE) || [];
      if (!act) throw new Error(`Not a combo move: "${m}"`);
      if (act === "release" && !held.delete(key)) throw new Error(`"${m}": ${key} is not held`);
      if (act === "hold") {
        if (held.has(key)) throw new Error(`"${m}": ${key} is already held`);
        held.add(key);
      }
      return { act, key, until };
    });
  const released = new Set(parsed.filter((x) => x.act === "release").map((x) => x.key));
  let i = 0;
  const outer = [];
  while (i < parsed.length && parsed[i].act === "hold" && !parsed[i].until && !released.has(parsed[i].key))
    outer.push(parsed[i++].key);
  const rows = [];
  let cur = { keys: [], letGo: [] };
  for (; i < parsed.length; i++) {
    const x = parsed[i];
    if (x.act === "release") cur.letGo.push(x.key);
    else {
      cur.keys.push(x);
      if (x.act === "press" || x.until) {
        rows.push(cur);
        cur = { keys: [], letGo: [] };
      }
    }
  }
  if (cur.keys.length) rows.push(cur);
  return { outer, rows };
}

export function renderCombo(I, moves) {
  const { outer, rows } = parseCombo(moves);
  const cap = (k, cls) => keyify(I, `[${k}]`, "").replace('class="k ', `class="k ${cls} `);
  const words = (x) => (x.act === "press" ? `press ${x.key}` : `hold ${x.key}${x.until ? " " + x.until : ""}`);
  const label = [
    ...outer.map((k) => `hold ${k} until the end`),
    ...rows.map((r) => [...r.letGo.map((k) => `let go of ${k}`), ...r.keys.map(words)].join(", ")),
  ];
  let n = 0;
  let h = `<div class="combo" role="img" aria-label="${esc("Key combo: " + label.map((t, i) => `${i + 1}. ${t}`).join(" "))}">`;
  outer.forEach((k) => {
    h += `<div class="combo-row"><span class="combo-n">${++n}</span><span class="combo-body"><span class="combo-keys">${cap(k, "hold")}</span><span class="combo-note">hold until the end</span></span></div>`;
  });
  h += `<div class="combo-rows${outer.length ? " held" : ""}">`;
  rows.forEach((r) => {
    const keys = r.keys
      .map((x) => cap(x.key, x.act === "press" ? "press" : "hold"))
      .join(`<span class="combo-plus">+</span>`);
    const last = r.keys.at(-1);
    const pre = r.letGo.length
      ? `<span class="combo-note">let go of ${r.letGo.map((k) => cap(k, "")).join(" ")}, then</span>`
      : "";
    const post = last && last.until ? `<span class="combo-note">${esc(last.until)}</span>` : "";
    h += `<div class="combo-row"><span class="combo-n">${++n}</span><span class="combo-body">${pre}<span class="combo-keys">${keys}</span>${post}</span></div>`;
  });
  return h + `</div></div>`;
}
