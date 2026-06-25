"use strict";

// Guards all caption-review fix routes so connected hand-offs stay intact (#583 / #584).
// Run with: `node prototype/audio-caption-quality-review-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(__dirname, "audio-caption-quality-review.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const nav = fs.readFileSync(path.join(root, "preview", "episode-flow-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/audio-caption-quality-review.html"),
  "preview shell links to caption quality review",
);
assert.ok(
  nav.includes('"audio-caption-quality-review.html"'),
  "episode flow nav keeps caption quality review in the connected flow",
);

[
  'fixScreen: "transcript-glossary.html"',
  'fixScreen: "pause-crosstalk-cleanup.html"',
  'fixScreen: "layout-safe-areas.html"',
  'fixScreen: "speaker-attribution-review.html"',
].forEach((snippet) => {
  assert.ok(source.includes(snippet), `caption review declares ${snippet}`);
});

[
  "transcript-glossary.html",
  "pause-crosstalk-cleanup.html",
  "layout-safe-areas.html",
  "speaker-attribution-review.html",
].forEach((file) => {
  assert.ok(
    fs.existsSync(path.join(__dirname, file)),
    `${file} exists as a real prototype screen`,
  );
  assert.ok(
    shell.includes(`../prototype/${file}`),
    `preview shell links to ${file}`,
  );
});

assert.ok(
  source.includes("issue.fixScreen = flag.fixScreen"),
  "caption review copies fixScreen from the owning flag",
);
assert.ok(
  source.includes("issue.fixLabel = flag.fixLabel"),
  "caption review copies fixLabel from the owning flag",
);
assert.ok(
  source.includes("openLink.href = issue.fixScreen"),
  "caption review renders issue fix links from issue.fixScreen",
);

console.log("audio caption quality review: all five fix routes stay connected");
