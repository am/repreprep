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

/* three kinds of lesson: the main course ("lesson"), Modded Cycles lessons for custom firmware ("mod")
   and song studies ("song"). Each kind has its own address folder and short label. */
export const kindOf=L=>L.song?"song":L.mod?"mod":"lesson";
const KINDS={lesson:{dir:"lessons",pre:"L"},mod:{dir:"mods",pre:"M"},song:{dir:"songs",pre:"S"}};
export const wkLabel=L=>L.song?"Song study":L.mod?"Modded Cycles":"Lesson "+L.week;
export const pad2=n=>String(n).padStart(2,"0");
const slugify=s=>s.normalize("NFKD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

/* every lesson opens with an intro step: what you will learn, how long, what to listen to.
   Step ids stay the old ones (lesson id + ":" + index, intro = 0), so saved progress keeps working. */
INSTRUMENTS.filter(I=>I.ready).forEach(I=>I.lessons.forEach((L,i)=>{
  const g=L.goal.charAt(0).toLowerCase()+L.goal.slice(1);
  L.steps.unshift({intro:true,k:"intro",hl:"",t:`${wkLabel(L)}: ${L.title}. In this lesson you will ${g}`});
  const k=L.kind=kindOf(L);
  L.slug=k==="lesson"?pad2(L.week):slugify(L.title);
  L.path=`/${I.slug}/${KINDS[k].dir}/${L.slug}`;
  L.short=KINDS[k].pre+pad2(k==="lesson"?L.week:I.lessons.filter(l=>kindOf(l)===k).indexOf(L)+1);
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
