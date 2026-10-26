# mcprj

Read and write Elektron Model:Cycles project files (`.mcprj`, what Elektron Transfer sends and receives). Plain Node 22, no dependencies. The format was mapped from exports of a unit on firmware 1.13 (Modded Cycles); see [FORMAT.md](FORMAT.md) for what each byte means and what is still unknown.

## Install

With Homebrew (macOS or Linux; installs Node too if needed):

```sh
brew install am/tap/mcprj
```

Or with npm, from this folder:

```sh
npm install -g .     # puts `mcprj` on your PATH
```

Or run it in place from the repository root: `node tools/mcprj/bin/mcprj.mjs …` (also `npm run mcprj -- …`).

## Commands

| Command                                         | What it does                                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `mcprj info SONG.mcprj`                         | project settings and a step grid of every pattern that was used               |
| `mcprj dump SONG.mcprj [--all] [-p A01]`        | everything decoded, as JSON (one pattern with `-p`, unused ones with `--all`) |
| `mcprj check SONG.mcprj`                        | checks the checksum and that writing the file back loses nothing              |
| `mcprj raw SONG.mcprj out.bin`                  | the decompressed payload, for looking at bytes                                |
| `mcprj build spec.json -o OUT.mcprj [--base X]` | makes a project from a JSON spec, on top of the empty project or `X`          |
| `mcprj new NAME -o OUT.mcprj`                   | an empty project                                                              |

Send the result to the unit with Elektron Transfer. It refuses a file whose checksum is wrong, so a file `mcprj check` accepts is one Transfer accepts.

```
$ mcprj info NIGHT.mcprj
NIGHT  firmware 1.13  tempo 96  on A01

A01 NIGHT BEAT  96 BPM  16 steps  1x
  T1 KICK  x...x...x...x...
  T2 SNARE ....x.......x..x
  T3 METAL x.x.x.x.x.x.x.x.
  T6 CHORD x...............
  locks: T6 SHAPE
```

## Spec files

`build` reads a JSON file like [examples/night-beat.json](examples/night-beat.json). [spec.schema.json](spec.schema.json) is its JSON Schema: `build` checks every spec against it first and lists each field that doesn't fit (a misspelt field, a value out of range, an unknown condition) instead of ignoring it. Point `"$schema"` at it, as the example does, and editors like VS Code complete field names and flag mistakes while you type. Every pattern it names is cleared first, so the pattern holds only what the spec says; with `--base`, the patterns it doesn't name stay as they were.

```json
{
  "name": "NIGHT",
  "tempo": 96,
  "activePattern": "A01",
  "muted": [],
  "patterns": {
    "A01": {
      "title": "NIGHT BEAT",
      "length": 16,
      "speed": "1x",
      "fx": { "REVERB SIZE": 90 },
      "tracks": {
        "2": {
          "machine": "SNARE",
          "params": { "DECAY": 30, "REVERB": 50 },
          "level": 100,
          "swing": 58,
          "steps": "....x.......x...",
          "trigs": { "16": { "velocity": 50, "condition": "50%" } }
        }
      }
    }
  }
}
```

- Project: `name` (up to 15 ASCII characters, also the file's name on the unit), `tempo`, `activePattern` (the pattern the unit opens on; the first one in the spec when left out), `muted` (track numbers).
- Pattern, keyed `A01` to `F16`: `title`, `tempo` (the project's when left out), `length` (16 when left out, or the longest `steps`), `speed` (`2x`, `1x`, …), `fx` with `DELAY TIME`, `DELAY FEEDBACK`, `REVERB SIZE`, `REVERB TONE` (raw 0–127), `tracks` keyed `1` to `6`.
- Track: `machine` (`KICK`, `SNARE`, `METAL`, `PERC`, `TONE`, `CHORD`; starts from that machine's factory sound), `params` (raw 0–127 knob values by name: `PITCH` 64 = no change, `COLOR`, `SHAPE`, `SWEEP`, `CONTOUR`, `DECAY`, `VOLUME+DIST`, `DELAY`, `REVERB`, `LFO SPEED`, `LFO MULT`, `LFO DEPTH`, …), `level`, `vdep`, `swing` (50–80), `length` (the track's own step count), `steps` (one character per step, `.` for no trig; spaces and `|` are ignored), `trigs`.
- Trig, keyed by step `1` to `64` (sets a trig unless `"trig": false`): `velocity`, `note` (`"G5"` or a MIDI number, C5 = 60), `length` (in steps: 0.125 to 128, or `"INF"`), `micro` (0–23), `condition` (`FILL`, `!FILL`, `PRE`, `!PRE`, `NEI`, `!NEI`, `1ST`, `!1ST`, `25%`, `1:2`, …), `retrig` (`{ "rate": "1/32", "length": 4, "fade": 0 }`), `locks` (`{ "DECAY": 20 }`, parameter locks on that step).

`mcprj dump` prints the same names, so a dump is a good way to see what to put in a spec.

## From JavaScript

```js
import { readFileSync, writeFileSync } from "node:fs";
import { Project } from "mcprj"; // or tools/mcprj/src/index.mjs

const project = Project.parse(readFileSync("SONG.mcprj"));
const a01 = project.pattern("A01");
a01.tempo = 100;
a01.tracks[0].setTrig(4); // T1, step 5 (steps count from 0 here)
a01.setLock(1, "DECAY", 5, 20); // track and step count from 1
writeFileSync("SONG2.mcprj", project.toBytes());
```

`build(spec, base)` and `emptyProject()` do what the `build` and `new` commands do; `validate(spec)` returns the list of problems `build` would report.

## Tests

`tests/unit/mcprj.test.mjs` in the repository, run with `npm run test:unit`. They read `tests/fixtures/mcprj/MAP1.mcprj` and `MAP3.mcprj`, exports where each pattern holds one known change.

`template/empty.mcprj` is MAP3 with every pattern and kit reset to the state of a pattern that was never touched.
