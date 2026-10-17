import { currentUser, sameOrigin } from "../../lib/auth.js";
import { db } from "../../lib/db.js";
import { sendContactMail } from "../../lib/mail.js";
export const prerender = false;

const MAX_BODY = 4000, MAX_REPLY_TO = 200, DAILY_CAP = 100, KEEP_DAYS = 365, DAY = 864e5;

/* the form on /privacy: emails the message to the site owner and keeps a copy in D1 (`npm run messages`) */
export async function POST({ request, url, cookies, redirect }) {
  const back = (q) => redirect(`/privacy?${q}#contact`, 303);
  if (!sameOrigin(request, url)) return new Response("Bad origin", { status: 403 });
  const form = await request.formData().catch(() => null);
  if (!form) return back("error=empty");
  if (String(form.get("website") || "")) return back("sent=1"); /* bots fill the hidden field */
  const body = String(form.get("message") || "").trim();
  const replyTo = String(form.get("reply_to") || "").trim().slice(0, MAX_REPLY_TO) || null;
  if (!body) return back("error=empty");
  if (body.length > MAX_BODY) return back("error=long");
  const d = await db();
  const now = Date.now();
  await d.prepare("DELETE FROM messages WHERE created_at<?").bind(now - KEEP_DAYS * DAY).run();
  const recent = await d.prepare("SELECT COUNT(*) AS n FROM messages WHERE created_at>?").bind(now - DAY).first();
  if ((recent?.n ?? 0) >= DAILY_CAP) return back("error=busy");
  const user = await currentUser(url, cookies).catch(() => null);
  await d.prepare("INSERT INTO messages (created_at,user_id,reply_to,body) VALUES (?,?,?,?)").bind(now, user?.id ?? null, replyTo, body).run();
  await sendContactMail({ body, replyTo, signedIn: !!user, origin: url.origin });
  return back("sent=1");
}
