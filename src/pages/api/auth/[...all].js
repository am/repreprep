import { auth } from "../../../lib/auth.js";
export const prerender = false;

/* Better Auth's own routes: the Google callback, magic links, sign-out, session lookups and so on.
   Answers are never cached, and pages they lead to aren't told the address, which can hold a one-time token. */
export async function ALL({ request, url }) {
  const a = auth(url);
  if (!a) return new Response("Not found", { status: 404 });
  const res = await a.handler(request);
  const out = new Response(res.body, res);
  out.headers.set("Referrer-Policy", "no-referrer");
  out.headers.set("Cache-Control", "no-store");
  return out;
}
