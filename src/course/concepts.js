/* The drawings of the shared steps (src/content/concepts), which any course can show. They were drawn for the
   Model:Cycles course and name no device, so they are borrowed from its figures. */
import { FIGS } from "./model-cycles/figures/index.js";

const SHARED = ["swing", "u2four", "u2adsr", "u2waves", "u2spectrum", "u3keys", "u3contour"];
export const CONCEPT_FIGS = Object.fromEntries(SHARED.map((n) => [n, FIGS[n]]));
