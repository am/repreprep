import { currentUser, json, sameOrigin } from "../../lib/auth.js";
import { db } from "../../lib/db.js";
export const prerender = false;
const MAX_BYTES = 512 * 1024;

/* your saved progress: steps ticked, lessons finished, notes, layout */
export async function GET({ url, cookies }) {
  const user = await currentUser(url, cookies);
  if (!user) return json({ error: "Not signed in" }, 401);
  const row = await (await db()).prepare("SELECT data, updated_at FROM progress WHERE user_id=?").bind(user.id).first();
  return json({ data: row ? JSON.parse(row.data) : null, updatedAt: row?.updated_at ?? 0 });
}

export async function PUT({ request, url, cookies }) {
  if (!sameOrigin(request, url)) return json({ error: "Bad origin" }, 403);
  const user = await currentUser(url, cookies);
  if (!user) return json({ error: "Not signed in" }, 401);
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: "Progress is too large" }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: "Invalid JSON" }, 400); }
  const data = body?.data;
  if (!data || typeof data !== "object" || Array.isArray(data) || typeof data.inst !== "object") return json({ error: "Expected {data:{inst:{…}}}" }, 400);
  const updatedAt = Number(data.updatedAt) || Date.now();
  await (await db()).prepare("INSERT INTO progress (user_id,data,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at")
    .bind(user.id, JSON.stringify(data), updatedAt).run();
  return json({ ok: true, updatedAt });
}
