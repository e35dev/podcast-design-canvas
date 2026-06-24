"use strict";

// Guards episode chapter marker hand-off links (#583): a chapter that starts
// mid-sentence routes to transcript search, where the creator can find the line
// and nudge the boundary with playback context.
// Run with: `node prototype/episode-chapter-markers-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "episode-chapter-markers.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const reuseNav = fs.readFileSync(path.join(root, "preview", "reuse-nav.js"), "utf8");
const cleanupNav = fs.readFileSync(path.join(root, "preview", "cleanup-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/episode-chapter-markers.html"),
  "episode chapter markers are reachable from the preview shell",
);
assert.ok(
  reuseNav.includes('id: "episode-chapter-markers"'),
  "episode chapter markers are part of the connected reuse path",
);
assert.ok(
  shell.includes("../prototype/transcript-search-navigation.html"),
  "transcript search is reachable from the preview shell",
);
assert.ok(
  cleanupNav.includes('id: "transcript-search-navigation"'),
  "transcript search is part of the connected cleanup path",
);

assert.ok(
  html.includes('fixScreen: "transcript-search-navigation.html"'),
  "mid-sentence chapter reviews route to transcript search",
);
assert.ok(
  html.includes('fixLabel: "transcript search"'),
  "mid-sentence chapter reviews name the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "transcript-search-navigation.html")),
  "transcript search exists as a real screen",
);
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link rendering requires target and label");
assert.ok(html.includes('className: "fix-link"'), "chapter marker fix links are class-tagged");

console.log("episode chapter markers: mid-sentence reviews open transcript search");
