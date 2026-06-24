"use strict";

// Guards the layout safe-areas crop hand-off (#583 / #831): an element flagged as falling
// outside the destination crop opens the screen that owns the crop. Other safe-area checks
// (face-area, overlap, watermark, unreadable) are resolved in place and stay unchanged.
// Run with: `node prototype/layout-safe-areas-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "layout-safe-areas.html"), "utf8");

// The review issue renders an open-fix-screen link.
assert.ok(html.includes('openLink = document.createElement("a")'), "review issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

// The outside-crop check owns a route to the destination crop preview, and the target exists.
const outsideBlock = html.match(/"outside-crop":\s*\{([\s\S]*?)\},/);
assert.ok(outsideBlock, "outside-crop check is present");
assert.ok(
  /owner:\s*\{\s*fixScreen:\s*"destination-crop-preview\.html"/.test(outsideBlock[1]),
  "outside-crop routes to the destination crop preview",
);
assert.ok(
  fs.existsSync(path.join(dir, "destination-crop-preview.html")),
  "the destination crop preview screen exists",
);

// In-place checks do not declare an owning fix screen (their fix is resolved here).
for (const inPlace of ["face-area", "overlap", "watermark", "unreadable"]) {
  const block = html.match(new RegExp(`"?${inPlace}"?:\\s*\\{([\\s\\S]*?)\\},`));
  if (block) {
    assert.ok(!/owner:/.test(block[1]), `${inPlace} stays an in-place fix (no hand-off)`);
  }
}

console.log("layout safe areas: outside-the-crop issues open the destination crop preview");
