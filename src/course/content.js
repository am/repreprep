/* The instruments with their lessons from the content collections, for the pages.
   Scripts and tests read the same files with files.js. */
import { getCollection } from "astro:content";
import { INSTRUMENTS, withLessons, linkShared } from "./index.js";

/* every instrument, the ready ones with their lessons */
export async function catalog() {
  const entries = await getCollection("lessons");
  const concepts = Object.fromEntries((await getCollection("concepts")).map((e) => [e.id, e.data]));
  const all = INSTRUMENTS.map((I) =>
    I.ready
      ? withLessons(
          I,
          entries.filter((e) => e.id.startsWith(I.slug + "/")).map((e) => e.data),
          concepts
        )
      : I
  );
  linkShared(all.filter((I) => I.ready));
  return all;
}
/* the instruments that have a course */
export const courses = async () => (await catalog()).filter((I) => I.ready);
