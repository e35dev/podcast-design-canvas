"use strict";

// Guards "clean up audio & captions" prototype navigation (#583).
// Run with: `node preview/cleanup-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "cleanup-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "cleanup nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "cleanup nav links to the guided episode flow");
assert.ok(navScript.includes("contextual-broll-moments.html"), "cleanup nav hands off to the visuals stage");
assert.ok(!/innerHTML/.test(navScript), "cleanup nav builds the DOM without innerHTML");

const cleanupScreens = [
  "pause-crosstalk-cleanup.html",
  "transcript-glossary.html",
  "transcript-search-navigation.html",
  "accessibility-readability-checks.html",
  "line-pickup-insert.html",
  "on-screen-correction-note.html",
];

const flowFiles = [...navScript.matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, cleanupScreens, "cleanup nav path is the six cleanup screens, in order");

for (const file of cleanupScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/cleanup-nav.js"), `${file} loads cleanup navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses cleanup nav instead of tools nav`);
  assert.ok(html.includes("data-cleanup-step="), `${file} declares its cleanup step`);
}

console.log("cleanup nav: audio & caption cleanup screens connected into one path");
