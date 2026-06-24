"use strict";

// Guards the caption-review hand-off links (#583): a flagged caption line opens the
// screen that owns its fix — uncertain names -> transcript glossary, cross-talk ->
// pause & cross-talk cleanup, lower-third collision -> layout safe areas, and a
// wrong speaker label -> speaker attribution review (not a wording edit here).
// Run with: `node prototype/audio-caption-quality-review.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "audio-caption-quality-review.html"), "utf8");

// The issue renderer opens the owning fix screen via a real link.
assert.ok(html.includes('openLink = document.createElement("a")'), "flagged lines render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

// The expected flag -> owning screen mapping is present, and every target exists.
const expected = {
  "transcript-glossary.html": /low-confidence[\s\S]*?transcript-glossary\.html/,
  "pause-crosstalk-cleanup.html": /crosstalk[\s\S]*?pause-crosstalk-cleanup\.html/,
  "layout-safe-areas.html": /collision[\s\S]*?layout-safe-areas\.html/,
  "speaker-attribution-review.html": /speaker-mismatch[\s\S]*?speaker-attribution-review\.html/,
};

// A wrong speaker label is handed to attribution review, not treated as a wording edit.
assert.ok(
  /"speaker-mismatch":\s*\["review",\s*"confirm"\]/.test(html),
  "speaker-mismatch offers only review/confirm here; the fix happens in attribution review",
);
for (const [file, pattern] of Object.entries(expected)) {
  assert.ok(pattern.test(html), `flag routes to ${file}`);
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

console.log("caption review: flagged lines open the screen that owns the fix");
