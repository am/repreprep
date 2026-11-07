/* ---------- Model:Cycles key icons ----------
   The one drawing of each icon printed on a key, by control id. The panel drawing (controls.js) and the key caps
   in step text (iconSvg) both use these, so an icon changes everywhere at once.
   Traced from a photo of the keys. Drawn in a 20x20 box centred on 0,0, as lines (stroked, not filled); the solid
   arrowheads are a triangle with a smaller one inside, so the stroke fills them in. */
export const CYCLES_ICONS = {
  /* a drum seen from above: the head, and the shell with three staves */
  machines:
    '<ellipse cx="0" cy="-3.6" rx="7" ry="3.2"/><path d="M-7 -3.6V3Q-7 6.8 0 6.8Q7 6.8 7 3V-3.6M-3.4 -0.1V6.4M0 0.2V6.8M3.4 -0.1V6.4"/>',
  /* a boxing glove from the side: cuff on the left, thumb curled over the top */
  punch:
    '<path d="M-3.8 -3.4Q-3.8 -7 0 -7H3.6Q7.4 -7 7.4 -3.4V3.4Q7.4 7 3.6 7H0Q-3.8 7 -3.8 3.4Z"/><path d="M-3.8 -2.6H-7.4V3.4H-3.8M-5.6 -2.6V3.4"/><path d="M-1.6 -4.8Q2.2 -6.6 4.6 -5.2Q6.2 -3.6 3.6 -3.2Q1.4 -3 1.4 0.4V7"/>',
  /* a two-way arrow over a held note (left) and its decay (right) */
  gate: '<path d="M-5.4 -5.6H5.4"/><path d="M-4.6 -7.4L-7 -5.6L-4.6 -3.8ZM-5.2 -6.2L-6 -5.6L-5.2 -5Z"/><path d="M4.6 -7.4L7 -5.6L4.6 -3.8ZM5.2 -6.2L6 -5.6L5.2 -5Z"/><path d="M-3.6 -0.6V6.4M2.6 -0.6Q3.6 4.4 6.6 6.4"/>',
  /* one cycle of a wave, with softened corners */
  lfo: '<path d="M-7.2 1.6L-4 -1.8Q-3.4 -2.4 -2.8 -1.8L2.6 3.2Q3.2 3.8 3.8 3.2L7.2 -0.4"/>',
  /* a return arrow: left along the top, down the right, back along the bottom */
  back: '<path d="M-7 -3L-3.4 -6V0ZM-5.4 -3L-4.2 -4V-2Z"/><path d="M-3.6 -3H4.8V5.6H-5"/>',
  /* an open-ended wrench, head up */
  settings:
    '<path d="M-1.4 -7.4V-4Q-1.4 -2.6 0 -2.6Q1.4 -2.6 1.4 -4V-7.4H3Q6 -6.4 6 -3.4Q6 0 2 1.4V3.8H2.4Q3.4 3.8 3.4 4.8V6.4Q3.4 7.6 2.2 7.6H-2.2Q-3.4 7.6 -3.4 6.4V4.8Q-3.4 3.8 -2.4 3.8H-2V1.4Q-6 0 -6 -3.4Q-6 -6.4 -3 -7.4Z"/>',
  /* a metronome: the case and its pendulum swung out to the right */
  tempo: '<path d="M-1.2 -6L-7.2 6.4H6.6Z"/><path d="M-0.2 2.6L7 -4.4"/>',
  record: '<circle cx="0" cy="0" r="6.6"/>',
  play: '<path d="M-4.6 -6.8L6.6 0L-4.6 6.8Z"/>',
  stop: '<rect x="-6" y="-6" width="12" height="12" rx="1.6"/>',
};
/* the icon of a key as an inline SVG for text, or "" for a key printed without one */
export const iconSvg = (id, cls = "ico") =>
  CYCLES_ICONS[id] ? `<svg class="${cls}" viewBox="-10 -10 20 20" aria-hidden="true">${CYCLES_ICONS[id]}</svg>` : "";
