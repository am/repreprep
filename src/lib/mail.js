import { EmailMessage } from "cloudflare:email";
import { env } from "./db.js";

/* Contact-form messages go to the site owner through Cloudflare Email Routing.
   CONTACT_TO (a secret) must be a verified destination address on the repreprep.studio zone. */
const FROM = "contact@repreprep.studio";
const b64 = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const header = (s) => `=?UTF-8?B?${b64(s)}?=`;
const oneLine = (s) => String(s).replace(/[\r\n]+/g, " ").trim();
const looksLikeEmail = (s) => /^[^\s@<>",]+@[^\s@<>",]+\.[^\s@<>",]+$/.test(s || "");

export const mailReady = () => !!(env.MAIL && env.CONTACT_TO);

/* returns true when sent; never throws, the message is already saved in D1 */
export async function sendContactMail({ body, replyTo, signedIn, origin }) {
  if (!mailReady()) return false;
  const preview = oneLine(body).slice(0, 60);
  const text = [
    body,
    "",
    "--",
    `Reply to: ${replyTo || "(none given)"}`,
    `Signed in: ${signedIn ? "yes" : "no"}`,
    `Sent from: ${origin}/privacy`,
  ].join("\r\n");
  const lines = [
    `From: ${header("Rep Rep Rep")} <${FROM}>`,
    `To: <${env.CONTACT_TO}>`,
    looksLikeEmail(replyTo) ? `Reply-To: <${oneLine(replyTo)}>` : null,
    `Subject: ${header(`Rep Rep Rep message: ${preview}`)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@repreprep.studio>`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    b64(text).replace(/.{76}/g, "$&\r\n"),
  ].filter((l) => l !== null);
  try {
    await env.MAIL.send(new EmailMessage(FROM, env.CONTACT_TO, lines.join("\r\n")));
    return true;
  } catch (e) {
    console.error("contact mail failed", e);
    return false;
  }
}
