// The browser safety headers (src/lib/security-headers.js) are the same for built pages (public/_headers).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SECURITY_HEADERS } from "../../src/lib/security-headers.js";

test("public/_headers sends every safety header on every page", () => {
  const file = readFileSync(new URL("../../public/_headers", import.meta.url), "utf8");
  const block = file.split(/\n(?=\S)/).find((b) => b.startsWith("/*\n"));
  assert.ok(block, "a /* block in public/_headers");
  const sent = Object.fromEntries(
    block
      .split("\n")
      .slice(1)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => [l.slice(0, l.indexOf(":")), l.slice(l.indexOf(":") + 1).trim()])
  );
  assert.deepEqual(sent, SECURITY_HEADERS);
});
