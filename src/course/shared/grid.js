import { esc, COUNT16, ROWC } from "./html.js";

/* A playable step grid. The page is built with the grid's spec in data-spec, so the browser can
   play it and redraw it when you edit a square or switch presets. G is the spec (with cur = preset index). */
export const gridPreset=G=>G.presets?G.presets[G.cur||0]:G;
export function renderGrid(G,id,playing=false){
  const P=gridPreset(G),n=16,cur=G.cur||0;
  const tabs=G.presets?`<div class="gtabs">${G.presets.map((p,i)=>`<button data-gpre="${i}" data-g="${id}" aria-pressed="${i===cur}">${esc(p.name)}</button>`).join("")}</div>`:"";
  const head=`<div class="grow0"></div>${COUNT16.map((c,i)=>`<div class="hd ${i%4===0?"b":""}">${c}<small class="${i%4===0?"u":""}">${i+1}</small></div>`).join("")}`;
  const rows=P.rows.map((r,ri)=>`<div class="rl">${esc(r.n)}${r.len&&r.len<n?`<small>${r.len} steps</small>`:""}</div>`+Array.from({length:n},(_,i)=>{const v=r.v[i]||0;const out=r.len&&i>=r.len;const off=(r.off&&r.off[i])||0;
    return `<button class="cell ${v?"on":""} ${out?"out":""} ${i%4===0?"bt":""}" data-g="${id}" data-r="${ri}" data-i="${i}" ${out?"disabled":""} aria-label="${esc(r.n)} step ${i+1}${v?" on":""}" style="--c:${ROWC[r.s]};--v:${v}"><i${off?` style="transform:translateX(${off*100}%)"`:""}></i></button>`;}).join("")).join("");
  const sw=G.swingCtl?`<label class="gsw">Swing <input type="range" min="50" max="75" step="1" value="${P.swing||50}" data-gswing="${id}"><b>${P.swing||50}%</b></label>`:"";
  return `<div class="gp" data-gid="${id}">${G.title?`<div class="gt">${esc(G.title)}</div>`:""}${tabs}
    <div class="gg" style="--n:${n}">${head}${rows}</div>
    <div class="gctl"><button class="btn primary" data-gplay="${id}">${playing?"Stop":"Play"}</button><span class="gbpm">${P.bpm} BPM</span>${sw}${G.note?`<span class="gnote">${esc(P.note||G.note)}</span>`:P.note?`<span class="gnote">${esc(P.note)}</span>`:""}</div>
    <p class="ghint">${G.edit===false?"Press Play to hear it.":"Click a square to add or remove a hit, then press Play."}</p></div>`;
}
