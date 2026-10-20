// The list of pages for search engines: every page except lesson steps (their lesson's intro stands for
// them), the progress page and the 404. robots.txt points here.
import { courses } from "../course/content.js";

export const prerender = true;

export async function GET({ site }) {
  const paths = ["/", "/privacy"];
  for (const I of await courses()) {
    paths.push(`/${I.slug}`, `/${I.slug}/machines`, `/${I.slug}/shortcuts`, `/${I.slug}/panel`, `/${I.slug}/saving`);
    paths.push(...I.lessons.map((L) => L.path));
    paths.push(
      ...Object.keys(I.controls)
        .slice(1)
        .map((c) => `/${I.slug}/panel/${c}`)
    );
  }
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
}
