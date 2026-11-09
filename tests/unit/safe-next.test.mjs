// Where the site sends you after logging in (src/lib/safe-next.js): only pages on this site, never another one,
// however the address is disguised.
import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../../src/lib/safe-next.js";

const SITE = "https://repreprep.studio";

test("pages on this site are kept", () => {
  for (const p of ["/account", "/model-cycles/lessons/05/3", "/account?x=1#top", "/%5Cfoo"])
    assert.equal(safeNext(p), p);
});

test("anything that could leave the site goes to /account", () => {
  const bad = [
    null,
    undefined,
    "",
    42,
    "account",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "/\t/evil.example",
    "/\n/evil.example",
    "/\r/evil.example",
    "\t//evil.example",
    "/ /evil.example",
    "/\u0000/evil.example",
  ];
  for (const p of bad) {
    assert.equal(safeNext(p), "/account", JSON.stringify(p));
  }
});

test("what is kept stays on this site in a browser", () => {
  for (const p of ["/account", "/a/b?c=//evil.example", "/%2F%2Fevil.example"])
    assert.equal(new URL(safeNext(p), SITE).origin, SITE);
});
