"use strict";

// Guards transcript glossary hand-off links (#583): low-confidence spellings open
// the connected caption quality review screen where the creator confirms how
// corrections read on screen. Both screens are reachable from the preview shell.
// Run with: `node prototype/transcript-glossary-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "transcript-glossary.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const cleanupNav = fs.readFileSync(path.join(root, "preview", "cleanup-nav.js"), "utf8");
const episodeFlowNav = fs.readFileSync(path.join(root, "preview", "episode-flow-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/transcript-glossary.html"),
  "transcript glossary is reachable from the preview shell",
);
assert.ok(
  cleanupNav.includes('id: "transcript-glossary"'),
  "transcript glossary is part of the connected cleanup path",
);
assert.ok(
  shell.includes("audio-caption-quality-review.html") || episodeFlowNav.includes("audio-caption-quality-review.html"),
  "caption quality review is reachable from the preview shell workflow",
);

assert.ok(html.includes('fixScreen: "audio-caption-quality-review.html"'), "weak glossary corrections route to caption quality review");
assert.ok(html.includes('fixLabel: "caption quality review"'), "weak glossary corrections name the fix screen in creator-facing copy");
assert.ok(
  fs.existsSync(path.join(__dirname, "audio-caption-quality-review.html")),
  "caption quality review exists as a real screen",
);
assert.ok(html.includes("function renderFixLink(issue)"), "transcript glossary renders fix links with one helper");
assert.ok(html.includes("!issue.fixScreen || !issue.fixLabel"), "fix link helper requires target and label");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "fix link uses the issue fix-screen target");
assert.ok(html.includes('openLink.className = "fix-link"'), "fix link keeps shared focus styling");

console.log("transcript glossary: low-confidence corrections open caption quality review");
