"use strict";

// Guards audio helper prototype navigation (#583 / #584).
// Run with: `node preview/audio-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "audio-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "audio nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "audio nav links to the guided episode flow");
assert.ok(navScript.includes("audio-caption-quality-review.html"), "audio nav hands off to caption quality review");
assert.ok(!/innerHTML/.test(navScript), "audio nav builds the DOM without innerHTML");

const audioScreens = [
  "pause-crosstalk-cleanup.html",
  "transcript-glossary.html",
];

for (const file of audioScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/audio-nav.js"), `${file} loads audio navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses audio nav instead of tools nav`);
  assert.ok(html.includes("data-audio-step="), `${file} declares its audio step`);
}

console.log("audio nav: audio helper screens connected back to the preview shell");
