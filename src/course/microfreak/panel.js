import { MF_CONTROLS, MX_ROWS, MX_COLS } from "./controls.js";

/* ---------- panel drawing: traced from Arturia's official top-down image (1920x1617 px; the viewBox uses
   that image's pixel coordinates, so every control sits where it really is). Knob centres come from circle
   fits on their scale rings, Matrix lights from their centroids, buttons and labels from zoomed crops. The
   image is cut off on the right: the right edge of the case and the ends of two section lines are placed
   from the manual's panel figures. ---------- */

const rad = (d) => (d * Math.PI) / 180;
const pt = (x, y, r, d) => [x + r * Math.cos(rad(d)), y + r * Math.sin(rad(d))].map((v) => v.toFixed(1)).join(" ");
/* an arc from angle a0 clockwise to a1 (degrees, 0 = 3 o'clock, 90 = 6 o'clock) */
const arc = (x, y, r, a0, a1) => `M${pt(x, y, r, a0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(x, y, r, a1)}`;

/* the LFO shape icons and the touch icons' line art, drawn around 0,0 */
const LFO_ICONS = [
  "M-9 0C-6 -9 -3 -9 0 0S6 9 9 0",
  "M-9 6L-4.5 -6L4.5 6L9 -1",
  "M-9 6L0 -6V6L9 -6V6",
  "M-9 6V-6H0V6H9V-6",
  "M-9 2H-5V-6H-1V5H3V-2H7V4H9",
  "M-9 2C-6 -8 -3 6 0 -2S6 -7 9 3",
];
const TOUCH_ICONS = {
  hold: '<path d="M-17 -12H17V6H-17Z M-8.5 -12V6 M0 -12V6 M8.5 -12V6"/><path d="M2 18V2Q2 -1 5 -1Q8 -1 8 2V10"/>',
  up: '<path d="M-15 12H-7V4H1V-4H9V-12H15"/>',
  order: '<path d="M-17 -10H17V10H-17Z M-8.5 -10V10 M0 -10V10 M8.5 -10V10"/>',
  random: '<path d="M-15 4H-9V-8H-3V10H3V-2H9V6H15"/>',
  pattern: '<path d="M-14 -8H-8 M-2 -8H6 M-12 0H-4 M4 0H14 M-15 8H-9 M-1 8H9"/>',
  spice: '<path d="M-12 10Q-2 10 6 0Q12 -8 10 -14"/><path d="M10 -14Q8 -18 4 -16"/>',
  dice: '<rect x="-15" y="-9" width="14" height="14" rx="2"/><rect x="2" y="-4" width="14" height="14" rx="2"/>',
  bend: '<path d="M-16 -8H16 M-16 8H16 M-16 0H-6L0 -10L6 0H16"/>',
};

