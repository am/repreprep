// LZ4 block format (https://github.com/lz4/lz4/blob/dev/doc/lz4_Block_format.md).
// The Model:Cycles splits its payload into 32 KB blocks that share one history
// window, so matches may reach back into earlier blocks: both functions work on
// one output buffer that holds everything decoded so far.

/** Decode one block from `src`, appending to `out` (an array of bytes). */
export function decodeBlock(src, out) {
  let i = 0;
  while (i < src.length) {
    const token = src[i++];
    let lit = token >> 4;
    if (lit === 15) {
      let b;
      do lit += b = src[i++];
      while (b === 255);
    }
    for (let k = 0; k < lit; k++) out.push(src[i++]);
    if (i >= src.length) break;
    const offset = src[i] | (src[i + 1] << 8);
    i += 2;
    let len = token & 15;
    if (len === 15) {
      let b;
      do len += b = src[i++];
      while (b === 255);
    }
    len += 4;
    if (offset === 0 || offset > out.length) throw new Error("LZ4: bad match offset");
    const from = out.length - offset;
    for (let k = 0; k < len; k++) out.push(out[from + k]);
  }
}

function pushLength(out, n) {
  while (n >= 255) {
    out.push(255);
    n -= 255;
  }
  out.push(n);
}

/** Encode raw[start:end] as one block; matches may point before `start`. */
export function encodeBlock(raw, start, end) {
  const out = [];
  const table = new Map();
  const key = (p) => ((raw[p] << 24) | (raw[p + 1] << 16) | (raw[p + 2] << 8) | raw[p + 3]) >>> 0;
  let i = start;
  let anchor = start;
  const limit = end - 12; // LZ4: the last match starts at least 12 bytes before the end
  while (i < limit) {
    const k = key(i);
    const cand = table.get(k);
    table.set(k, i);
    if (cand === undefined || i - cand > 65535) {
      i++;
      continue;
    }
    let m = 4;
    while (i + m < end - 5 && raw[cand + m] === raw[i + m]) m++; // the last 5 bytes stay literals
    const lit = i - anchor;
    out.push((Math.min(lit, 15) << 4) | Math.min(m - 4, 15));
    if (lit >= 15) pushLength(out, lit - 15);
    for (let p = anchor; p < i; p++) out.push(raw[p]);
    const offset = i - cand;
    out.push(offset & 255, offset >> 8);
    if (m - 4 >= 15) pushLength(out, m - 4 - 15);
    for (let p = Math.max(i + 1, i + m - 16); p < i + m && p + 4 <= end; p++) table.set(key(p), p);
    i += m;
    anchor = i;
  }
  const lit = end - anchor;
  out.push(Math.min(lit, 15) << 4);
  if (lit >= 15) pushLength(out, lit - 15);
  for (let p = anchor; p < end; p++) out.push(raw[p]);
  return Uint8Array.from(out);
}
