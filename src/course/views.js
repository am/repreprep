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
  I.lessons.filter((l) => l.song).forEach((l) => add("Song studies", lessonLink(l, "pm-i", L, `<span class="n">${l.short}</span><span class="t">${esc(l.title)}</span>${prog(l)}`)));
  return `<div class="pmenu">${groups.map((g) => `<div class="pm-g"><div class="pm-h">${esc(g.u)}</div>${g.h}</div>`).join("")}</div>`;
}

function introCard(I, L) {
  const ideas = (L.concepts || []).map((c) => `<li>${esc(c.h)}</li>`).join("");
  return `<div class="introcard"><div class="t-eyebrow">${wkLabel(L)}${L.unit ? " · " + esc(L.unit) : ""}</div>
    <h3 class="t-title">${esc(L.title)}</h3>
    <p class="ptxt t-body"><b>You will learn to</b> ${esc(L.goal.charAt(0).toLowerCase() + L.goal.slice(1))}</p>
    ${ideas ? `<div class="ideas t-body"><div class="t-label">Ideas in this lesson</div><ul>${ideas}</ul></div>` : ""}
    ${L.listen ? `<p class="t-note"><span class="t-label">Listen first</span>${linkSongs(esc(L.listen))}</p>` : ""}</div>`;
}

/* the step player: drawing or panel on the left, the step on the right */
/* the challenge is an optional extra step after the last one: same player, its own kind, and Finish moves there */
export const hasChallenge = (L) => !!L.challenge;
export function player(I, L, act) {
  const n = L.steps.length, total = n + (hasChallenge(L) ? 1 : 0);
  const ch = act === n;
  const st = ch ? { k: "challenge" } : L.steps[act];
  const k = st.k || "play";
  const end = act === total - 1;
  const nx = nextLesson(I, L);
  const dots = L.steps.map((s, i) => { const lab = KIND[s.k || "play"]; return `<a href="${stepPath(L, i)}" data-step="${i}" aria-current="${i === act}" aria-label="${lab}, step ${i + 1}" title="${lab}"></a>`; }).join("")
    + (hasChallenge(L) ? `<a class="opt" href="${stepPath(L, n)}" data-step="${n}" aria-current="${ch}" aria-label="Challenge (optional)" title="Challenge (optional)"></a>` : "");
  const stage = st.fig ? `<div class="figwrap">${renderFig(I, st.fig, L.id + ":" + act)}</div>` : withHl(I.draw(), st.hl);
  const back = act === 0 ? `<button class="btn" disabled aria-label="Previous step">Back</button>` : `<a class="btn" href="${stepPath(L, act - 1)}" data-nav="-1" aria-label="Previous step">Back</a>`;
  const nextHref = end ? (nx ? nx.path : L.path) : stepPath(L, act + 1);
  const next = `<a class="btn primary" href="${nextHref}" data-nav="1"${end ? " data-end" : ""}>${end ? "Finish" : act === 0 ? "Start" : "Next"}</a>`;
  const body = ch ? `<div class="ptxt"><p>${keyify(I, L.challenge, "")}</p></div><p class="t-note">Optional. Try it now, or come back to it any time.</p>`
    : `${st.intro ? introCard(I, L) : `<div class="ptxt">${fmtStep(I, st)}</div>`}${st.q ? quiz(I, st) : ""}${st.hear ? hearNote(I, st) : ""}`;
  return `<section class="player" id="player" aria-label="Step player" data-inst="${I.key}" data-lesson="${L.id}" data-step="${act}" data-steps="${n}"${nx ? ` data-next="${nx.id}" data-next-path="${nx.path}"` : ""}>
    <div class="phead"><details class="picker"><summary class="ttl" title="Jump to another lesson">${wkLabel(L)} · ${esc(L.title)}<span class="caret" aria-hidden="true"></span></summary>${lessonMenu(I, L)}</details><div class="dots" style="--p:${total > 1 ? act / (total - 1) : 0}">${dots}</div><button class="maxbtn" type="button" data-max aria-label="Maximize" title="Maximize"><svg class="mx-in" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/></svg><svg class="mx-out" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4"/></svg></button></div>
    <div class="pbody" id="pbody"><div class="pstage">${stage}</div><div class="gutter" id="gutter" role="separator" aria-orientation="vertical" aria-label="Resize the step panel" tabindex="0" title="Drag to resize · double-click to reset"></div>
      <div class="pstep" id="now"><div class="h"><span class="kind k-${k}">${KIND[k]}</span>${ch ? " · optional" : ""}</div>
        ${body}
        <div class="ctl" id="ctlinfo" hidden></div>
        <div class="grow"></div>
        <div class="pfoot">
          <div class="legend"${k !== "play" ? " hidden" : ""}>${keyCap("PRESS", "press")}${keyCap("HOLD", "hold")}${keyCap("TURN", "turn")}<button type="button" class="hint" aria-label="Tips: click a control to learn it. Left and right arrow keys move between steps.">i<span class="tip" aria-hidden="true">Click a control to learn it. The ← → keys move between steps.</span></button></div>
          <div class="navrow">${back}${next}</div>
        </div>
      </div></div>
  </section>`;
}

/* under the player: your notes (read, then Edit to write) and finishing the lesson.
   The steps and the challenge live in the player, so they aren't repeated here. */
export function lessonText(I, L) {
  return `<section class="wrapup stack" aria-label="After the lesson">
    <section class="notebox" data-notebox="${L.id}" aria-labelledby="nb-${L.id}">
      <div class="nb-h"><h2 class="t-title t-card" id="nb-${L.id}">Notes</h2><button type="button" class="btn" data-note-edit>Add a note</button></div>
      <div class="nb-view"><p class="t-body nb-text" hidden></p><p class="t-note nb-empty">Nothing yet. Presets you liked, what was hard, ideas for next time.</p></div>
      <div class="nb-edit" hidden><textarea aria-label="Notes for ${wkLabel(L).toLowerCase()}" placeholder="Presets you liked, what was hard, ideas for next time"></textarea><div class="row"><button type="button" class="btn primary" data-note-save>Save</button><button type="button" class="btn" data-note-cancel>Cancel</button></div></div>
      <p class="t-note nb-stamp" hidden>Saved in this browser.</p>
    </section>
    <div class="finish"><button class="btn primary" data-finish="${L.id}" data-label="Complete" title="Mark this ${L.song ? "study" : "lesson"} done and open the next one">Complete</button><a class="btn" href="/${I.slug}">All lessons</a><span class="stamp" hidden></span></div>
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
