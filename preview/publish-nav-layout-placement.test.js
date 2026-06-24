"use strict";

// Guards the publish prep -> video slot placement entry point (#1131 / #583): destination
// crop preview is where the creator checks how each speaker frame fits the export
// destination, so that step offers a "Place videos in layout" link — like the episode-flow
// export readiness and speaker-setup paths already do.
// Run with: `node preview/publish-nav-layout-placement.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const navScript = fs.readFileSync(path.join(__dirname, "publish-nav.js"), "utf8");

assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_STEP = "destination-crop-preview"'),
  "the placement link is offered on destination crop preview, where speaker frames are checked before export",
);
assert.ok(
  navScript.includes('id: "destination-crop-preview"'),
  "destination crop preview is a real publish-prep step",
);
assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_FILE = "layout-first.html"'),
  "the placement link targets the layout-first start",
);
assert.ok(
  navScript.includes('"Place videos in layout"'),
  "the entry point uses the same creator-facing label as the other guided paths",
);
assert.ok(
  navScript.includes("function layoutFirstPlacementSearch"),
  "the placement href is built with URLSearchParams so shell path context is preserved",
);
assert.ok(
  navScript.includes("shouldOfferLayoutPlacement(step)"),
  "the placement link is gated to its step, not rendered on every publish-prep screen",
);
assert.ok(
  navScript.includes('params.set("from", "publish")'),
  "the placement link carries the publish-prep origin",
);
assert.ok(
  navScript.includes("verify speaker slots before export"),
  "destination crop preview uses a distinct aria-label for pre-export slot verification",
);

assert.ok(
  fs.existsSync(path.join(__dirname, "layout-first.html")),
  "the layout-first placement screen exists as a real target",
);

const renderSlice = navScript.slice(navScript.indexOf("shouldOfferLayoutPlacement(step)"));
assert.ok(
  renderSlice.includes('"Place videos in layout"'),
  "the gated branch is what renders the placement link",
);

console.log("publish nav: destination crop preview offers a video slot placement entry point");
