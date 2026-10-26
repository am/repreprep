#!/usr/bin/env node
// mcprj: read and write Elektron Model:Cycles project files. Run with no arguments for help.
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { Project, build, emptyProject, unpack } from "../src/index.mjs";
import { readZip } from "../src/zip.mjs";

const HELP = `mcprj: read and write Elektron Model:Cycles project files (.mcprj)

  mcprj info <file.mcprj>                  project settings and a step grid of every used pattern
  mcprj dump <file.mcprj> [--all] [-p A01]  everything decoded, as JSON
  mcprj check <file.mcprj>                 verify the checksum and that writing it back is lossless
  mcprj raw <file.mcprj> <out.bin>         write the decompressed payload, for poking at bytes
  mcprj build <spec.json> -o <out.mcprj> [--base <file.mcprj>]
                                           make a project from a JSON spec (see README.md)
  mcprj new <NAME> -o <out.mcprj>          an empty project

Send a file to the unit with Elektron Transfer.`;

const { values: opts, positionals: args } = parseArgs({
  allowPositionals: true,
  options: {
    all: { type: "boolean" },
    pattern: { type: "string", short: "p" },
    out: { type: "string", short: "o" },
    base: { type: "string" },
    help: { type: "boolean", short: "h" },
  },
});

process.on("uncaughtException", (e) => fail(`mcprj: ${e.message}`));

const load = (file) => Project.parse(readFileSync(file));
const need = (v, what) => v ?? fail(`missing ${what}\n\n${HELP}`);
function fail(message) {
  console.error(message);
  process.exit(1);
}
function save(project, file) {
  writeFileSync(file, project.toBytes());
  console.log(`wrote ${file} (${project.name})`);
}

function info(project) {
  const lines = [
    `${project.name}  firmware ${project.manifest.FirmwareVersion}  tempo ${project.tempo}  on ${project.activePattern}` +
      (project.muted.length ? `  muted T${project.muted.join(" T")}` : ""),
  ];
  for (const p of project.patterns()) {
    if (p.isEmpty() && !p.kit.name && !p.title) continue;
    lines.push("", `${p.name} ${p.title || ""}`.trim() + `  ${p.tempo} BPM  ${p.length} steps  ${p.speed}`);
    p.tracks.forEach((t, i) => {
      let grid = "";
      for (let s = 0; s < t.stepCount; s++) grid += (s && s % 16 === 0 ? " " : "") + (t.trig(s) ? "x" : ".");
      if (grid.includes("x")) lines.push(`  T${i + 1} ${String(p.kit.sounds[i].machine).padEnd(5)} ${grid}`);
    });
    const locks = p.locks();
    if (locks.length) lines.push(`  locks: ${locks.map((l) => `T${l.track} ${l.param}`).join(", ")}`);
  }
  return lines.join("\n");
}

const [command, file, out] = args;
if (opts.help || !command) {
  console.log(HELP);
} else if (command === "info") {
  console.log(info(load(need(file, "file"))));
} else if (command === "dump") {
  const project = load(need(file, "file"));
  const json = opts.pattern ? project.pattern(opts.pattern.toUpperCase()).toJSON() : project.toJSON({ all: opts.all });
  console.log(JSON.stringify(json, null, 2));
} else if (command === "check") {
  const bytes = readFileSync(need(file, "file"));
  const project = Project.parse(bytes); // throws on a bad checksum
  const again = Project.parse(project.toBytes());
  if (Buffer.compare(again.raw, project.raw)) fail("round trip changed the payload");
  console.log(`${file}: checksum OK, round trip OK`);
} else if (command === "raw") {
  const files = readZip(readFileSync(need(file, "file")));
  const manifest = JSON.parse(new TextDecoder().decode(files.get("manifest.json")));
  writeFileSync(need(out, "output file"), unpack(files.get(manifest.Payload)).raw);
  console.log(`wrote ${out}`);
} else if (command === "build") {
  const spec = JSON.parse(readFileSync(need(file, "spec file"), "utf8"));
  save(build(spec, opts.base ? load(opts.base) : undefined), need(opts.out, "-o <out.mcprj>"));
} else if (command === "new") {
  const project = emptyProject();
  project.name = need(file, "project name");
  save(project, need(opts.out, "-o <out.mcprj>"));
} else {
  fail(`unknown command ${command}\n\n${HELP}`);
}
