/* Page markup for the routed site. Pages are built ahead of time with no progress in them;
   the browser script (src/client/app.js) then fills in ticks, progress dots and notes. */
import { esc } from "./shared/html.js";
import { linkSongs } from "./shared/songs.js";
import { KIND, keyify, keyCap, fmtStep, hearNote, quiz, withHl } from "./shared/text.js";
import { wkLabel, stepPath, nextLesson, renderFig } from "./index.js";

const prog = (l) => `<span class="s" data-prog="${l.id}"></span>`;
const lessonLink = (l, cls, cur, inner) =>
  `<a class="${cls}" href="${l.path}" data-lesson="${l.id}" data-path="${l.path}" aria-current="${l === cur}">${inner}</a>`;

/* lesson picker in the player header: every lesson grouped by unit, one click to jump */
function lessonMenu(I, L) {
  const groups = [];
  const add = (u, html) => { let g = groups.find((g) => g.u === u); if (!g) groups.push((g = { u, h: "" })); g.h += html; };
  I.lessons.filter((l) => !l.song).forEach((l) => add(l.unit || "", lessonLink(l, "pm-i", L, `<span class="n">${l.short}</span><span class="t">${esc(l.title)}</span>${prog(l)}`)));
  (I.soon || []).forEach(([w, u, t]) => add(u, `<div class="pm-i soon"><span class="n">L${String(w).padStart(2, "0")}</span><span class="t">${esc(t)}</span><small>soon</small></div>`));
  I.lessons.filter((l) => l.song).forEach((l) => add("Song studies", lessonLink(l, "pm-i", L, `<span class="n">${l.short}</span><span class="t">${esc(l.title)}</span>${prog(l)}`)));
  return `<div class="pmenu">${groups.map((g) => `<div class="pm-g"><div class="pm-h">${esc(g.u)}</div>${g.h}</div>`).join("")}</div>`;
}

function introCard(I, L) {
  const ideas = (L.concepts || []).map((c) => `<li>${esc(c.h)}</li>`).join("");
  return `<div class="introcard"><div class="t-eyebrow">${wkLabel(L)} · ${L.unit ? esc(L.unit) + " · " : ""}about ${L.minutes} min</div>
    <h3 class="t-title">${esc(L.title)}</h3>
    <p class="ptxt t-body"><b>You will learn to</b> ${esc(L.goal.charAt(0).toLowerCase() + L.goal.slice(1))}</p>
    ${ideas ? `<div class="ideas t-body"><div class="t-label">Ideas in this lesson</div><ul>${ideas}</ul></div>` : ""}
    ${L.listen ? `<p class="t-note"><span class="t-label">Listen first</span>${linkSongs(esc(L.listen))}</p>` : ""}</div>`;
}

/* the step player: drawing or panel on the left, the step on the right */
export function player(I, L, act) {
  const st = L.steps[act];
  const k = st.k || "play";
  const last = act === L.steps.length - 1;
  const nx = nextLesson(I, L);
  const dots = L.steps.map((s, i) => { const lab = s.intro || s.k === "intro" ? "Intro" : KIND[s.k || "play"]; return `<a href="${stepPath(L, i)}" data-step="${i}" aria-current="${i === act}" aria-label="${lab}, step ${i + 1}" title="${lab}"></a>`; }).join("");
  const stage = st.fig ? `<div class="figwrap">${renderFig(I, st.fig, L.id + ":" + act)}</div>` : withHl(I.draw(), st.hl);
  const back = act === 0 ? `<button class="btn" disabled aria-label="Previous step">Back</button>` : `<a class="btn" href="${stepPath(L, act - 1)}" data-nav="-1" aria-label="Previous step">Back</a>`;
  const nextHref = last ? (nx ? nx.path : L.path) : stepPath(L, act + 1);
  const next = `<a class="btn primary" href="${nextHref}" data-nav="1">${last ? "Finish" : act === 0 ? "Start" : "Next"}</a>`;
  return `<section class="player" id="player" aria-label="Step player" data-inst="${I.key}" data-lesson="${L.id}" data-step="${act}" data-steps="${L.steps.length}"${nx ? ` data-next="${nx.id}" data-next-path="${nx.path}"` : ""}>
    <div class="phead"><details class="picker"><summary class="ttl" title="Jump to another lesson">${wkLabel(L)} · ${esc(L.title)}<span class="caret" aria-hidden="true"></span></summary>${lessonMenu(I, L)}</details><div class="dots" style="--p:${L.steps.length > 1 ? act / (L.steps.length - 1) : 0}">${dots}</div><button class="maxbtn" data-max>Maximize</button></div>
    <div class="pbody" id="pbody"><div class="pstage">${stage}</div><div class="gutter" id="gutter" role="separator" aria-orientation="vertical" aria-label="Resize the step panel" tabindex="0" title="Drag to resize · double-click to reset"></div>
      <div class="pstep" id="now"><div class="h"><span class="kind k-${k}">${KIND[k]}</span><span data-donemark hidden> · done</span></div>
        ${st.intro ? introCard(I, L) : `<div class="ptxt">${fmtStep(I, st)}</div>`}${st.q ? quiz(I, st) : st.a ? `<details class="ans"><summary>Show the answer</summary><p>${keyify(I, st.a, "")}</p></details>` : ""}${st.hear ? hearNote(I, st) : ""}
        <div class="ctl" id="ctlinfo" hidden></div>
        <div class="grow"></div>
        <div class="legend"${k !== "play" ? " hidden" : ""}>${keyCap("PRESS", "press")}${keyCap("HOLD", "hold")}${keyCap("TURN", "turn")}<button type="button" class="hint" aria-label="Tips: click a control to learn it. Left and right arrow keys move between steps.">i<span class="tip" aria-hidden="true">Click a control to learn it. The ← → keys move between steps.</span></button></div>
        <div class="navrow">${back}${next}</div>
      </div></div>
  </section>`;
}