export function drawMicroFreak() {
  const C = MF_CONTROLS,
    out = [];
  const g = (id, inner) =>
    `<g class="c" data-id="${id}" tabindex="0" role="button" aria-label="${C[id].name}">${inner}</g>`;
  const label = (x, y, t, blue, anchor = "middle") =>
    `<text class="mf-lbl" x="${x}" y="${y}" text-anchor="${anchor}">${t}${blue ? `<tspan class="mf-blue">${blue}</tspan>` : ""}</text>`;
  const small = (x, y, t) => `<text class="mf-small" x="${x}" y="${y}">${t}</text>`;
  const led = (x, y, r = 7) => `<circle class="mf-led" cx="${x}" cy="${y}" r="${r}"/>`;
  /* a knob with its printed 270° scale (gap at the bottom) */
  const knob = (id, x, y, r, cls, lx, ly, text, blue) =>
    g(
      id,
      `<circle class="ring" cx="${x}" cy="${y}" r="${r + 24}"/><path class="mf-scale" d="${arc(x, y, 50.8, 135, 405)}"/>` +
        `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}"/><circle class="mf-knobtop" cx="${x - 2}" cy="${y - 3}" r="${r - 9}"/>` +
        `<path class="${cls.includes("mf-cut") ? "mf-ptr-o" : "mf-ptr"}" d="M${x} ${y - r + 5}V${y - r + 20}"/>` +
        label(lx, ly, text, blue)
    );
  /* an oscillator knob: orange, faceted, no printed scale */
  const orange = (id, x, y, lx, ly, text) =>
    g(
      id,
      `<circle class="ring" cx="${x}" cy="${y}" r="48"/><circle class="mf-orange" cx="${x}" cy="${y}" r="32"/><circle class="mf-orangetop" cx="${x - 2}" cy="${y - 3}" r="22"/>` +
        `<path class="mf-ptr" d="M${x} ${y - 28}V${y - 14}"/>` +
        label(lx, ly, text)
    );
  /* an endless encoder: white cap, a printed ring with an arrow */
  const encoder = (id, x, y, r, a0, lx, ly, text, blue) => {
    const a1 = a0 + 300,
      [ex, ey] = pt(x, y, 50.8, a1).split(" ").map(Number),
      t = rad(a1 + 90),
      n = rad(a1);
    const tip = [ex + 9 * Math.cos(t), ey + 9 * Math.sin(t)],
      b1 = [ex + 6 * Math.cos(n), ey + 6 * Math.sin(n)],
      b2 = [ex - 6 * Math.cos(n), ey - 6 * Math.sin(n)];
    return g(
      id,
      `<circle class="ring" cx="${x}" cy="${y}" r="62"/><path class="mf-scale" d="${arc(x, y, 50.8, a0, a1)}"/>` +
        `<path class="mf-arrow" d="M${[tip, b1, b2].map((p) => p.map((v) => v.toFixed(1)).join(" ")).join("L")}Z"/>` +
        `<circle class="mf-enc" cx="${x}" cy="${y}" r="${r}"/><circle class="mf-enctop" cx="${x}" cy="${y}" r="${r - 8}"/>` +
        label(lx, ly, text, blue)
    );
  };
  /* a round key, with a light rim on the ones that light up */
  const button = (id, x, y, r, lx, ly, text, blue, rim) =>
    g(
      id,
      `<circle class="ring" cx="${x}" cy="${y}" r="${r + 12}"/>` +
        (rim ? `<circle class="${rim}" cx="${x}" cy="${y}" r="${r + 1}"/>` : "") +
        `<circle class="keycap" cx="${x}" cy="${y}" r="${rim ? r - 6 : r}"/>` +
        label(lx, ly, text, blue)
    );
  /* a touch icon above the keys: an orange outline, a light, line art and its name */
  const touch = (id, x, y, w, art, text, below) =>
    g(
      id,
      `<rect class="ring" x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${below ? 104 : 93}" rx="14"/><rect class="mf-touch" x="${x}" y="${y}" width="${w}" height="77" rx="8"/>` +
        led(x + w / 2, y + 15, 6) +
        `<g class="mf-art" transform="translate(${x + w / 2} ${y + 40}) scale(0.75)">${art}</g>` +
        `<text class="mf-tlbl" x="${x + w / 2}" y="${y + 71}" text-anchor="middle">${text}</text>` +
        (below ? `<text class="mf-tlbl" x="${x + w / 2}" y="${y + 90}" text-anchor="middle">${below}</text>` : "")
    );

  /* case, panel, artwork band, icon strip */
  out.push(`<rect class="mf-case" x="16" y="16" width="2010" height="1488" rx="110"/>`);
  out.push(`<rect class="mf-plate" x="110" y="93" width="1825" height="663"/>`);
  out.push(`<rect class="mf-band" x="110" y="756" width="1825" height="72"/>`);
  out.push(`<path class="mf-bandline" d="M110 828H1935"/>`);
  out.push(`<text class="mf-brand" x="1020" y="804" text-anchor="middle">ARTURIA</text>`);
  out.push(`<rect class="mf-iconbg" x="110" y="832" width="1825" height="106"/>`);

  /* section headings with their underlines */
  [
    ["DIGITAL OSCILLATOR", 604, 357, 336, 867, 372],
    ["ANALOG FILTER", 1064, 356, 882, 1256, 372],
    ["CYCLING ENVELOPE", 1600, 355, 1272, 1925, 372],
    ["OCTAVE", 244, 566, 132, 357, 581],
    ["ARP / SEQ", 668, 565, 499, 867, 581],
    ["LFO", 1065, 564, 882, 1274, 581],
    ["ENVELOPE", 1601, 564, 1290, 1925, 581],
  ].forEach(([t, cx, cy, x0, x1, y]) =>
    out.push(
      `<text class="mf-head" x="${cx}" y="${cy + 6}" text-anchor="middle">${t}</text><path class="mf-rule" d="M${x0} ${y}H${x1}"/>`
    )
  );

  /* the Matrix: row lines, column brackets, labels, the 35 lights and the three Assign keys */
  const cols = [245.8, 305.4, 364.6, 423.7, 482.9, 542.2, 601.8],
    rows = [228.7, 252.6, 276.4, 300.3, 323.9];
  rows.forEach((y, ri) => {
    out.push(`<path class="mf-rule" d="M204 ${y}H632"/>`);
    out.push(
      `<text class="mf-mx" x="197" y="${y + 4.5}" text-anchor="end">${MX_ROWS[ri][1].replace("/", " / ")}</text>`
    );
  });
  cols.forEach((x, ci) => {
    const v = x - 30.5;
    out.push(`<path class="mf-rule" d="M${v} 324V222Q${v} 214 ${v + 6} 208L${v + 56} 159"/>`);
    const lx = [257.8, 317.4, 376.6, 435.7, 502, 562, 622][ci],
      ly = ci > 3 ? 193 : 195,
      t = MX_COLS[ci][1];
    out.push(
      `<g transform="translate(${lx} ${ly}) rotate(-45)">` +
        (ci > 3
          ? `<rect class="mf-abox" x="-25" y="-9" width="50" height="17" rx="4"/><text class="mf-mxdark" x="0" y="4" text-anchor="middle">${t}</text>`
          : `<text class="mf-mx" x="0" y="4" text-anchor="middle">${t}</text>`) +
        `</g>`
    );
  });
  out.push(`<path class="mf-rule" d="M632 214V324"/>`);
  MX_ROWS.forEach(([r], ri) =>
    MX_COLS.forEach(([c], ci) => {
      const x = cols[ci],
        y = rows[ri];
      out.push(
        g(
          `mx-${r}-${c}`,
          `<circle class="ring" cx="${x}" cy="${y}" r="13"/><circle class="mf-mxled" cx="${x}" cy="${y}" r="8"/>`
        )
      );
    })
  );
  [535, 593, 650].forEach((x, i) =>
    out.push(
      g(
        `assign${i + 1}`,
        `<circle class="ring" cx="${x}" cy="154" r="22"/><circle class="keycap" cx="${x}" cy="154" r="14.5"/>`
      )
    )
  );
  out.push(`<path class="mf-rule" d="M650 248H687"/>`);

  /* top row */
  out.push(encoder("matrix", 743, 243.1, 29, 105, 744, 318, "Matrix"));
  out.push(`<rect class="mf-lbox" x="858" y="287" width="104" height="28" rx="4"/>`);
  out.push(button("paraphonic", 910, 241, 35, 910, 307, "Paraphonic", "", "mf-rim"));
  out.push(button("panel", 1065, 241, 31, 1065, 306, "Panel"));
  out.push(`<rect class="mf-frame" x="1150" y="152" width="594" height="178" rx="8"/>`);
  out.push(`<text class="mf-script" x="1615" y="181" text-anchor="middle">))) Grain de folie (((</text>`);
  out.push(
    g(
      "screen",
      `<rect class="ring" x="1170" y="184" width="154" height="102" rx="8"/><rect class="mf-oled" x="1178" y="192" width="138" height="86" rx="3"/>` +
        `<text class="mf-oledbig" x="1247" y="228" text-anchor="middle">MICRO</text><text class="mf-oledbig" x="1247" y="252" text-anchor="middle">FREAK</text>`
    )
  );
  out.push(encoder("preset", 1397.2, 239.2, 28, 105, 1392, 317, "Preset"));
  out.push(button("save", 1538, 241, 33, 1541, 305, "Save", "", "mf-rim"));
  out.push(button("utility", 1674, 241, 35, 1672, 306, "Utility", "", "mf-rim"));
  out.push(knob("master", 1830.7, 241.2, 32, "mf-black", 1830, 317, "Master"));

  /* middle row: glide, oscillator, filter, cycling envelope */
  out.push(knob("glide", 226.5, 451.6, 37, "mf-black", 226, 527, "Glide"));
  out.push(orange("type", 414.6, 447.3, 414, 528, "Type"));
  out.push(orange("wave", 539.3, 446.3, 539, 527, "Wave"));
  out.push(orange("timbre", 664.5, 446.0, 664, 526, "Timbre"));
  out.push(orange("shape", 789.9, 446.7, 788, 528, "Shape"));
  out.push(button("filtertype", 909.5, 450.5, 29.5, 910, 510, "Type"));
  [
    ["LPF", 420],
    ["BPF", 450],
    ["HPF", 480],
  ].forEach(([t, y]) => out.push(led(964, y) + small(978, y + 5, t)));
  out.push(knob("cutoff", 1064.0, 450.7, 37, "mf-black mf-cut", 1065, 526, "Cutoff"));
  out.push(knob("resonance", 1194.7, 450.5, 37, "mf-black", 1196, 526, "Resonance"));
  out.push(button("cycmode", 1308, 449.5, 29, 1309, 508, "Mode"));
  [
    ["Env", 420],
    ["Run", 450],
    ["Loop", 480],
  ].forEach(([t, y]) => out.push(led(1363, y) + small(1376, y + 5, t)));
  out.push(knob("rise", 1457.9, 450.6, 37, "mf-black", 1458, 527, "Rise / ", "Shape"));
  out.push(knob("fall", 1588.5, 450.8, 37, "mf-black", 1589, 527, "Fall / ", "Shape"));
  out.push(knob("cychold", 1719.8, 450.6, 37, "mf-black", 1720, 526, "Hold / Sustain"));
  out.push(knob("amount", 1851.2, 450.3, 37, "mf-black", 1854, 526, "Amount"));

  /* bottom row: octave, arp/seq, LFO, envelope */
  out.push(`<path class="mf-rule" d="M229 641A38 38 0 1 0 229 677H258A38 38 0 1 0 258 641Z"/>`);
  out.push(button("octdown", 196, 659, 33, 197, 719, "←"));
  out.push(button("octup", 290, 659, 33, 294, 719, "→"));
  out.push(button("shift", 417, 660, 33, 414, 716, "Shift", "", "mf-shiftrim"));
  out.push(button("arpseq", 541, 660, 31, 538, 717, "Arp | ", "Seq"));
  out.push(button("octmod", 640, 660, 32, 635, 717, "Oct | Mod"));
  [614, 644, 674, 704].forEach((y, i) => out.push(led(688, y) + small(703, y + 5, String(i + 1))));
  out.push(encoder("rate", 789.0, 657.7, 28, 15, 789, 735, "Rate / ", "Swing"));
  out.push(led(852, 613) + label(850, 597, "Sync"));
  out.push(button("lfoshape", 941, 662, 32, 940, 717, "Shape"));
  [
    [993, 627],
    [993, 657],
    [993, 687],
    [1065, 627],
    [1065, 657],
    [1065, 687],
  ].forEach(([x, y], i) =>
    out.push(led(x, y) + `<path class="mf-lfoico" transform="translate(${x + 28} ${y})" d="${LFO_ICONS[i]}"/>`)
  );
  out.push(encoder("lforate", 1197.7, 657.3, 28, 15, 1196, 734, "Rate"));
  out.push(led(1255, 613) + label(1260, 597, "Sync"));
  out.push(button("ampmod", 1340, 663, 30, 1338, 717, "Amp Mod"));
  out.push(knob("attack", 1457.8, 658.9, 37, "mf-black", 1457, 734, "Attack"));
  out.push(knob("decay", 1588.6, 658.9, 37, "mf-black", 1588, 734, "Decay / Rel"));
  out.push(knob("sustain", 1719.6, 658.7, 37, "mf-black", 1719, 733, "Sustain"));
  out.push(knob("filteramt", 1851.0, 658.2, 37, "mf-black", 1851, 733, "Filter Amt"));

  /* touch icons and strip */
  out.push(`<path class="mf-orule" d="M292 846V930M718 846V930M922 876H947M822 876H847M1020 876H1065"/>`);
  out.push(touch("hold", 188, 838, 76, TOUCH_ICONS.hold, "Hold", "Tie / Rest"));
  out.push(touch("up", 317, 838, 76, TOUCH_ICONS.up, "Up | A"));
  out.push(touch("order", 417, 838, 76, TOUCH_ICONS.order, "Order | B"));
  out.push(touch("random", 517, 838, 76, TOUCH_ICONS.random, "Random | ●"));
  out.push(touch("pattern", 617, 838, 75, TOUCH_ICONS.pattern, "Pattern | ▶"));
  out.push(touch("spice", 747, 838, 75, TOUCH_ICONS.spice, "Spice"));
  out.push(touch("dice", 847, 838, 75, TOUCH_ICONS.dice, "Dice"));
  out.push(touch("bend", 947, 838, 73, TOUCH_ICONS.bend, "Bend"));
  out.push(
    `<rect class="mf-cap" x="1077" y="842" width="13" height="68" rx="6"/><rect class="mf-cap" x="1883" y="842" width="12" height="68" rx="6"/>`
  );
  const zig = Array.from({ length: 6 }, (_, i) => {
    const x = 1170 + i * 125;
    return `M${x} 852L${x + 22} 864L${x} 876L${x + 22} 888L${x} 900`;
  }).join("");
  out.push(
    g(
      "strip",
      `<rect class="ring" x="1093" y="829" width="786" height="94" rx="14"/><rect class="mf-touch" x="1101" y="837" width="770" height="78" rx="8"/><path class="mf-zig" d="${zig}"/>`
    )
  );

  /* the keyboard: one flat plate, white keys are regions between slots, raised black keys on top */
  out.push(`<rect class="mf-kbd" x="137" y="943" width="1791" height="503" rx="6"/>`);
  const W = [
    [167.5, 237, 283.5],
    [305, 372, 398, 283.5],
    [440, 512, 512, 398],
    [512, 576, 627],
    [645, 705, 741, 627],
    [774, 835, 855.5, 741],
    [903, 970, 970, 855.5],
    [970, 1039, 1085],
    [1107, 1175, 1200, 1085],
    [1243, 1314, 1314, 1200],
    [1314, 1380, 1429],
    [1447, 1509, 1544, 1429],
    [1577, 1639, 1659, 1544],
    [1707, 1775.5, 1775.5, 1659],
    [1775.5, 1892, 1892],
  ];
  const WHITE = [1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25];
  W.forEach(([tl, tr, br, bl = tl], i) => {
    const d = `M${tl} 943H${tr}V1200H${br}V1446H${bl}V1200H${tl}Z`;
    out.push(g("k" + WHITE[i], `<path class="ring" d="${d}"/><path class="trig mf-white" d="${d}"/>`));
  });
  [
    [2, 237, 68],
    [4, 372, 68],
    [7, 576, 69],
    [9, 705, 69],
    [11, 835, 68],
    [14, 1039, 68],
    [16, 1175, 68],
    [19, 1380, 67],
    [21, 1509, 68],
    [23, 1639, 68],
  ].forEach(([k, x, w]) =>
    out.push(
      g(
        "k" + k,
        `<rect class="ring" x="${x + 4}" y="947" width="${w - 8}" height="249" rx="6"/><rect class="trig mf-blackkey" x="${x + 4}" y="947" width="${w - 8}" height="249" rx="6"/>` +
          `<path class="mf-copper" d="M${x + w / 2} 975V1170"/>`
      )
    )
  );
  [167.5, 512, 970, 1314, 1775.5, 1892].forEach((x) => out.push(`<path class="mf-slot" d="M${x} 965V1422"/>`));
  [283.5, 398, 627, 741, 855.5, 1085, 1200, 1429, 1544, 1659].forEach((x) =>
    out.push(`<path class="mf-slot" d="M${x} 1227V1422"/>`)
  );
  out.push(
    `<text class="mf-logo" x="1789" y="974">MICRO</text><text class="mf-logo b" x="1789" y="997">FREAK</text>` +
      `<text class="mf-logosm" x="1789" y="1009">ALGORITHMIC</text><text class="mf-logosm" x="1789" y="1018">SYNTHESIZER</text>`
  );
  return `<svg class="mfp" viewBox="8 8 2026 1504" role="img" aria-label="MicroFreak top panel">${out.join("")}</svg>`;
}
