// @ts-check
import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

const secret = () => envField.string({ context: "server", access: "secret", optional: true });

// Course pages are built ahead of time (one HTML file per lesson step); only /api and /auth run on the server.
export default defineConfig({
  site: "https://repreprep.studio",
  trailingSlash: "never",
  build: { format: "file" },
  session: false,
  adapter: cloudflare({ imageService: "passthrough", imagesBindingName: false }),
  devToolbar: { enabled: false },
  env: {
    schema: {
      /* Google/GitHub sign-in and the account link. Off while the site moves to its own Cloudflare account;
         progress is still saved in the browser. Build with SIGN_IN=true to bring sign-in back. */
      SIGN_IN: envField.boolean({ context: "client", access: "public", default: false }),
      /* secrets, set with `npx wrangler secret put <NAME>` (or in .dev.vars on your computer) */
      GOOGLE_CLIENT_ID: secret(), GOOGLE_CLIENT_SECRET: secret(),
      GITHUB_CLIENT_ID: secret(), GITHUB_CLIENT_SECRET: secret(),
      CONTACT_TO: secret(),        /* where contact-form messages are emailed */
      ALLOW_TEST_SIGNIN: secret(), /* "1" offers the local test account on localhost (never on a real domain) */
    },
  },
});
