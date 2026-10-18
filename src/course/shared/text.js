import { esc } from "./html.js";
import { songLink } from "./songs.js";

/* Step text: [KEY] becomes a keycap (coloured by the step's hl), quoted song titles become Spotify links,
   and Play steps are split into one bullet per sentence. */
export const KIND={intro:"Intro",learn:"Learn",play:"Play",check:"Check"};
export function parseHl(s){const r={press:[],hold:[],turn:[]};(s||"").split(/\s+/).filter(Boolean).forEach(tok=>{const [k,id]=tok.split(":");({p:r.press,h:r.hold,t:r.turn})[k]?.push(id);});return r;}

const byNameCache=new WeakMap();
function byName(C){
  let m=byNameCache.get(C); if(m) return m;
  m={}; Object.entries(C).forEach(([id,c])=>{m[c.name.toUpperCase()]=id;});
  Object.assign(m,{"REC":"record","LFO":"lfo","VOLUME+DIST":"vol","VOL+DIST":"vol"});
  byNameCache.set(C,m); return m;
}
/* the one key cap used everywhere (step text, legend, control info): action is "press", "hold", "turn" or "" */
export function keyCap(label,action="",icon="",title=""){
  return `<span class="k ${action}"${title?` title="${esc(title)}"`:""}>${icon}${label}</span>`;
}
/* I = the instrument ({controls, icon}) whose keys the text names */
export function keyify(I,text,hl){
  const C=I.controls||{}; const names=byName(C); const h=parseHl(hl);
  return esc(text).replace(/\[([^\]]+)\]/g,(m,name)=>{
    let id=names[name.toUpperCase()]; let cls="";
    if(id){ if(h.hold.includes(id))cls="hold"; else if(h.turn.includes(id))cls="turn"; else if(h.press.includes(id))cls="press"; }
    const ic=id&&C[id].icon&&I.icon?I.icon(C[id].icon):"";
    return keyCap(name.replace(/^TRIG (\d+)$/i,"$1"),cls,ic,ic?C[id].kind:"");
  }).replace(/&quot;(.{2,80}?)&quot;/g,songLink);
}
export function splitSent(t){const out=[];let d=0,cur="";for(let i=0;i<t.length;i++){const c=t[i];cur+=c;if(c==="("||c==="[")d++;else if(c===")"||c==="]")d=Math.max(0,d-1);
  if(d===0&&/[.!?]/.test(c)&&t[i+1]===" "&&/[A-Z\["]/.test(t[i+2]||"")&&!/\b(e\.g|i\.e)\.$/.test(cur)){out.push(cur.trim());cur="";i++;}}
  if(cur.trim())out.push(cur.trim());return out.flatMap(x=>{const p=x.split(/, then (?![^(]*\))/);return p.map((y,i)=>i?"Then "+y:y).map((y,i,a)=>i<a.length-1&&!/[.!?]$/.test(y)?y+".":y);});}
export function fmtStep(I,st){const t=st.t||"",hl=st.hl;let lead="",body=t;
  /* a short "Title: text" prefix becomes the step's title; a sentence that merely has a colon does not */
  const m=t.match(/^([^.:,\[(]{3,48}): (.+)$/);if(m&&st.k!=="check"&&m[1].split(" ").length<=6){lead=m[1];body=m[2].charAt(0).toUpperCase()+m[2].slice(1);}
  const ss=splitSent(body);const L=lead?`<h3 class="t-title t-step">${keyify(I,lead,hl)}</h3>`:"";
  if(st.k==="learn"||st.k==="check"){if(ss.length<2)return L+`<p class="t-lead">${keyify(I,body,hl)}</p>`;return L+`<p class="t-lead">${keyify(I,ss[0],hl)}</p><p class="t-body">${keyify(I,ss.slice(1).join(" "),hl)}</p>`;}
  if(ss.length<2)return L+`<p>${keyify(I,body,hl)}</p>`;
  return L+`<ul class="pacts">${ss.map(x=>`<li>${keyify(I,x,hl)}</li>`).join("")}</ul>`;}
/* the "Listen for" / "Remember" note under a step */
export function hearNote(I,st){const r=st.k==="check";return `<p class="t-note hear${r?" done":""}"><span class="t-label">${r?"Remember":"Listen for"}</span>${keyify(I,st.hear,"")}</p>`;}
export function quiz(I,st){return `<div class="quiz"><p class="qhint">Pick an answer</p><div class="opts">${st.q.map(o=>`<button class="opt" data-opt="${o[0]==="!"?1:0}">${keyify(I,o.replace(/^!/,""),"")}</button>`).join("")}</div><p class="qmsg" hidden></p><p class="qexp" hidden>${keyify(I,st.a,"")}</p></div>`;}

/* light the controls a step uses on the panel drawing (press / hold / turn), or mark one as selected */
export function withHl(svg,hl,sel){
  const h=parseHl(hl);
  return svg.replace(/class="c" data-id="([^"]+)"/g,(m,id)=>{
    const cls=h.hold.includes(id)?" hl-hold":h.turn.includes(id)?" hl-turn":h.press.includes(id)?" hl-press":"";
    return `class="c${cls}${id===sel?" sel":""}" data-id="${id}"`;
  });
}
