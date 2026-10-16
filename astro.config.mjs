// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// Course pages are built ahead of time (one HTML file per lesson step); only /api and /auth run on the server.
export default defineConfig({
  site: "https://repreprep.studio",
  trailingSlash: "never",
  build: { format: "file" },
  session: false,
  adapter: cloudflare({ imageService: "passthrough", imagesBindingName: false }),
  devToolbar: { enabled: false },
});
