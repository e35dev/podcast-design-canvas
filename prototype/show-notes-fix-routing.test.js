"use strict";

// Guards the show-notes hand-off links (#583): a chapter list that still needs
// confirmed source text opens the screen that owns chapter markers.
// Run with: `node prototype/show-notes-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "show-notes-assembly.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");
assert.ok(
  html.includes('fixScreen: section.id === "chapters" ? "episode-chapter-markers.html"'),
  "chapter list issues route to chapter markers",
);
assert.ok(
  fs.existsSync(path.join(dir, "episode-chapter-markers.html")),
  "chapter markers fix screen exists",
);

console.log("show notes assembly: chapter source issues open the chapter markers screen");
