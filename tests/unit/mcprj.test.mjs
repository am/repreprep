// The Model:Cycles project file tool (tools/mcprj). MAP1 and MAP3 are exports from the unit with one known change per pattern.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import {
  Project,
  build,
  emptyProject,
  unpack,
  checksum,
  stepsFromLength,
  lengthFromSteps,
  noteName,
  noteNumber,
  patternIndex,
  patternName,
  validate,
  SCHEMA,
  MACHINES,
  CONDITIONS,
  SPEEDS,
  FX,
  RETRIG_RATES,
  PARAMS,
  SETTINGS,
} from "../../tools/mcprj/src/index.mjs";
import { readZip } from "../../tools/mcprj/src/zip.mjs";
import { decodeBlock, encodeBlock } from "../../tools/mcprj/src/lz4.mjs";

const fixture = (name) => readFileSync(new URL(`../fixtures/mcprj/${name}.mcprj`, import.meta.url));
const MAP1 = Project.parse(fixture("MAP1"));
const MAP3 = Project.parse(fixture("MAP3"));
const step = (project, pattern, track, s) => project.pattern(pattern).tracks[track - 1].stepJSON(s - 1);

test("LZ4 blocks decode back to what was encoded", () => {
  const raw = new Uint8Array(40000).map((_, i) => (i % 700 < 350 ? i % 7 : (i * 31) & 255));
  const out = [];
  decodeBlock(encodeBlock(raw, 0, raw.length), out);
  assert.deepEqual(Uint8Array.from(out), raw);
});

test("the payload checksum matches what the unit wrote", () => {
  for (const name of ["MAP1", "MAP3"]) {
    const files = readZip(fixture(name));
    const payload = files.get(name);
    const blocks = payload.subarray(0x1f, payload.length - 12);
    const stored = new DataView(payload.buffer, payload.byteOffset + payload.length - 12).getUint32(0);
    assert.equal(checksum(blocks), stored, name);
  }
});

test("a project written back decodes to the same bytes", () => {
  for (const project of [MAP1, MAP3]) {
    const again = Project.parse(project.toBytes());
    assert.deepEqual(again.raw, project.raw);
    assert.deepEqual(again.manifest, project.manifest);
  }
});

test("unpack refuses a payload with a wrong checksum", () => {
  const payload = Uint8Array.from(readZip(fixture("MAP3")).get("MAP3"));
  payload[payload.length - 9] ^= 1;
  assert.throws(() => unpack(payload), /checksum/);
});

