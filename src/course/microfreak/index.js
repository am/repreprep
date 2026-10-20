import { MF_CONTROLS } from "./controls.js";
import { drawMicroFreak } from "./panel.js";
import { MF_FIGS } from "./figures.js";
import { MF_MACHINES, MF_MACHINES_COMMON, MF_SHORTCUTS, MF_SAVING } from "./reference.js";

/* The lessons are YAML files in src/content/lessons/microfreak. */
export const MICROFREAK = {
  key: "microfreak",
  slug: "microfreak",
  name: "MicroFreak",
  ready: true,
  controls: MF_CONTROLS,
  icon: () => "",
  draw: drawMicroFreak,
  figs: MF_FIGS,
  machines: MF_MACHINES,
  machinesTab: "Oscillators",
  machinesIntro:
    "The 22 oscillator types and what Wave, Timbre and Shape do on each, from the oscillator chapter of Arturia’s MicroFreak manual (firmware 5).",
  machinesCommon: ["Every type", "Shared by all of them", MF_MACHINES_COMMON],
  shortcuts: MF_SHORTCUTS,
  saving: MF_SAVING,
  savingIntro: "When your sound is saved, and what a preset keeps. From Arturia’s MicroFreak manual (firmware 5).",
  panelIntro:
    "The blue labels are reached with [Shift] held. Above the keys, each touch icon has two jobs: the first name for the arpeggiator, the second for the sequencer.",
  foot: "Built from the Arturia MicroFreak user manual (firmware 5.0). The panel drawing is traced from Arturia’s own top-down image of the instrument, with every label as printed.",
};
