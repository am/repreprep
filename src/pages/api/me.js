import { currentUser, providers, endSession, json, sameOrigin } from "../../lib/auth.js";
import { db } from "../../lib/db.js";
export const prerender = false;

/* who is signed in, and which sign-in options this site offers */
export async function GET({ url, cookies }) {
  const user = await currentUser(url, cookies);
  return json({ user: user && { name: user.name, email: user.email }, providers: providers(url) });
}

/* delete the account and everything saved with it */
export async function DELETE({ request, url, cookies }) {
  if (!sameOrigin(request, url)) return json({ error: "Bad origin" }, 403);
  const user = await currentUser(url, cookies);
  if (!user) return json({ error: "Not signed in" }, 401);
  const d = await db();
  await d.batch([d.prepare("UPDATE messages SET user_id=NULL WHERE user_id=?").bind(user.id)].concat(["progress", "sessions", "accounts"].map((t) => d.prepare(`DELETE FROM ${t} WHERE user_id=?`).bind(user.id)))
    .concat(d.prepare("DELETE FROM users WHERE id=?").bind(user.id)));
  await endSession(cookies);
  return json({ ok: true });
}
