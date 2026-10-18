// Browser tests (tests/e2e) against the built site, served as static files. Run `npm test`, or
// `npm run build && npx playwright test` to run only these. BASE_URL points them at another server.
// The signed-in tests (account.spec.mjs) run against a build with sign-in on (dist-signin, made by
// tests/server/signin.test.mjs) in Cloudflare's local runtime.
import { defineConfig, devices } from "@playwright/test";

const port = 4329,
  signedInPort = 8793;
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: { baseURL: process.env.BASE_URL || `http://localhost:${port}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: /@phone/, testIgnore: /account\.spec/ },
    { name: "phone", use: { ...devices["Pixel 7"] }, grep: /@phone/, testIgnore: /account\.spec/ },
    {
      name: "signed-in",
      use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${signedInPort}` },
      testMatch: /account\.spec/,
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : [
        { command: `node tests/serve.mjs ${port}`, port, reuseExistingServer: !process.env.CI },
        {
          command: `node tests/server/serve.mjs dist-signin ${signedInPort}`,
          url: `http://localhost:${signedInPort}/`,
          reuseExistingServer: !process.env.CI,
          timeout: 90000,
        },
      ],
});
