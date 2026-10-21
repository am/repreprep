// The lessons are a content collection: one YAML file per lesson in src/content/lessons/<instrument>/,
// checked against the lesson schema when the site builds. Entry ids are "<instrument>/<lesson id>".
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { lessonSchema, conceptSchema } from "./course/schema.js";

export const collections = {
  lessons: defineCollection({
    loader: glob({
      pattern: "*/*.yaml",
      base: "./src/content/lessons",
      generateId: ({ entry, data }) => `${entry.split("/")[0]}/${data.id}`,
    }),
    schema: lessonSchema,
  }),
  // steps several courses share (pure theory), one YAML file each; a lesson takes one with `use: <id>`
  concepts: defineCollection({
    loader: glob({ pattern: "*.yaml", base: "./src/content/concepts", generateId: ({ data }) => String(data.id) }),
    schema: conceptSchema,
  }),
};
