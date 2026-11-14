// ESLint: catches mistakes Prettier can't (unused variables and imports, undefined names, unreachable code).
// Only the recommended rules of ESLint, typescript-eslint (for the TypeScript in .astro files) and
// eslint-plugin-astro. Run with `npm run lint`; `npm test` runs it too.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import globals from "globals";

export default [
  { ignores: ["dist/", "dist-signin/", ".astro/", ".wrangler/", ".compare/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.ts", "**/*.astro/*.ts"],
    languageOptions: { parser: tseslint.parser },
    plugins: { "@typescript-eslint": tseslint.plugin },
  },
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      /* an unused argument before a used one is fine (`(_, ctx) => …`) */
      "no-unused-vars": ["error", { args: "after-used", caughtErrors: "none", ignoreRestSiblings: true }],
      /* `catch {}` is how the site ignores a browser that blocks storage */
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  /* type declarations only declare */
  { files: ["**/*.d.ts"], rules: { "no-unused-vars": "off" } },
];
