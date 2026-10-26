// Writes the Model:Cycles lesson projects (src/course/model-cycles/projects.js) to public/projects/model-cycles.
// `npm run projects` writes them; with --check (part of `npm run check`) it only fails when a file there is
// missing, out of date or not offered by any lesson.
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { build, Project } from "../tools/mcprj/src/index.mjs";
import { lessonProjects } from "../src/course/model-cycles/projects.js";

const DIR = new URL("../public/projects/model-cycles/", import.meta.url);
const WHEN = new Date(2026, 0, 1); // fixed, so an unchanged project writes the same bytes
const check = process.argv.includes("--check");

const files = lessonProjects();
const problems = [];
mkdirSync(DIR, { recursive: true });
for (const { file, spec } of files) {
  const path = new URL(file.split("/").pop(), DIR);
  const project = build(spec);
  if (!check) {
    writeFileSync(path, project.toBytes(WHEN));
    continue;
  }
  if (!existsSync(path)) {
    problems.push(`${file} is missing`);
    continue;
  }
  // compare what the unit reads, not the bytes: another zlib may pack the same project differently
  const saved = Project.parse(readFileSync(path));
  const same =
    JSON.stringify(saved.manifest) === JSON.stringify(project.manifest) &&
    Buffer.from(saved.raw).equals(Buffer.from(project.raw));
  if (!same) problems.push(`${file} is out of date`);
}
const offered = new Set(files.map((f) => f.file.split("/").pop()));
for (const name of readdirSync(DIR)) if (!offered.has(name)) problems.push(`${name} isn't offered by any lesson`);

if (problems.length) {
  console.error(`Lesson projects:\n  ${problems.join("\n  ")}\nRun npm run projects to write them again.`);
  process.exit(1);
}
console.log(`Lesson projects ${check ? "OK" : "written"}: ${files.length} files.`);
