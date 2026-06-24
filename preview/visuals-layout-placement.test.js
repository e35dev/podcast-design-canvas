"use strict";

// Guards the contextual-visuals -> layout-first placement entry point (#1026 / #583):
// b-roll moments are placed over the speaker layout, so that step offers a "Place videos in
// layout" link back to the layout-first start — like the ingest, style, speaker-setup, reuse,
// and episode-flow steps already do. Kept in its own file so it does not collide with the
// frequently-edited visuals-nav.test.js. Run with: `node preview/visuals-layout-placement.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const navScript = fs.readFileSync(path.join(__dirname, "visuals-nav.js"), "utf8");

assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_STEP = "contextual-broll-moments"'),
  "the placement link is offered on the contextual b-roll moments step, which sits over the speaker layout",
);
assert.ok(
  navScript.includes('id: "contextual-broll-moments"'),
  "contextual b-roll moments is a real visuals step",
);
assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_FILE = "layout-first.html"'),
  "the placement link targets the layout-first start",
);
assert.ok(
  navScript.includes('"Place videos in layout"'),
  "the entry point uses the same creator-facing label as the other steps",
);
assert.ok(
  navScript.includes("function layoutFirstPlacementSearch"),
  "the placement href is built with URLSearchParams so shell path context is preserved",
);
assert.ok(
  navScript.includes("shouldOfferLayoutPlacement(step)"),
  "the placement link is gated to its step, not rendered on every visuals screen",
);
assert.ok(
  navScript.includes('params.set("from", "visuals")'),
  "the placement link carries the visuals origin",
);

assert.ok(
  fs.existsSync(path.join(__dirname, "layout-first.html")),
  "the layout-first placement screen exists as a real target",
);

const renderSlice = navScript.slice(navScript.indexOf("shouldOfferLayoutPlacement(step)"));
assert.ok(
  renderSlice.includes('"Place videos in layout"'),
  "the gated branch renders the placement link",
);

console.log("visuals nav: contextual b-roll moments offers a layout-first 'Place videos in layout' entry point");
