/* Runs before every server route and action (not the prerendered pages): refuses writes from other sites,
   then finds who is signed in, as locals.user (null when nobody is, or sign-in is off). */
import { defineMiddleware } from "astro:middleware";
import { currentUser, json } from "./lib/auth.js";

const READS = new Set(["GET", "HEAD", "OPTIONS"]);
export const onRequest = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) return next();
  /* browsers send Origin with every POST, PUT and DELETE */
  if (!READS.has(ctx.request.method) && ctx.request.headers.get("Origin") !== ctx.url.origin) return json({ error: "Bad origin" }, 403);
  ctx.locals.user = await currentUser(ctx.url, ctx.cookies);
  return next();
});
