/* Runs before every server route and action (not the prerendered pages): refuses writes from other sites,
   then finds who is signed in, as locals.user (null when nobody is, or sign-in is off), and adds the browser
   safety headers to the answer (prerendered pages get them from public/_headers). */
import { defineMiddleware } from "astro:middleware";
import { currentUser, json } from "./lib/auth.js";
import { SECURITY_HEADERS } from "./lib/security-headers.js";

const READS = new Set(["GET", "HEAD", "OPTIONS"]);
/* added unless a route chose its own (sign-in links send no referrer at all); set on the answer itself, so the cookies Astro attaches to it stay (redirects have fixed headers: copied) */
const secured = (res) => {
  const set = (r) => Object.entries(SECURITY_HEADERS).forEach(([k, v]) => r.headers.has(k) || r.headers.set(k, v));
  try {
    set(res);
    return res;
  } catch {
    const out = new Response(res.body, res);
    set(out);
    return out;
  }
};
export const onRequest = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) return next();
  /* browsers send Origin with every POST, PUT and DELETE */
  if (!READS.has(ctx.request.method) && ctx.request.headers.get("Origin") !== ctx.url.origin)
    return secured(json({ error: "Bad origin" }, 403));
  ctx.locals.user = await currentUser(ctx.request, ctx.url);
  return secured(await next());
});
