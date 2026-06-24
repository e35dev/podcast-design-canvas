"use strict";

// Guards contextual-visuals prototype navigation (#583).
// Run with: `node preview/visuals-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "visuals-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "visuals nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "visuals nav links to the guided episode flow");
assert.ok(navScript.includes("show-segment-system.html"), "visuals nav hands off to the reuse path");
assert.ok(navScript.includes("speaker-framing-safety.html"), "visuals nav links back to the style path");
assert.ok(!/innerHTML/.test(navScript), "visuals nav builds the DOM without innerHTML");

const visualsScreens = [
  "contextual-broll-moments.html",
  "contextual-title-cards.html",
  "sensitive-moment-review.html",
];

// The nav declares its path in order, and every screen in it exists.
const flowFiles = [...navScript.matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, visualsScreens, "visuals nav path is the three contextual-visuals screens, in order");

for (const file of visualsScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/visuals-nav.js"), `${file} loads visuals navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses visuals nav instead of tools nav`);
  assert.ok(html.includes("data-visuals-step="), `${file} declares its visuals step`);
}

console.log("visuals nav: contextual-visuals screens connected into one path");
