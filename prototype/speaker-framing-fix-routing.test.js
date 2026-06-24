"use strict";

// Guards speaker-framing-safety hand-off links (#583): a coverage issue is resolved on
// the screen that owns the overlap, so captions/lower-third route to layout safe areas,
// b-roll routes to the contextual b-roll screen, and crop-driven checks (tight crop,
// mobile cutoff) route to the destination crop preview screen (#828).
// Run with: `node prototype/speaker-framing-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "speaker-framing-safety.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "framing issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const checksBlock = html.match(/const checks = \{([\s\S]*?)\n\s{6}\};/);
assert.ok(checksBlock, "framing checks are declared");
const checksText = checksBlock[1];
const checkKeys = ["clear", "captions", "lower", "broll", "tight", "panel", "mobile"];
const keyStarts = checkKeys.map((key) => ({ key, at: checksText.indexOf(`${key}: {`) }));
for (const { key, at } of keyStarts) {
  assert.ok(at >= 0, `"${key}" check is declared`);
}
keyStarts.sort((a, b) => a.at - b.at);

const ownerByCheck = {};
for (let i = 0; i < keyStarts.length; i++) {
  const start = keyStarts[i].at;
  const end = i + 1 < keyStarts.length ? keyStarts[i + 1].at : checksText.length;
  const body = checksText.slice(start, end);
  const fixScreen = body.match(/fixScreen:\s*"([a-z0-9-]+\.html)"/);
  if (fixScreen) {
    ownerByCheck[keyStarts[i].key] = fixScreen[1];
  }
}

const fixScreens = Object.values(ownerByCheck);
assert.ok(fixScreens.length >= 2, "framing coverage issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.strictEqual(ownerByCheck.captions, "layout-safe-areas.html", "caption coverage routes to layout safe areas");
assert.strictEqual(ownerByCheck.lower, "layout-safe-areas.html", "lower-third coverage routes to layout safe areas");
assert.strictEqual(ownerByCheck.broll, "contextual-broll-moments.html", "b-roll coverage routes to the contextual b-roll screen");
assert.strictEqual(ownerByCheck.tight, "destination-crop-preview.html", "too-tight crop routes to the destination crop preview");
assert.strictEqual(ownerByCheck.mobile, "destination-crop-preview.html", "mobile cutoff routes to the destination crop preview");
assert.ok(!ownerByCheck.panel, "panel-size issues are unrelated to crop and keep no owning fix screen");

console.log(`speaker framing safety: ${fixScreens.length} coverage checks open their owning fix screen`);
