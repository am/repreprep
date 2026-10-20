/* The instruments with their lessons, read straight from the YAML files, for scripts and tests that run
   outside Astro. The pages get the same data from the content collections (content.js). */
import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";
import { lessonSchema, conceptSchema } from "./schema.js";
import { INSTRUMENTS, withLessons, linkShared } from "./index.js";

const DIR = new URL("../content/", import.meta.url);
function read(dir, schema) {
  return readdirSync(new URL(`${dir}/`, DIR))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => {
      const r = schema.safeParse(parse(readFileSync(new URL(`${dir}/${f}`, DIR), "utf8")));
      if (!r.success) throw new Error(`src/content/${dir}/${f}: ${r.error.message}`);
      return r.data;
    });
}
/* the shared steps, by id */
export const CONCEPTS = Object.fromEntries(read("concepts", conceptSchema).map((c) => [c.id, c]));
/* every instrument, the ready ones with their lessons */
export const CATALOG = INSTRUMENTS.map((I) =>
  I.ready ? withLessons(I, read(`lessons/${I.slug}`, lessonSchema), CONCEPTS) : I
);
/* the instruments that have a course */
export const COURSES = linkShared(CATALOG.filter((I) => I.ready));
