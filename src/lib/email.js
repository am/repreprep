import { env } from "cloudflare:workers";

/* Sign-in emails go out through Cloudflare Email Service (binding EMAIL in wrangler.jsonc), from an address on
   repreprep.studio, which is set up for sending (DKIM, SPF and DMARC on the domain). Previews have no EMAIL
   binding, so they offer no email sign-in. */
export const FROM = { email: "signin@repreprep.studio", name: "Rep Rep Rep" };
export const emailReady = () => !!env.EMAIL;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* one short message with one button; the text part says the same for mail apps without HTML */
export async function sendLink({ to, subject, intro, button, link, outro }) {
  const text = [intro, "", link, "", outro, "", "Rep Rep Rep · repreprep.studio"].join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f1ec;font:16px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#1d1b19">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:28px">
<p style="margin:0 0 16px;font-weight:700;letter-spacing:.04em">REP REP REP</p>
<p style="margin:0 0 20px">${esc(intro)}</p>
<p style="margin:0 0 20px"><a href="${esc(link)}" style="display:inline-block;background:#1d1b19;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">${esc(button)}</a></p>
<p style="margin:0 0 8px;font-size:14px;color:#5f5a54">${esc(outro)}</p>
<p style="margin:0;font-size:13px;color:#8a847c;word-break:break-all">${esc(link)}</p>
</div></body></html>`;
  await env.EMAIL.send({ from: FROM, to, subject, text, html });
}
