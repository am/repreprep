// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

const secret = () => envField.string({ context: "server", access: "secret", optional: true });

/* A font family from src/assets/fonts: the files Google Fonts serves for Latin and extended Latin, one per
   weight (or weight range) and style, named <family>-<weight>-<style>-<subset>.woff2. All are under the SIL
   Open Font License (OFL.txt in each folder). Each family becomes a CSS variable, used in src/styles/app.css. */
const SUBSETS = {
  "latin": ["U+0000-00FF", "U+0131", "U+0152-0153", "U+02BB-02BC", "U+02C6", "U+02DA", "U+02DC", "U+0304", "U+0308", "U+0329", "U+2000-206F", "U+20AC", "U+2122", "U+2191", "U+2193", "U+2212", "U+2215", "U+FEFF", "U+FFFD"],
  "latin-ext": ["U+0100-02BA", "U+02BD-02C5", "U+02C7-02CC", "U+02CE-02D7", "U+02DD-02FF", "U+0304", "U+0308", "U+0329", "U+1D00-1DBF", "U+1E00-1E9F", "U+1EF2-1EFF", "U+2020", "U+20A0-20AB", "U+20AD-20C4", "U+2113", "U+2C60-2C7F", "U+A720-A7FF"],
};
function family(name, cssVariable, fallbacks, faces) {
  const dir = name.toLowerCase().replaceAll(" ", "-");
  const variants = faces.flatMap(([weight, style]) => Object.entries(SUBSETS).map(([subset, unicodeRange]) => ({
    src: [`./src/assets/fonts/${dir}/${dir}-${String(weight).replace(" ", "-")}-${style}-${subset}.woff2`], weight, style, unicodeRange, display: "swap",
  })));
  return { provider: fontProviders.local(), name, cssVariable, fallbacks, options: { variants } };
}

// Course pages are built ahead of time (one HTML file per lesson step); only /api and /auth run on the server.
export default defineConfig({
  site: "https://repreprep.studio",
  trailingSlash: "never",
  build: { format: "file" },
  session: false,
  adapter: cloudflare({ imageService: "passthrough", imagesBindingName: false }),
  devToolbar: { enabled: false },
  /* the fonts are served from this site, so visitors' browsers never ask Google for them */
  fonts: [
    family("Manrope", "--font-manrope", ["Helvetica Neue", "Arial", "sans-serif"], [["200 800", "normal"]]),
    family("Rasa", "--font-rasa", ["Georgia", "serif"], [["300 700", "normal"], ["300 700", "italic"]]),
    family("IBM Plex Mono", "--font-plex-mono", ["ui-monospace", "Menlo", "Consolas", "monospace"], [[500, "normal"], [600, "normal"], [700, "normal"]]),
  ],
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
