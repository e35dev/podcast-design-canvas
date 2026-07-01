"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const protoPath = path.join(__dirname, "episode-setup-intake.html");
const proto = fs.readFileSync(protoPath, "utf8");

const ingestNav = fs.readFileSync(
  path.join(__dirname, "..", "preview", "ingest-nav.js"),
  "utf8",
);

const appHtml = fs.readFileSync(
  path.join(__dirname, "..", "preview", "app.html"),
  "utf8",
);

const indexHtml = fs.readFileSync(
  path.join(__dirname, "..", "preview", "index.html"),
  "utf8",
);

// --- Handoff module behavioral tests ---

const handoff = require("../preview/episode-setup-handoff.js");

// 1. normalize rejects incomplete setup (no source type)
assert.equal(
  handoff.normalize({ sourceType: "", speakers: [{ role: "Host", name: "Alice" }] }),
  null,
  "normalize rejects setup with empty source type",
);

// 2. normalize rejects setup with unnamed speaker
assert.equal(
  handoff.normalize({ sourceType: "link", speakers: [{ role: "Host", name: "" }] }),
  null,
  "normalize rejects setup with unnamed speaker",
);

// 3. normalize rejects setup with duplicate roles
assert.equal(
  handoff.normalize({
    sourceType: "files",
    speakers: [
      { role: "Host", name: "Alice" },
      { role: "Host", name: "Bob" },
    ],
  }),
  null,
  "normalize rejects setup with duplicate roles",
);

// 4. normalize accepts valid completed setup
const valid = handoff.normalize({
  sourceType: "link",
  speakers: [
    { role: "Host", name: "Alice Chen", twitter: "@alice", website: "https://alice.dev" },
    { role: "Guest 1", name: "Bob Park" },
  ],
});
assert.ok(valid, "normalize accepts valid completed setup");
assert.equal(valid.sourceType, "link", "normalized setup preserves source type");
assert.equal(valid.speakers.length, 2, "normalized setup preserves speaker count");
assert.equal(valid.speakers[0].role, "Host", "normalized setup preserves first role");
assert.equal(valid.speakers[0].name, "Alice Chen", "normalized setup preserves first name");
assert.equal(valid.speakers[0].twitter, "@alice", "normalized setup carries social links");
assert.equal(valid.speakers[1].role, "Guest 1", "normalized setup preserves second role");

// 5. save and load round-trip through mock storage
const mockStorage = {
  _data: {},
  setItem: function (k, v) { this._data[k] = v; },
  getItem: function (k) { return this._data[k] || null; },
  removeItem: function (k) { delete this._data[k]; },
};
const saved = handoff.save(mockStorage, {
  sourceType: "files",
  speakers: [{ role: "Host", name: "Sarah" }],
});
assert.ok(saved, "save returns true for complete setup");
const loaded = handoff.load(mockStorage);
assert.ok(loaded, "load returns the saved setup");
assert.equal(loaded.sourceType, "files", "round-tripped source type matches");
assert.equal(loaded.speakers[0].name, "Sarah", "round-tripped speaker name matches");

// 6. clear removes handoff state
handoff.clear(mockStorage);
assert.equal(handoff.load(mockStorage), null, "clear removes handoff state");

// 7. summaryLines produces creator-facing output
const lines = handoff.summaryLines({
  sourceType: "link",
  speakers: [
    { role: "Host", name: "Alice", twitter: "@alice" },
    { role: "Guest 1", name: "Bob" },
  ],
});
assert.equal(lines.length, 2, "summaryLines returns one line per speaker");
assert.ok(lines[0].includes("Host") && lines[0].includes("Alice"), "summary includes role and name");
assert.ok(lines[0].includes("social link"), "summary notes social links when present");
assert.ok(!lines[1].includes("social"), "summary omits social note when absent");

// --- Prototype integration checks ---

// 8. Continue is an <a> element that links to episode-readiness.html when setup is complete
assert.ok(
  proto.includes('id="continue-btn"') && proto.includes("episode-readiness.html"),
  "continue control links to episode-readiness.html",
);

// 9. Continue is gated (aria-disabled initially)
assert.ok(
  proto.includes('aria-disabled="true"'),
  "continue control starts disabled via aria-disabled",
);

// 10. Switching source type clears stale tracks
assert.ok(
  proto.includes("clearTracks()"),
  "switching source type clears previous tracks",
);

// 11. Handoff module is loaded and used to persist state
assert.ok(
  proto.includes("PodcastEpisodeSetupHandoff") && proto.includes(".save(sessionStorage"),
  "prototype uses handoff module to persist setup on continue",
);

// 12. Registered in ingest-nav.js as the first step
assert.ok(
  ingestNav.includes('"episode-setup-intake"'),
  "episode-setup-intake is registered in ingest-nav.js",
);
const flowMatch = ingestNav.match(/INGEST_FLOW\s*=\s*\[([\s\S]*?)\]/);
assert.ok(flowMatch, "INGEST_FLOW is parseable");
const firstLine = flowMatch[1].trim().split("\n")[0];
assert.ok(
  firstLine.includes("episode-setup-intake"),
  "episode-setup-intake is the first entry in INGEST_FLOW",
);

// 13. Registered in app.html STAGES
assert.ok(
  appHtml.includes('"episode-setup-intake"'),
  "episode-setup-intake is in app.html STAGES",
);

// 14. Listed in preview index.html catalog
assert.ok(
  indexHtml.includes("episode-setup-intake.html"),
  "episode-setup-intake is in the preview shell catalog",
);

// 15. Prototype file exists
assert.ok(
  fs.existsSync(protoPath),
  "episode-setup-intake.html exists",
);

// 16. Handoff module file exists
assert.ok(
  fs.existsSync(path.join(__dirname, "..", "preview", "episode-setup-handoff.js")),
  "episode-setup-handoff.js exists in preview/",
);

// 17. Episode readiness loads the handoff module and renders carried setup
const readinessHtml = fs.readFileSync(
  path.join(__dirname, "episode-readiness.html"),
  "utf8",
);
assert.ok(
  readinessHtml.includes("episode-setup-handoff.js"),
  "episode-readiness loads the episode-setup-handoff module",
);
assert.ok(
  readinessHtml.includes('id="setup-carried"'),
  "episode-readiness has a setup-carried banner",
);
assert.ok(
  readinessHtml.includes("PodcastEpisodeSetupHandoff.load"),
  "episode-readiness reads the handoff state on load",
);
assert.ok(
  readinessHtml.includes("PodcastEpisodeSetupHandoff.summaryLines"),
  "episode-readiness renders speaker summary lines from the handoff",
);

// 18. Field input handlers update continue state (not just summary)
assert.ok(
  proto.includes("updateContinueState()"),
  "track field handlers call updateContinueState to unlock the continue link",
);

console.log("episode-setup-intake: all behavior tests passed");
