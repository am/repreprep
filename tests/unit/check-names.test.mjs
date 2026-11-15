// Names check (scripts/check-names.mjs): only lines added or changed since main are looked at.
import { test } from "node:test";
import assert from "node:assert/strict";
import { changedLines } from "../../scripts/check-names.mjs";

test("added and changed lines come from the new side of each hunk", () => {
  const diff = [
    "diff --git a/src/a.js b/src/a.js",
    "--- a/src/a.js",
    "+++ b/src/a.js",
    "@@ -3 +3 @@ const lesson = 1;",
    "@@ -10,0 +11,2 @@",
    "@@ -20,4 +22,0 @@",
  ].join("\n");
  assert.deepEqual([...changedLines(diff)], [3, 11, 12]);
});
