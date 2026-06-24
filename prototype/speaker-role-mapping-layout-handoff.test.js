"use strict";

// Guards that speaker role mapping receives the layout-first start handoff.
// Run with: `node prototype/speaker-role-mapping-layout-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "speaker-role-mapping.html"), "utf8");
const handoff = require("../preview/layout-handoff.js");

assert.ok(
  html.includes("../preview/layout-handoff.js"),
  "speaker role mapping loads the shared layout handoff helper",
);
assert.match(
  html,
  /id="layout-handoff" class="layout-handoff" hidden/,
  "speaker role mapping reserves a hidden layout-start summary",
);
assert.ok(
  html.includes("layoutHandoffApi.load(layoutHandoffStorage(), window.location.search)"),
  "speaker role mapping reads fresh URL handoff state and stored layout-start state",
);
assert.ok(
  html.includes("function layoutHandoffStorage()"),
  "speaker role mapping guards session storage access for static preview contexts",
);
assert.ok(
  html.includes("layoutHandoffApi.tracksFromState(layoutHandoff, sampleTracks)"),
  "speaker role mapping seeds its tracks from the selected layout when available",
);
assert.ok(
  html.includes("tracks = structuredClone(initialTracks);"),
  "reset returns to the current layout-start handoff instead of the generic sample",
);
assert.doesNotMatch(
  html,
  /layoutHandoffElement\.innerHTML/,
  "layout handoff summary is not rendered with innerHTML",
);
assert.ok(
  html.includes("layoutHandoffApi.placementList(layoutHandoff)"),
  "speaker role mapping summarizes placed videos with their carried file names",
);

const handoffState = handoff.stateFromSlots("interview", [{ slot: "host" }, { slot: "guest" }]);
const seeded = handoff.tracksFromState(handoffState, []);
assert.deepEqual(
  seeded.map((track) => track.role),
  ["host", "guest"],
  "layout handoff creates role rows that match the placed speaker slots",
);

console.log("speaker role mapping: layout-first handoff hook verified");
