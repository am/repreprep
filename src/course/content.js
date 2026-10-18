/* The instruments with their lessons from the content collection, for the pages.
   Scripts and tests read the same files with files.js. */
import { getCollection } from "astro:content";
import { INSTRUMENTS, withLessons } from "./index.js";

/* every instrument, the ready ones with their lessons */
export async function catalog(){
  const entries=await getCollection("lessons");
  return INSTRUMENTS.map(I=>I.ready?withLessons(I,entries.filter(e=>e.id.startsWith(I.slug+"/")).map(e=>e.data)):I);
}
/* the instruments that have a course */
export const courses=async()=>(await catalog()).filter(I=>I.ready);
