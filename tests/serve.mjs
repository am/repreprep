// Serves the built site (dist/client) the way Cloudflare does for prerendered pages:
// /model-cycles/lessons/05 -> model-cycles/lessons/05.html. Only the static pages; /api and /auth are not served.
// Usage: node tests/serve.mjs [port] [dir]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const port = +(process.argv[2] || 4329);
const root = resolve(process.argv[3] || "dist/client");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

async function file(p) {
  try {
    return (await stat(p)).isFile() ? p : null;
  } catch {
    return null;
  }
}
createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const base = join(root, path);
  if (!base.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  const found = (await file(base)) || (await file(base + ".html")) || (await file(join(base, "index.html")));
  if (!found) {
    res
      .writeHead(404, { "Content-Type": TYPES[".html"] })
      .end(await readFile(join(root, "404.html")).catch(() => "Not found"));
    return;
  }
  res
    .writeHead(200, { "Content-Type": TYPES[extname(found)] || "application/octet-stream" })
    .end(await readFile(found));
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}`));
