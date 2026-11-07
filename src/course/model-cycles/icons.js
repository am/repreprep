/* ---------- Model:Cycles key icons ----------
   The one drawing of each icon printed on a key, by control id. The panel drawing (controls.js) and the key caps
   in step text (iconSvg) both use these, so an icon changes everywhere at once.
   Drawn in a 20x20 box centred on 0,0, as lines (stroked, not filled). */
export const CYCLES_ICONS = {
  machines:
    '<ellipse cx="0" cy="-4" rx="6.5" ry="2.6"/><path d="M-6.5 -4V4.5A6.5 2.6 0 0 0 6.5 4.5V-4M-3 -1.5V6.5M3 -1.5V6.5"/>',
  punch:
    '<path d="M-4 7V-1.5Q-4 -7 1.5 -7Q6 -7 6 -2.5V3Q6 7 2 7Z"/><path d="M-4 0Q-7 -0.5 -6.5 3Q-6 5.5 -4 5.5M-2 -3H4"/>',
  gate: '<path d="M-7 6H-4.5V-5H3.5V6H7"/><path d="M-1.5 -1.5L1 1L-1.5 3.5"/>',
  lfo: '<path d="M-7.5 0C-5.5 -7 -3 -7 0 0S5.5 7 7.5 0"/>',
  back: '<path d="M6 6V-1H-5.5"/><path d="M-2.5 -4.5L-6 -1L-2.5 2.5"/>',
  settings: '<path d="M-4.5 -7V-3A4.5 4.5 0 0 0 4.5 -3V-7"/><path d="M-1.6 1.3V7.5H1.6V1.3"/>',
  tempo: '<path d="M-6 7L-2.5 -7H2.5L6 7Z"/><path d="M0 3.5L5 -5"/>',
  record: '<circle cx="0" cy="0" r="6"/>',
  play: '<path d="M-4.5 -6.5L6 0L-4.5 6.5Z"/>',
  stop: '<rect x="-5.5" y="-5.5" width="11" height="11" rx="1.5"/>',
};
/* the icon of a key as an inline SVG for text, or "" for a key printed without one */
export const iconSvg = (id, cls = "ico") =>
  CYCLES_ICONS[id] ? `<svg class="${cls}" viewBox="-10 -10 20 20" aria-hidden="true">${CYCLES_ICONS[id]}</svg>` : "";
