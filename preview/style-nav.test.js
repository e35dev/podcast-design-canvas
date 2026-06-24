"use strict";

// Guards visual direction prototype navigation (#583 / #584).
// Run with: `node preview/style-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "style-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "style nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "style nav links to the guided episode flow");
assert.ok(navScript.includes("contextual-broll-moments.html"), "style nav hands off to contextual visuals");
assert.ok(!/innerHTML/.test(navScript), "style nav builds the DOM without innerHTML");

const styleScreens = [
  "preset-style-picker.html",
  "preset-comparison-preview.html",
  "layout-safe-areas.html",
  "speaker-framing-safety.html",
];

for (const file of styleScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/style-nav.js"), `${file} loads style navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses style nav instead of tools nav`);
  assert.ok(html.includes("data-style-step="), `${file} declares its style step`);
}

console.log("style nav: visual direction screens connected back to the preview shell");
