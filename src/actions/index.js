/* Astro Actions: what the browser code asks the server for, with its input checked here.
   Called from src/client/progress.js and the account page as actions.account.me() and so on.
   The middleware has already refused writes from other sites and found who is signed in (locals.user). */
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro/zod";
import { db } from "../lib/db.js";
import { providers, endSession } from "../lib/auth.js";

const MAX_BYTES = 512 * 1024;
function signedIn({ locals }) {
  if (!locals.user) throw new ActionError({ code: "UNAUTHORIZED", message: "Not signed in" });
  return locals.user;
}

export const server = {
  account: {
    /* who is signed in, and which sign-in options this site offers */
    me: defineAction({
      handler: (_, ctx) => ({ user: ctx.locals.user && { name: ctx.locals.user.name, email: ctx.locals.user.email }, providers: providers(ctx.url) }),
    }),
    signOut: defineAction({
      handler: async (_, { cookies }) => { await endSession(cookies); },
    }),
    /* delete the account and everything saved with it */
    delete: defineAction({
      handler: async (_, ctx) => {
        const user = signedIn(ctx);
        const d = await db();
        await d.batch([
          d.prepare("UPDATE messages SET user_id=NULL WHERE user_id=?").bind(user.id),
          ...["progress", "sessions", "accounts"].map((t) => d.prepare(`DELETE FROM ${t} WHERE user_id=?`).bind(user.id)),
          d.prepare("DELETE FROM users WHERE id=?").bind(user.id),
        ]);
        await endSession(ctx.cookies);
      },
    }),
  },
  /* your saved progress: steps ticked, lessons finished, notes, layout */
  progress: {
    load: defineAction({
      handler: async (_, ctx) => {
        const user = signedIn(ctx);
        const row = await (await db()).prepare("SELECT data, updated_at FROM progress WHERE user_id=?").bind(user.id).first();
        return { data: row ? JSON.parse(row.data) : null, updatedAt: row?.updated_at ?? 0 };
      },
    }),
    save: defineAction({
      input: z.object({ data: z.looseObject({ inst: z.record(z.string(), z.unknown()) }) }),
      handler: async ({ data }, ctx) => {
        const user = signedIn(ctx);
        const json = JSON.stringify(data);
        if (json.length > MAX_BYTES) throw new ActionError({ code: "CONTENT_TOO_LARGE", message: "Progress is too large" });
        const updatedAt = Number(data.updatedAt) || Date.now();
        await (await db()).prepare("INSERT INTO progress (user_id,data,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at")
          .bind(user.id, json, updatedAt).run();
        return { updatedAt };
      },
    }),
  },
};
