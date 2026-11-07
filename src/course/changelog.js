/* The changelog for the pages: every release, newest first, and the site's version (the newest release).
   Scripts and tests read the same file with files.js. */
import { getCollection } from "astro:content";
import { newestFirst } from "./shared/updates.js";

export const releases = async () => newestFirst((await getCollection("changelog")).map((e) => e.data));
export const version = async () => (await releases())[0].id;
