// The binary entry inside a .mcprj: a 0x1f-byte header, the payload as a chain
// of [u32 BE size][LZ4 block] (32 KB each, zero size ends it), then a trailer:
// CRC-32 of the block area, the block area's length, and the magic aa a1 da aa.
import { crc32 } from "node:zlib";
import { decodeBlock, encodeBlock } from "./lz4.mjs";
import { concat } from "./zip.mjs";

export const HEADER_SIZE = 0x1f;
const BLOCK = 32768;
const MAGIC = [0xaa, 0xa1, 0xda, 0xaa];
const u32 = (b, p) => ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0;
const be32 = (n) => Uint8Array.of(n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);

/**
 * CRC-32 (poly 0xEDB88320) started from 0 and inverted at the end. zlib's
 * crc32 inverts on the way in and out, so seeding it with 0xFFFFFFFF gives it.
 */
export const checksum = (blocks) => crc32(blocks, 0xffffffff);

/** -> { header, raw } ; throws on a bad trailer or checksum */
export function unpack(payload) {
  const header = payload.slice(0, HEADER_SIZE);
  const out = [];
  let p = HEADER_SIZE;
  for (;;) {
    const size = u32(payload, p);
    p += 4;
    if (size === 0) break;
    decodeBlock(payload.subarray(p, p + size), out);
    p += size;
  }
  const trailer = payload.subarray(p);
  if (trailer.length !== 12 || MAGIC.some((b, i) => trailer[8 + i] !== b)) throw new Error("unexpected trailer");
  if (u32(trailer, 0) !== checksum(payload.subarray(HEADER_SIZE, p))) throw new Error("payload checksum mismatch");
  return { header, raw: Uint8Array.from(out) };
}

export function pack(header, raw) {
  const parts = [];
  for (let s = 0; s < raw.length; s += BLOCK) {
    const block = encodeBlock(raw, s, Math.min(s + BLOCK, raw.length));
    parts.push(be32(block.length), block);
  }
  parts.push(be32(0));
  const blocks = concat(parts);
  return concat([header, blocks, be32(checksum(blocks)), be32(blocks.length), Uint8Array.from(MAGIC)]);
}
