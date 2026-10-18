/* ============================================================
   COURSE DATA. Add an instrument by adding an entry to INSTRUMENTS
   with: key (progress key), slug (URL), name, controls, icon, draw, figs, lessons, machines, shortcuts.
   ============================================================ */
import { MODEL_CYCLES } from "./model-cycles/index.js";
import { esc } from "./shared/html.js";
import { renderGrid } from "./shared/grid.js";

export const INSTRUMENTS=[
  MODEL_CYCLES,
  {key:"microfreak", slug:"microfreak", name:"MicroFreak", ready:false},
  {key:"live", slug:"live", name:"Ableton Live", ready:false},
];
export const instrumentBySlug=slug=>INSTRUMENTS.find(i=>i.slug===slug);
/* the instruments that have a course; every course page is built for each of them */
export const READY=INSTRUMENTS.filter(I=>I.ready);

export const lessonLabel=L=>L.song?"Song study":"Lesson "+L.number;
export const pad2=n=>String(n).padStart(2,"0");
/* the goal as it reads after "you will": "Feel the beat" -> "feel the beat" */
export const goalPhrase=L=>L.goal.charAt(0).toLowerCase()+L.goal.slice(1);
/* lessons grouped by unit, in course order, with song studies as the last group */
export function byUnit(lessons){
  const groups=[];
  lessons.forEach(l=>{const u=l.song?"Song studies":l.unit||"";let g=groups.find(g=>g.u===u);if(!g)groups.push(g={u,ls:[]});g.ls.push(l);});
  return groups;
}
const slugify=s=>s.normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

/* every lesson opens with an intro step: what you will learn, how long, what to listen to.
   Step ids stay the old ones (lesson id + ":" + index, intro = 0), so saved progress keeps working. */
READY.forEach(I=>I.lessons.forEach((L,i)=>{
  L.steps.unshift({intro:true,k:"intro",hl:"",t:`${lessonLabel(L)}: ${L.title}. In this lesson you will ${goalPhrase(L)}`});
  L.slug=L.song?slugify(L.title):pad2(L.number);
  L.path=`/${I.slug}/${L.song?"songs":"lessons"}/${L.slug}`;
  L.short=L.song?"S"+pad2(I.lessons.filter(l=>l.song).indexOf(L)+1):"L"+pad2(L.number);
}));
export const stepPath=(L,i)=>i?`${L.path}/${i}`:L.path;
export const nextLesson=(I,L)=>I.lessons[I.lessons.indexOf(L)+1];

/* a step's drawing: a named figure, or a playable grid whose spec travels with the page */
export function renderFig(I,f,id){
  if(!f) return "";
  if(typeof f==="string") return I.figs[f]?I.figs[f]():"";
  if(f.grid) return `<div class="gridhost" data-grid="${esc(id)}" data-spec="${esc(JSON.stringify(f.grid))}">${renderGrid(f.grid,id)}</div>`;
  return "";
}
