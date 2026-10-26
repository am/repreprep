// Just enough ZIP to read and write Elektron exports: stored or deflated
// entries, no ZIP64, no encryption.
import { crc32, deflateRawSync, inflateRawSync } from "node:zlib";

/** -> Map(name -> Uint8Array) */
export function readZip(buf) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let eocd = buf.length - 22;
  while (eocd >= 0 && view.getUint32(eocd, true) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("not a zip file");
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const files = new Map();
  for (let n = 0; n < count; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new Error("zip: bad central directory");
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nameLen));
    const dataStart = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
    const data = buf.subarray(dataStart, dataStart + size);
    if (method === 0) files.set(name, data);
    else if (method === 8) files.set(name, new Uint8Array(inflateRawSync(data)));
    else throw new Error(`zip: unsupported method ${method}`);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

function dosTime(d) {
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

/** entries: [[name, Uint8Array]] -> Uint8Array (deflated) */
export function writeZip(entries, when = new Date()) {
  const { time, date } = dosTime(when);
  const parts = [];
  const central = [];
  let offset = 0;
  for (const [name, data] of entries) {
    const nameBytes = new TextEncoder().encode(name);
    const packed = new Uint8Array(deflateRawSync(data));
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(8, 8, true);
    local.setUint16(10, time, true);
    local.setUint16(12, date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, packed.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    const dir = new DataView(new ArrayBuffer(46));
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true);
    dir.setUint16(6, 20, true);
    dir.setUint16(10, 8, true);
    dir.setUint16(12, time, true);
    dir.setUint16(14, date, true);
    dir.setUint32(16, crc, true);
    dir.setUint32(20, packed.length, true);
    dir.setUint32(24, data.length, true);
    dir.setUint16(28, nameBytes.length, true);
    dir.setUint32(42, offset, true);
    parts.push(new Uint8Array(local.buffer), nameBytes, packed);
    central.push(new Uint8Array(dir.buffer), nameBytes);
    offset += 30 + nameBytes.length + packed.length;
  }
  const dirSize = central.reduce((n, b) => n + b.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, dirSize, true);
  end.setUint32(16, offset, true);
  return concat([...parts, ...central, new Uint8Array(end.buffer)]);
}

export function concat(arrays) {
  const out = new Uint8Array(arrays.reduce((n, a) => n + a.length, 0));
  let p = 0;
  for (const a of arrays) {
    out.set(a, p);
    p += a.length;
  }
  return out;
}
