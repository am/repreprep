/* Small string helpers shared by the drawings, the grids and the step text. Everything here
   returns HTML strings, so the same code renders pages at build time and updates them in the browser. */
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export const ROWC={kick:"var(--led)",snare:"var(--hold)",rim:"var(--hold)",clap:"var(--hold)",hat:"var(--turn)",ohat:"var(--turn)",perc:"var(--done)",shaker:"var(--done)",keys:"var(--turn)",pluck:"var(--hold)",bass:"var(--led)"};
export const COUNT16=["1","e","&","a","2","e","&","a","3","e","&","a","4","e","&","a"];
export const svgFig=(vb,body,label)=>`<svg class="fig" viewBox="${vb}" role="img" aria-label="${esc(label)}">${body}</svg>`;
export const T=(x,y,s,cls="",a="middle")=>`<text x="${x}" y="${y}" text-anchor="${a}" class="${cls}">${s}</text>`;
/* step pattern helper: "1,5,9,13" -> 16 velocities; "1:.4" sets a velocity */
export function hits(list,vel=.85){const v=Array(16).fill(0);String(list).split(",").filter(Boolean).forEach(tok=>{const [s,vv]=tok.split(":");v[+s-1]=vv?+vv:vel;});return v;}
