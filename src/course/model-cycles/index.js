import { CYCLES_CONTROLS, iconSvg, drawCycles } from "./controls.js";
import { FIGS } from "./figures/index.js";
import { CYCLES_LESSONS } from "./lessons/unit1.js";
import { UNIT_2_LESSONS } from "./lessons/unit2.js";
import { UNIT_3_LESSONS } from "./lessons/unit3.js";
import { UNIT_4_LESSONS } from "./lessons/unit4.js";
import { SONG_LESSONS } from "./lessons/songs.js";
import { CYCLES_SOON, CYCLES_MACHINES, CYCLES_SHORTCUTS } from "./reference.js";

/* Lessons run in this order; song studies come last. */
const lessons=[...CYCLES_LESSONS,...UNIT_2_LESSONS,...UNIT_3_LESSONS,...UNIT_4_LESSONS,...SONG_LESSONS];

export const MODEL_CYCLES={
  key:"cycles", slug:"model-cycles", name:"Model:Cycles", ready:true,
  controls:CYCLES_CONTROLS, icon:iconSvg, draw:drawCycles, figs:FIGS,
  lessons, soon:CYCLES_SOON.filter(([w])=>!lessons.some(l=>l.week===w)),
  machines:CYCLES_MACHINES, shortcuts:CYCLES_SHORTCUTS,
  panelIntro:"The underlined second labels are reached with [FUNC] held, except NUDGE and COND (hold a trig) and BANK (hold [PATTERN]).",
  foot:"Built from the Elektron Model:Cycles user manual (OS 1.x). The panel drawing is traced from Elektron’s own top-down photo of the unit, with every label as printed.",
};
