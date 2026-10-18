/* The instruments with their lessons, read straight from the YAML files, for scripts and tests that run
   outside Astro. The pages get the same data from the content collection (content.js). */
import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";
import { lessonSchema } from "./schema.js";
import { INSTRUMENTS, withLessons } from "./index.js";

const DIR = new URL("../content/lessons/", import.meta.url);
function read(I) {
  return readdirSync(new URL(`${I.slug}/`, DIR))
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => {
      const r = lessonSchema.safeParse(parse(readFileSync(new URL(`${I.slug}/${f}`, DIR), "utf8")));
      if (!r.success) throw new Error(`src/content/lessons/${I.slug}/${f}: ${r.error.message}`);
      return r.data;
    });
}
/* every instrument, the ready ones with their lessons */
export const CATALOG = INSTRUMENTS.map((I) => (I.ready ? withLessons(I, read(I)) : I));
/* the instruments that have a course */
export const COURSES = CATALOG.filter((I) => I.ready);
