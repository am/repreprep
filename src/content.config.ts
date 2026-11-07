// The lessons are a content collection: one YAML file per lesson in src/content/lessons/<instrument>/,
// checked against the lesson schema when the site builds. Entry ids are "<instrument>/<lesson id>".
// The changelog is one YAML file listing the releases, shown on /whats-new and as update notes on lessons.
import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { lessonSchema, releaseSchema } from "./course/schema.js";

export const collections = {
  lessons: defineCollection({
    loader: glob({
      pattern: "*/*.yaml",
      base: "./src/content/lessons",
      generateId: ({ entry, data }) => `${entry.split("/")[0]}/${data.id}`,
    }),
    schema: lessonSchema,
  }),
  // the releases, newest at the top of src/content/changelog.yaml; each one's id is its version
  changelog: defineCollection({ loader: file("src/content/changelog.yaml"), schema: releaseSchema }),
};
