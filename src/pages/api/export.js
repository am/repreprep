import { json } from "../../lib/auth.js";
import { db } from "../../lib/db.js";
export const prerender = false;

/* everything this site keeps about you, as one JSON file */
export async function GET({ locals: { user } }) {
  if (!user) return json({ error: "Not signed in" }, 401);
  const d = await db();
  const [u, accounts, sessions, progress, messages] = await d.batch([
    d.prepare('SELECT "name", "email", "createdAt" FROM "user" WHERE "id"=?').bind(user.id),
    d.prepare('SELECT "providerId", "accountId" FROM "account" WHERE "userId"=?').bind(user.id),
    d.prepare('SELECT "expiresAt", "ipAddress", "userAgent" FROM "session" WHERE "userId"=?').bind(user.id),
    d.prepare("SELECT data, updated_at FROM progress WHERE user_id=?").bind(user.id),
    d.prepare("SELECT created_at, reply_to, body FROM messages WHERE user_id=? ORDER BY created_at").bind(user.id),
  ]);
  const iso = (t) => (t ? new Date(t).toISOString() : null);
  const me = u.results[0] || {};
  const p = progress.results[0];
  const body = {
    exportedAt: new Date().toISOString(),
    account: { name: me.name ?? null, email: me.email ?? null, createdAt: iso(me.createdAt) },
    signInWith: accounts.results.map((a) => ({ provider: a.providerId, providerUserId: a.accountId })),
    sessions: sessions.results.map((s) => ({
      expiresAt: iso(s.expiresAt),
      ipAddress: s.ipAddress,
      browser: s.userAgent,
    })),
    progress: p ? { updatedAt: iso(p.updated_at), data: JSON.parse(p.data) } : null,
    messages: messages.results.map((m) => ({ sentAt: iso(m.created_at), replyTo: m.reply_to, message: m.body })),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="repreprep-account.json"',
      "Cache-Control": "no-store",
    },
  });
}