test("the manifest is written with CRLF like the unit's", () => {
  const manifest = new TextDecoder().decode(readZip(MAP3.toBytes()).get("manifest.json"));
  assert.match(manifest, /^\{\r\n  "FormatVersion": "1.0",\r\n/);
});

test("project settings", () => {
  assert.equal(MAP1.name, "MAP1");
  assert.equal(MAP1.manifest.FirmwareVersion, "1.13");
  assert.deepEqual(MAP1.muted, [2]);
  assert.equal(MAP1.activePattern, "B06");
  assert.equal(MAP3.tempo, 120);
});

test("pattern settings: tempo, length, speed, name", () => {
  const a13 = MAP1.pattern("A13");
  assert.equal(a13.tempo, 93);
  assert.equal(a13.length, 32);
  assert.equal(a13.tracks[0].stepCount, 32);
  assert.equal(MAP1.pattern("A14").speed, "2x");
  assert.equal(MAP1.pattern("A04").length, 64);
  assert.equal(MAP1.pattern("B01").title, "KITB1");
});

test("trigs and their settings", () => {
  assert.deepEqual(step(MAP3, "A02", 1, 2), { step: 2, trig: true });
  assert.deepEqual(step(MAP3, "A03", 1, 1), { step: 1, trig: true, velocity: 50 });
  assert.equal(step(MAP3, "A04", 1, 1).length, 10);
  assert.deepEqual(step(MAP3, "A05", 1, 1).retrig, { rate: "1/32", length: 8, fade: 127 });
  assert.deepEqual(
    [1, 2, 3].map((s) => step(MAP1, "A07", 1, s).condition),
    ["1:2", "FILL", "!FILL"]
  );
  assert.equal(MAP1.pattern("A03").tracks[5].trig(5), true);
});

test("locks", () => {
  assert.deepEqual(MAP1.pattern("A12").locks(), [{ track: 1, param: "DECAY", steps: { 1: 32 } }]);
  assert.equal(MAP1.pattern("A09").locks().length, 9);
});

test("kit: FX, LFO and VDEP", () => {
  assert.deepEqual(MAP3.pattern("B01").kit.fx(), {
    "DELAY TIME": 63,
    "DELAY FEEDBACK": 63,
    "REVERB SIZE": 63,
    "REVERB TONE": 96,
  });
  assert.equal(MAP3.pattern("B02").kit.sounds[0].param("LFO MULT"), 22);
  assert.equal(MAP3.pattern("B03").kit.sounds[0].vdep, 64);
  assert.equal(MAP3.pattern("B03").kit.sounds[5].machine, "CHORD");
});

test("length codes, notes and pattern names", () => {
  assert.equal(stepsFromLength(14), 1);
  assert.equal(stepsFromLength(66), 10);
  assert.equal(stepsFromLength(127), "INF");
  for (const v of [0, 29, 30, 46, 62, 78, 94, 110, 126]) assert.equal(lengthFromSteps(stepsFromLength(v)), v);
  assert.throws(() => lengthFromSteps(1.01));
  assert.equal(noteName(67), "G5");
  assert.equal(noteNumber("C5"), 60);
  assert.equal(patternName(95), "F16");
  assert.equal(patternIndex("B01"), 16);
  assert.throws(() => patternIndex("G01"));
});

test("the empty template has no used pattern", () => {
  const empty = emptyProject();
  assert.equal(empty.name, "EMPTY");
  assert.ok(empty.patterns().every((p) => p.isEmpty() && !p.kit.name));
  assert.deepEqual(empty.toJSON().patterns, []);
});

test("build makes the project a spec describes", () => {
  const project = Project.parse(
    build({
      name: "SPEC",
      tempo: 96,
      patterns: {
        A02: {
          title: "BEAT",
          speed: "2x",
          fx: { "REVERB SIZE": 90 },
          tracks: {
            1: { steps: "x...x...x...x..." },
            3: {
              machine: "SNARE",
              params: { DECAY: 30 },
              swing: 58,
              steps: "....|x...",
              trigs: {
                5: { velocity: 60, note: "G5", condition: "50%", micro: 3, length: 2, locks: { COLOR: 12 } },
                8: { retrig: { rate: "1/32", length: 1 } },
              },
            },
          },
        },
        B01: { length: 32, tracks: { 2: { steps: "x" } } },
      },
    }).toBytes()
  );
  assert.equal(project.name, "SPEC");
  assert.equal(project.manifest.Payload, "SPEC");
  assert.equal(project.activePattern, "A02");
  const a02 = project.pattern("A02");
  assert.equal(a02.title, "BEAT");
  assert.equal(a02.tempo, 96);
  assert.equal(a02.speed, "2x");
  assert.equal(a02.length, 16);
  assert.equal(a02.kit.fx()["REVERB SIZE"], 90);
  assert.deepEqual(
    a02.tracks[0].toJSON().steps.map((s) => s.step),
    [1, 5, 9, 13]
  );
  const t3 = a02.tracks[2];
  assert.equal(a02.kit.sounds[2].machine, "SNARE");
  assert.equal(a02.kit.sounds[2].param("DECAY"), 30);
  assert.equal(a02.kit.sounds[2].param("COLOR"), emptyProject().pattern(0).kit.sounds[1].param("COLOR"));
  assert.equal(t3.swing, 8);
  assert.deepEqual(t3.stepJSON(4), {
    step: 5,
    trig: true,
    note: "G5",
    velocity: 60,
    length: 2,
    micro: 3,
    condition: "50%",
  });
  assert.deepEqual(t3.retrig(7), { rate: "1/32", length: 1, fade: 0 });
  assert.deepEqual(a02.locks(), [{ track: 3, param: "COLOR", steps: { 5: 12 } }]);
  assert.equal(project.pattern("B01").length, 32);
  assert.ok(project.pattern("A01").isEmpty());
});

test("build sets TRACK scale, a track's own length and its CHANCE, and names the kit after the pattern", () => {
  // as in an export of a pattern where SCALE MOD was set to TRACK, T4 LEN to 12 and T4's CHANCE to 30%
  const project = Project.parse(
    build({
      patterns: { B01: { title: "PHRASE", length: 64, scale: "TRACK", tracks: { 4: { length: 12, chance: 30 } } } },
    }).toBytes(new Date(2026, 0, 1))
  );
  const b01 = project.pattern("B01");
  assert.equal(b01.scale, "TRACK");
  assert.equal(b01.kit.name, "PHRASE");
  assert.equal(b01.tracks[3].stepCount, 12);
  assert.equal(b01.tracks[3].chance, 30);
  assert.equal(b01.tracks[0].chance, 100);
  assert.equal(project.pattern("A01").scale, "PATTERN");
  assert.equal(b01.raw[b01.base + SETTINGS + 25], 1);
  assert.equal(b01.raw[b01.tracks[3].base + 719], 30);
});

test("a project written with a date gives the same bytes every time", () => {
  const spec = { patterns: { A01: { tracks: { 1: { steps: "x" } } } } };
  const when = new Date(2026, 0, 1);
  assert.deepEqual(build(spec).toBytes(when), build(spec).toBytes(when));
});

test("build clears a pattern of the base before writing it", () => {
  const project = build({ patterns: { A12: { tracks: { 2: { steps: "x" } } } } }, MAP1);
  assert.deepEqual(project.pattern("A12").locks(), []);
  assert.equal(project.pattern("A12").tracks[0].trig(0), false);
  assert.equal(project.pattern("A13").tempo, 93, "patterns the spec leaves out stay");
  assert.equal(MAP1.pattern("A12").locks().length, 1, "the base is not changed");
});

test("build lists every part of a spec that doesn't fit the schema", () => {
  const spec = {
    nmae: "TYPO",
    patterns: {
      Z01: {},
      A01: { tracks: { 1: { machine: "BASS", trigs: { 65: {}, 2: { condition: "SOMETIMES", velocity: 200 } } } } },
    },
  };
  const problems = validate(spec);
  assert.deepEqual(
    problems.map((p) => p.split(":")[0]),
    [
      "spec.nmae",
      "spec.patterns.Z01",
      "spec.patterns.A01.tracks.1.machine",
      "spec.patterns.A01.tracks.1.trigs.2.condition",
      "spec.patterns.A01.tracks.1.trigs.2.velocity",
      "spec.patterns.A01.tracks.1.trigs.65",
    ]
  );
  assert.match(problems[0], /unknown field; known: \$schema, name, tempo/);
  assert.match(problems[1], /the name "Z01" doesn't fit: A01 to F16/);
  assert.match(problems[2], /"BASS" is not one of KICK, SNARE/);
  assert.throws(() => build(spec), /doesn't fit spec\.schema\.json:\n {2}spec\.nmae/);
});

test("the schema accepts the example and every name the tool knows", () => {
  const example = JSON.parse(readFileSync(new URL("../../tools/mcprj/examples/night-beat.json", import.meta.url)));
  assert.deepEqual(validate(example), []);
  const d = SCHEMA.$defs;
  assert.deepEqual(d.track.properties.machine.enum, MACHINES);
  assert.deepEqual(d.trig.properties.condition.enum, CONDITIONS);
  assert.deepEqual(d.pattern.properties.speed.enum, SPEEDS);
  assert.deepEqual(Object.keys(d.pattern.properties.fx.properties), FX);
  assert.deepEqual(d.trig.properties.retrig.oneOf[1].properties.rate.enum, RETRIG_RATES);
  assert.deepEqual(Object.keys(d.trig.properties.locks.properties), Object.values(PARAMS));
  assert.deepEqual(
    Object.keys(d.track.properties.params.properties),
    Object.values(PARAMS).filter((p) => p !== "MACHINE")
  );
  const steps = new RegExp(d.track.properties.steps.pattern);
  assert.ok(steps.test("x...x... | x...x..."));
  assert.ok(!steps.test("x".repeat(65)));
  for (const note of ["G5", "C#4", 60]) assert.deepEqual(validate(note, d.trig.properties.note), []);
  for (const length of [0.125, 10, "INF"]) assert.deepEqual(validate(length, d.trig.properties.length), []);
  assert.equal(validate(true, d.trig.properties.retrig).length, 0);
  assert.equal(validate({ rate: "1/7" }, d.trig.properties.retrig).length, 1);
});

test("the command line tool reads what it builds", () => {
  const bin = new URL("../../tools/mcprj/bin/mcprj.mjs", import.meta.url).pathname;
  const fixturePath = new URL("../fixtures/mcprj/MAP1.mcprj", import.meta.url).pathname;
  const info = execFileSync("node", [bin, "info", fixturePath], { encoding: "utf8" });
  assert.match(info, /^MAP1 {2}firmware 1\.13 {2}tempo 120 {2}on B06 {2}muted T2/);
  assert.match(info, /A13 {2}93 BPM {2}32 steps/);
  assert.match(execFileSync("node", [bin, "check", fixturePath], { encoding: "utf8" }), /checksum OK, round trip OK/);
  const json = JSON.parse(execFileSync("node", [bin, "dump", fixturePath, "-p", "A12"], { encoding: "utf8" }));
  assert.equal(json.locks[0].param, "DECAY");
});
