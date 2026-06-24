"use strict";

// Smoke test: the episode watch-through hand-off must open the real review
// screen that owns each soft note (#582 / #583). Acting on a note should be a
// navigable link to that screen, and every owner screen must be a real
// prototype. Run with:
//   `node prototype/episode-watch-through-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "episode-watch-through-preview.html"), "utf8");

// Owner → review screen each note hands off to. Each value is a real prototype.
const ownerScreens = {
  captions: "audio-caption-quality-review.html",
  visuals: "contextual-broll-moments.html",
  audio: "audio-cleanup-controls.html",
  framing: "speaker-framing-safety.html",
};

for (const [owner, file] of Object.entries(ownerScreens)) {
  assert.ok(source.includes(`${owner}: "${file}"`), `watch-through routes ${owner} to ${file}`);
  assert.ok(
    fs.existsSync(path.join(root, "prototype", file)),
    `review screen ${file} exists as a real screen`,
  );
}

// The hand-off is a navigable link, not just an in-page panel.
assert.ok(
  source.includes('openLink = document.createElement("a")'),
  "hand-off renders an anchor element",
);
assert.ok(
  source.includes("openLink.href = fixScreen"),
  "hand-off links to the review screen that owns the element",
);
assert.ok(
  source.includes('openLink.className = "handoff-link"'),
  "hand-off link is class-tagged for styling",
);

// Internal "review surface" language stays out of the creator-facing note copy.
assert.ok(!/review surface that owns/i.test(source), "summary note uses creator-facing copy");

console.log("episode watch-through: note hand-offs open the review screen that owns the fix");
