"use strict";

// Guards the unified preview app's workflow stages (#581 / #583): every screen
// belongs to exactly one workflow stage, and every stage is named and non-empty.
// This complements app.test.js (which checks screen coverage) by catching a screen
// accidentally listed in two stages, an empty stage, or a typo'd stage entry.
// Run with: `node preview/app-stages.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");

const block = app.match(/const STAGES = \[([\s\S]*?)\];/);
assert.ok(block, "app declares its workflow stages");

// Parse each ["Stage title", ["screen", ...]] entry.
const stageRe = /\[\s*"([^"]+)",\s*\[([\s\S]*?)\]\s*\]/g;
const stages = [];
let m;
while ((m = stageRe.exec(block[1]))) {
  const screens = [...m[2].matchAll(/"([a-z0-9-]+)"/g)].map((x) => x[1]);
  stages.push({ title: m[1], screens: screens });
}

assert.ok(stages.length >= 6, "app groups screens into the documented workflow stages");

const seen = new Map();
for (const stage of stages) {
  assert.ok(stage.title.trim().length > 0, "each workflow stage has a title");
  assert.ok(stage.screens.length > 0, "workflow stage is non-empty: " + stage.title);
  for (const screen of stage.screens) {
    assert.ok(
      !seen.has(screen),
      "screen " + screen + " belongs to exactly one stage (already in: " + seen.get(screen) + ")",
    );
    seen.set(screen, stage.title);
  }
}

// Every grouped screen is a real prototype file (no typo'd stage entry).
for (const screen of seen.keys()) {
  assert.ok(
    fs.existsSync(path.join(root, "prototype", screen + ".html")),
    "staged screen exists as a prototype: " + screen,
  );
}

console.log(
  "preview app stages: " + seen.size + " screens across " + stages.length + " stages, each in exactly one stage",
);
