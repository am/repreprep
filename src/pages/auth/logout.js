import { endSession, json, sameOrigin } from "../../lib/auth.js";
export const prerender = false;

export async function POST({ request, url, cookies }) {
  if (!sameOrigin(request, url)) return json({ error: "Bad origin" }, 403);
  await endSession(cookies);
  return json({ ok: true });
}
