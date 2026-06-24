"use strict";

// Each layout option on the layout-first picker tells the creator how many speaker videos it
// needs, so they can pick the layout that matches the number of recordings they have. This
// guards that the stated count matches the layout's actual required slots, so the copy can't
// drift from the real requirement. Kept in its own file (not the hot shared layout-first.test.js).
// Run with: `node preview/layout-first-picker-counts.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { layouts } = require("./layout-first.js");
const html = fs.readFileSync(path.join(__dirname, "layout-first.html"), "utf8");

["interview", "solo", "panel"].forEach((name) => {
  const required = layouts[name].requiredSlots.length;
  const noun = required === 1 ? "video" : "videos";

  const optionMatch = html.match(new RegExp('data-layout="' + name + '"[\\s\\S]*?<span>([^<]*)</span>'));
  assert.ok(optionMatch, "the " + name + " layout option has a description");

  assert.ok(
    optionMatch[1].includes("Needs " + required + " speaker " + noun),
    "the " + name + " layout option states it needs " + required + " speaker " + noun +
      ", matching its required slots",
  );
});

console.log("layout picker counts: each layout option states its required speaker-video count, matching its required slots");
