# Model:Cycles project export (.mcprj): format notes

Mapped by diffing exports from one unit (firmware 1.13 with Modded Cycles, ProductType 47): the calibration projects `MAP1` and `MAP3` in `tests/fixtures/mcprj`, where each pattern holds one known change made on the unit, and one ordinary project. A project written by this tool loaded and played on the unit. Code: `src/project.mjs`. "?" = not confirmed yet.

## Container

- ZIP (deflate) with `manifest.json` (CRLF, 2-space indent) and one binary entry named after the project.
- Binary: 0x1f-byte header (magic `ac 11 d3 03`, "0038", byte 0x18 differs between files, unknown), then `[u32 BE size][LZ4 block]` per 32 KB of payload, blocks share one history window, a zero size ends the list.
- Trailer: u32 BE checksum = CRC-32 (reflected, poly 0xEDB88320, init 0, inverted at the end; `zlib.crc32(blocks, 0xFFFFFFFF)`) over the block area from offset 0x1f through the zero terminator; then u32 length of that same area; then magic `aa a1 da aa`. Matches both exports; Transfer rejects a file with a wrong one ("payload has the incorrect checksum").
- Payload is 2,163,716 bytes, big-endian.

## Payload map

| Offset   | Size        | What                                                                                             |
| -------- | ----------- | ------------------------------------------------------------------------------------------------ |
| 0x000    | 0x200       | `beefbace`, version 6, project name (16), 4 bytes at 0x18 that change per save (id or checksum?) |
| 0x200    | 96 × 14,848 | patterns A01–F16                                                                                 |
| 0x15C1FC | 96 × 7,680  | one kit (sound settings) per pattern                                                             |
| 0x2101FC | 520         | project settings, to the end                                                                     |

## Pattern (14,848 bytes)

`+0` u32 header, `+4` six tracks × 722, then 80 lock lanes × 130, then settings at `+14736`:

- settings +0: pattern name (16, from PATTERN > RENAME), +18 u16 tempo × 120 (93 BPM = 11160), +20 u16 length, +22 u16 (16, unknown), +24 (0xFF, unknown; CHG?), +25 SCALE menu MOD (0 = PATTERN, 1 = TRACK; seen in an ordinary project with one track at its own length), +26 speed index (0 = 2x, 2 = 1x; the others assumed in the unit's menu order), +28 pattern index.

### Track (722 bytes), 64 steps per lane

| Offset | What                                                                                                                                                                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0      | u16 flags per step: 0x0001 trig, 0x0280 set with every trig (cleared when the trig is removed), 0x8000 retrig, 0x0010 set by default on even steps (unknown)                                                                                                                  |
| 128    | note: 0x3C untouched, 0xFF trig uses the track note, else MIDI note (67 = G5 on screen, so 60 = C5)                                                                                                                                                                           |
| 192    | velocity (0xFF = track default 100)                                                                                                                                                                                                                                           |
| 320    | micro timing (0 default, 23 = latest)                                                                                                                                                                                                                                         |
| 256    | trig length code (0xFF = track default): 0–29 0.125–1.94 in 1/16 steps, 30–45 2–3.875 by 0.125, 46–61 4–7.75 by 0.25, 62–77 8–15.5 by 0.5, 78–93 16–31, 94–109 32–62 by 2, 110–126 64–128 by 4, 127 INF (10.0 = 66, confirmed)                                                |
| 384    | trig condition: 0xFF none, 0 FILL, 1 !FILL, 2 PRE, 3 !PRE?, 4 NEI?, 5 !NEI?, 6 1ST, 7 !1ST?, 8–28 chance (15 = 25%), 29 = 1:2, 30 = 2:2, then A:B in order?                                                                                                                   |
| 448    | 0xFF default, unknown                                                                                                                                                                                                                                                         |
| 512    | retrig length, same code as trig length (default 46 = 4.0; 8.0 = 62 shows as 1/2)                                                                                                                                                                                             |
| 576    | retrig rate (9 = 1/16 default, 12 = 1/32)                                                                                                                                                                                                                                     |
| 640    | retrig velocity fade (0 default, 127 max)                                                                                                                                                                                                                                     |
| 704    | track defaults: +1 retrig length, +2 retrig rate, +3 fade, +4 note 60, +5 velocity 100, +6 trig length 14 (= 1.0), +10 track length, +14 swing (0–30, 30 = max), +15 the track's CHANCE in percent (100 default; 30 seen after turning CHANCE to about 30% with no trig held) |

### Lock lane (130 bytes)

`[param id][track 0–5]`, then 64 × u16 (value in the high byte, 0xFFFF = no lock); `ff ff` header = unused. Param ids match the sound word numbers below. Locks go to 127 at most; PITCH runs 40–88 (64 = no change). CHANCE locks go to the condition lane instead.

## Kit (7,680 bytes, one per pattern)

- +8 name (16; "KIT N" once a pattern is used, otherwise the pattern name), +24 six u16 track levels (100 default, high byte).
- +36 six sounds × 100: `beefbace`, version 2, name (16, "SOUND N"), then 32 u16 words (value in high byte), ends `ba ce f0 0c`.
- Words: 1 LFO SPEED (bipolar, 64 = 0; 84 = 20), 2 LFO MULT (4 = X16 default, 5 = X32, 22 = 2k), 4 LFO destination? (10 = PTCH), 5 LFO wave? (1 = CURVE), 8 LFO depth (64 = 0), 9 machine (0 KICK, 1 SNARE, 2 METAL, 3 PERC, 4 TONE, 5 CHORD), 10 PITCH (64 = 0), 11 COLOR, 12 SHAPE, 13 SWEEP, 14 CONTOUR, 19 DECAY, 20 VOLUME+DIST, 21 DELAY send, 22 REVERB send.
- Sound byte 95: VDEP (127 in a new project, 64 seen).
- +642 FX: four u16, raw 0–127: delay time (screen 0–128), delay feedback (screen 0–198), reverb size, reverb tone (64 = 0). Defaults 23, 32, 42, 64. Confirmed with MAP3 B01.

## Project settings (0x2101FC)

+8 u16 project tempo × 120, +13 active pattern index, +15 mute mask (bit 0 = T1), +27 T1–T6 MIDI IN channel (0-based), +33 FX IN?, +34 T1–T6 OUT?, +40 FX OUT?

## Still open

- Flag 0x0010, step lane 448, the exact LFO MULT / DEST / WAVE lists, the negated and A:B conditions past 2:2 (assumed Elektron order), the 64 extra sound slots in each kit.
- One export has 0x0280 without a trig on 12 steps, which MAP3 shows a removed trig doesn't leave behind.
- The 4 bytes at payload 0x18 change per save but aren't a CRC32/Adler32 of any obvious range (id or timestamp?). The device doesn't check them: a project written with MAP1's value loaded and played fine.
- Modded Cycles may add fields a stock export lacks.
