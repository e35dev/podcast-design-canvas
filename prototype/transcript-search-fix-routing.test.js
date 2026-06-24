"use strict";

// Smoke test: transcript search navigation must hand each result off to a real
// fix screen (#582 / #583). "Open <review>" should be a navigable link to the
// screen that owns the fix, and every owner screen must be a real prototype.
// Run with: `node prototype/transcript-search-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "transcript-search-navigation.html"), "utf8");

// Owner → fix screen each hand-off routes to. Each value is a real prototype.
const ownerScreens = {
  glossary: "transcript-glossary.html",
  attribution: "speaker-attribution-review.html",
  chapter: "episode-chapter-markers.html",
  caption: "audio-caption-quality-review.html",
  clip: "clip-candidate-review.html",
};

for (const [owner, file] of Object.entries(ownerScreens)) {
  assert.ok(source.includes(`${owner}: "${file}"`), `transcript search routes ${owner} to ${file}`);
  assert.ok(
    fs.existsSync(path.join(root, "prototype", file)),
    `fix screen ${file} exists as a real screen`,
  );
}

// The hand-off is a navigable link, not just a status-setting button.
assert.ok(
  source.includes('handOffLink = document.createElement("a")'),
  "hand-off renders an anchor element",
);
assert.ok(
  source.includes("handOffLink.href = fixScreen"),
  "hand-off links to the fix screen that owns the fix",
);
assert.ok(
  source.includes('handOffLink.className = "handoff-link"'),
  "hand-off link is class-tagged for styling",
);

// Pinning carries the moment into clip-candidate review as a navigable link,
// not a dead-end status change.
assert.ok(
  source.includes('pinLink = document.createElement("a")'),
  "pin action renders as an anchor",
);
assert.ok(
  source.includes("pinLink.href = ownerScreens.clip"),
  "pin action links to the clip-candidate review screen",
);

// Internal "owning surface" language stays out of the creator-facing detail copy.
assert.ok(!/Owning surface/i.test(source), "result detail uses creator-facing fix copy, not 'owning surface'");

console.log("transcript search navigation: hand-offs open the fix screen that owns the fix");