/* the lesson text below the player: ideas, every step as a list, challenge, notes */
/* under the player: only what the steps don't already hold (the challenge, your notes, finishing).
   The ideas and steps themselves live in the player, so they aren't repeated here. */
export function lessonText(I, L) {
  const nx = nextLesson(I, L);
  return `<section class="wrapup stack" aria-label="After the lesson">
    <section class="card challenge"><div class="t-eyebrow">This lesson's challenge</div><p class="t-body">${keyify(I, L.challenge, "")}</p></section>
    <div class="notes"><label for="notes-${L.id}">Your notes for ${wkLabel(L).toLowerCase()}</label><textarea id="notes-${L.id}" data-notes="${L.id}" placeholder="Presets you liked, what was hard, ideas for next time"></textarea></div>
    <div class="finish"><button class="btn primary" data-finish="${L.id}" data-label="${L.song ? "Mark study complete" : "Mark lesson complete"}">${L.song ? "Mark study complete" : "Mark lesson complete"}</button><span class="stamp" hidden></span>${nx && !L.song ? `<a class="btn" href="${nx.path}" data-lesson="${nx.id}" data-path="${nx.path}">Next lesson →</a>` : ""}</div>
    <a class="back-all" href="/${I.slug}">← All lessons and your progress</a>
  </section>`;
}

export function panelGuide(I, sel) {
  const c = I.controls[sel];
  return `<p class="lede t-body">Every key and knob on the ${I.name}, with what it does. Click any control on the panel. ${keyify(I, I.panelIntro || "", "")}</p>
  <div class="refgrid"><div class="dockpanel" data-panel-guide="/${I.slug}/panel">${withHl(I.draw(), "", sel)}</div><div class="info" id="info"><div class="t-eyebrow">${esc(c.kind)}</div><h3 class="t-title t-card">${esc(c.name)}</h3><p class="t-body">${keyify(I, c.desc, "")}</p>${c.sub ? `<p class="t-body"><span class="t-label">Second label on the panel</span><b>${esc(c.sub)}</b></p>` : ""}</div></div>`;
}
export function machines(I) {
  return `<p class="lede t-body">The six machines and what their four machine knobs do, from the machine table and tips in Elektron’s Model:Cycles manual (OS 1.13).</p>
  <div class="bands">${I.machines.map((m) => `<section class="band"><div class="band-h"><div class="t-eyebrow">${esc(m.tag)}</div><h3 class="t-title t-card">${m.n}</h3></div><div class="band-b"><p class="t-body">${esc(m.p)}</p><dl class="spec">${Object.entries(m.m).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl></div></section>`).join("")}
  <section class="band"><div class="band-h"><div class="t-eyebrow">All machines</div><h3 class="t-title t-card">Every machine also has</h3></div><div class="band-b"><dl class="spec"><dt>PITCH</dt><dd>-24 to +24 semitones</dd><dt>DECAY</dt><dd>0–127, length of the sound</dd><dt>VOL+DIST</dt><dd>60 is clean; above adds level and distortion</dd><dt>PUNCH</dt><dd>compression-like accent</dd><dt>GATE</dt><dd>hold notes for their LEN</dd><dt>LFO</dt><dd>one per track, 7 waves: triangle, sine, square, saw, envelope, ramp, random</dd></dl></div></section></div>`;
}
export function shortcuts(I) {
  return `<p class="lede t-body">The combinations you'll use most, from the manual's key-shortcut list.</p><div class="tblwrap"><table class="sc"><tbody>${I.shortcuts.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${keyify(I, b, "")}</td></tr>`).join("")}</tbody></table></div>`;
}

/* instrument home: the whole course as open bands, one per unit */
export function courseMap(I) {
  const groups = [];
  I.lessons.forEach((l) => { const u = l.song ? "Song studies" : l.unit || ""; let g = groups.find((g) => g.u === u); if (!g) groups.push((g = { u, ls: [] })); g.ls.push(l); });
  return groups.map((g) => `<section class="band unit"><h3 class="band-h t-eyebrow">${esc(g.u)}<small class="t-label">${g.ls.length} ${g.ls[0].song ? "studies" : "lessons"}</small></h3><div class="ls" style="--rows:${Math.ceil(g.ls.length / 2)}">${g.ls.map((l) => lessonLink(l, "wk", null, `<span class="n">${l.short}</span><span class="t">${esc(l.title)}${l.song ? `<small class="by">${esc(l.song.split(" – ")[0])}</small>` : ""}</span>${prog(l)}`)).join("")}</div></section>`).join("");
}
