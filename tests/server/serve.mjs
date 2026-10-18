// Keeps a built site running in Cloudflare's local runtime for the signed-in browser tests (tests/e2e/account.spec.mjs).
// Usage: node tests/server/serve.mjs <dist dir> <port>. Build it first: SIGN_IN=true npx astro build --outDir dist-signin
import { startWorker } from "./worker.mjs";

const [dist = "dist-signin", port = "8793"] = process.argv.slice(2);
const w = await startWorker({ dist, port: +port, vars: { ALLOW_TEST_SIGNIN: "1" }, own: false });
console.log(`Serving ${dist} on ${w.origin}`);
for (const sig of ["SIGINT", "SIGTERM"])
  process.on(sig, () => {
    w.stop();
    process.exit(0);
  });
