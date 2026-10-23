/* The shape of a lesson file (src/content/lessons/<instrument>/*.yaml). Astro checks every file against it
   when it builds the site, so a typo in a lesson stops the build with the file and the field it's in.
   A grid row can give its hits as "1,5,9,13" (with vel for their velocity, and "3:.4" for one step's own);
   they become the row's 16 velocities, v. */
import { z } from "astro/zod";
import { hits, ROWC } from "./shared/html.js";

const text = z.string().min(1);
const row = z
  .strictObject({
    n: text /* the row's name */,
    s: z.enum(Object.keys(ROWC)) /* its sound */,
    note: z.number().optional() /* MIDI note for a pitched sound */,
    hits: z.union([z.string(), z.number()]).optional() /* steps that play, "1,5,9,13" */,
    vel: z.number().min(0).max(1).optional(),
    v: z.array(z.number().min(0).max(1)).length(16).optional(),
    len: z.number().int().min(1).max(16).optional() /* a shorter loop than 16 steps */,
    p: z.array(z.number()).length(16).optional() /* a MIDI note per step */,
    new: z.string().optional() /* steps added in the last lesson, "2,4,6", drawn outlined */,
    nudge: z.string().optional() /* steps played off the grid, "12:.3" = a third of a step late */,
  })
  .refine((r) => (r.hits !== undefined) !== (r.v !== undefined), "give a row either hits or v")
  .transform(({ hits: h, vel, new: nw, nudge, ...r }) => ({
    ...r,
    ...(h === undefined ? {} : { v: hits(String(h), vel ?? 0.85) }),
    ...(nw ? { nw: nw.split(",").map(Number) } : {}),
    ...(nudge ? { off: hits(nudge, 0) } : {}),
  }));
const preset = z.strictObject({
  name: text,
  bpm: z.number(),
  note: text.optional(),
  swing: z.number().min(50).max(75).optional(),
  rows: z.array(row).min(1),
});
const grid = z
  .strictObject({
    title: text.optional(),
    edit: z.boolean().optional(),
    bpm: z.number().optional(),
    swingCtl: z.boolean().optional(),
    rows: z.array(row).min(1).optional(),
    presets: z.array(preset).min(2).optional(),
  })
  .refine((g) => !!g.rows !== !!g.presets, "give a grid either rows or presets");
/* what a pattern should hold when a lesson starts: its tracks as a grid, one tab per bar when it has several */
const pattern = z
  .strictObject({
    slot: z.string().regex(/^[A-H]\d\d$/) /* "B01" */,
    bpm: z.number(),
    swing: z.number().min(50).max(75).optional() /* on every track, shown under each track name */,
    rows: z.array(row).min(1).optional() /* a one-bar pattern */,
    bars: z.array(z.array(row).min(1)).min(2).optional() /* or one set of rows per bar */,
  })
  .refine((p) => !!p.rows !== !!p.bars, "give a pattern either rows or bars");

const step = z
  .strictObject({
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      .refine((s) => s !== "intro", "intro is the lesson's own first step") /* saved ticks use it: never change it */,
    k: z
      .enum(["ready", "learn", "play", "check"])
      .optional() /* the step's kind; play when left out. ready: where the pattern should be before you start */,
    t: text /* what it says; [KEY] draws a key cap */,
    hl: z.string().optional() /* controls to light: "p:play h:func t:level" (press, hold, turn) */,
    hear: text.optional() /* what to listen for */,
    fig: z
      .union([text, z.strictObject({ grid }), z.strictObject({ pattern })])
      .optional() /* a drawing by name, a playable grid, or the pattern as it should be */,
    q: z.array(text).min(2).optional() /* a Check question's answers, the right one starting with ! */,
    a: text.optional() /* why that answer is right */,
    more: z
      .strictObject({ text, to: z.enum(["panel", "saving", "machines", "shortcuts"]) })
      .optional() /* a link to one of the instrument's reference tabs */,
  })
  .refine((s) => !s.q || s.q.filter((o) => o.startsWith("!")).length === 1, "mark exactly one answer right with !")
  .refine((s) => !s.q || s.a, "a question needs its explanation, a")
  .refine((s) => (s.k === "ready") === !!(s.fig && s.fig.pattern), "a ready step shows the pattern, fig: { pattern }");

export const lessonSchema = z
  .strictObject({
    id: z.string().regex(/^[ws]\d\d$/) /* saved progress uses it: never change it */,
    number: z.number().int().min(1).optional() /* lessons are numbered; song studies are not */,
    song: text.optional() /* "Artist – Title" for a song study */,
    unit: text,
    title: text,
    goal: text,
    listen: text.optional(),
    concepts: z.array(z.strictObject({ h: text, p: z.array(text).min(1) })),
    steps: z.array(step).min(1),
    challenge: text.optional(),
  })
  .refine((l) => !!l.song !== (l.number !== undefined), "a lesson has a number, a song study has a song")
  .refine((l) => new Set(l.steps.map((s) => s.id)).size === l.steps.length, "two steps share an id");

/* One release in the changelog (src/content/changelog.yaml): its version, the day it went live, a title, what
   changed on the site, and what changed in which lessons. A lesson change names the lesson as
   "<instrument slug>/<lesson id>". */
export const releaseSchema = z.strictObject({
  id: z.string().regex(/^\d+\.\d+\.\d+$/) /* the version, "0.3.0" */,
  date: z.string().regex(/^\d{4}-\d\d-\d\d$/),
  title: text,
  site: z.array(text).optional(),
  lessons: z
    .array(
      z.strictObject({
        lesson: z.string().regex(/^[a-z0-9-]+\/[ws]\d\d$/),
        what: text,
      })
    )
    .optional(),
});
