import { auth } from "../../../lib/auth.js";
export const prerender = false;

/* Better Auth's own routes: the Google callback, sign-out, session lookups and so on */
export async function ALL({ request, url }) {
  const a = auth(url);
  if (!a) return new Response("Not found", { status: 404 });
  return a.handler(request);
}
