"use strict";

// Guards the reuse -> layout-first placement entry point (#1026 / #583): the
// start-from-previous-episode step, where a creator sets up a new episode from a prior one's
// template, offers a "Place videos in layout" link to the layout-first start — like the ingest,
// style, and speaker-setup steps already do. Kept in its own file so it does not collide with
// the frequently-edited reuse-nav.test.js. Run with: `node preview/reuse-layout-placement.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const navScript = fs.readFileSync(path.join(__dirname, "reuse-nav.js"), "utf8");

assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_STEP = "start-from-previous-episode"'),
  "the placement link is offered on the start-from-previous-episode step, where a new episode is set up",
);
assert.ok(
  navScript.includes('id: "start-from-previous-episode"'),
  "start-from-previous-episode is a real reuse step",
);
assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_FILE = "layout-first.html"'),
  "the placement link targets the layout-first start",
);
assert.ok(
  navScript.includes('"Place videos in layout"'),
  "the entry point uses the same creator-facing label as the ingest, style, and speaker-setup steps",
);
assert.ok(
  navScript.includes("function layoutFirstPlacementSearch"),
  "the placement href is built with URLSearchParams so shell path context is preserved",
);
assert.ok(
  navScript.includes("shouldOfferLayoutPlacement(step)"),
  "the placement link is gated to its step, not rendered on every reuse screen",
);
assert.ok(
  navScript.includes('params.set("from", "reuse")'),
  "the placement link carries the reuse origin",
);

assert.ok(
  fs.existsSync(path.join(__dirname, "layout-first.html")),
  "the layout-first placement screen exists as a real target",
);

// The label and gating appear together, so the link is wired through the gate (not loose copy).
const renderSlice = navScript.slice(navScript.indexOf("shouldOfferLayoutPlacement(step)"));
assert.ok(
  renderSlice.includes('"Place videos in layout"'),
  "the gated branch is what renders the placement link",
);

console.log("reuse nav: start-from-previous-episode offers a layout-first 'Place videos in layout' entry point");
