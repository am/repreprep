import { CYCLES_CONTROLS, iconSvg, drawCycles } from "./controls.js";
import { FIGS } from "./figures/index.js";
import { CYCLES_MACHINES, CYCLES_MACHINES_COMMON, CYCLES_SHORTCUTS, CYCLES_SAVING } from "./reference.js";

/* The lessons are YAML files in src/content/lessons/model-cycles. */
export const MODEL_CYCLES = {
  key: "cycles",
  slug: "model-cycles",
  name: "Model:Cycles",
  ready: true,
  controls: CYCLES_CONTROLS,
  icon: iconSvg,
  draw: drawCycles,
  figs: FIGS,
  machines: CYCLES_MACHINES,
  machinesTab: "Machines",
  machinesIntro:
    "The six machines and what their four machine knobs do, from the machine table and tips in Elektron’s Model:Cycles manual (OS 1.13).",
  machinesCommon: ["All machines", "Every machine also has", CYCLES_MACHINES_COMMON],
  shortcuts: CYCLES_SHORTCUTS,
  saving: CYCLES_SAVING,
  savingIntro: "What sits inside what, and when your work is saved. From Elektron’s Model:Cycles manual (OS 1.13).",
  panelIntro:
    "The underlined second labels are reached with [FUNC] held, except NUDGE and COND (hold a trig) and BANK (hold [PATTERN]).",
  foot: "Built from the Elektron Model:Cycles user manual (OS 1.x). The panel drawing is traced from Elektron’s own top-down photo of the unit, with every label as printed.",
};
