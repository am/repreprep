// The lessons are a content collection: one YAML file per lesson in src/content/lessons/<instrument>/,
// checked against the lesson schema when the site builds. Entry ids are "<instrument>/<lesson id>".
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { lessonSchema } from "./course/schema.js";

export const collections = {
  lessons: defineCollection({
    loader: glob({
      pattern: "*/*.yaml",
      base: "./src/content/lessons",
      generateId: ({ entry, data }) => `${entry.split("/")[0]}/${data.id}`,
    }),
    schema: lessonSchema,
  }),
};
