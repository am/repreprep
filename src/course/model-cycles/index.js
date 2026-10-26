import { CYCLES_CONTROLS, iconSvg, drawCycles } from "./controls.js";
import { FIGS } from "./figures/index.js";
import { CYCLES_MACHINES, CYCLES_SHORTCUTS, CYCLES_SAVING } from "./reference.js";
import { lessonFiles } from "./projects.js";

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
  shortcuts: CYCLES_SHORTCUTS,
  saving: CYCLES_SAVING,
  projects: lessonFiles /* lesson number -> { start, done }: project files to load (projects.js) */,
  panelIntro:
    "The underlined second labels are reached with [FUNC] held, except NUDGE and COND (hold a trig) and BANK (hold [PATTERN]).",
  foot: "Built from the Elektron Model:Cycles user manual (OS 1.x). The panel drawing is traced from Elektron’s own top-down photo of the unit, with every label as printed.",
};
