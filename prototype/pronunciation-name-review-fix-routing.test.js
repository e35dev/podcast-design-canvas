"use strict";

// Guards pronunciation name review hand-off links (#583): glossary-sourced terms
// open transcript glossary where approved spellings are owned.
// Run with: `node prototype/pronunciation-name-review-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "pronunciation-name-review.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const cleanupNav = fs.readFileSync(path.join(root, "preview", "cleanup-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/pronunciation-name-review.html"),
  "pronunciation name review is reachable from the preview shell",
);
assert.ok(
  cleanupNav.includes('id: "pronunciation-name-review"'),
  "pronunciation name review is part of the connected cleanup path",
);
assert.ok(
  shell.includes("../prototype/transcript-glossary.html"),
  "transcript glossary is reachable from the preview shell",
);
assert.ok(
  cleanupNav.includes('id: "transcript-glossary"'),
  "transcript glossary is part of the connected cleanup path",
);

assert.ok(
  html.includes('entry.source === "Transcript glossary"'),
  "glossary-sourced pronunciation reviews declare a fix route",
);
assert.ok(
  html.includes('glossarySource.href = "transcript-glossary.html"'),
  "glossary-sourced reviews link to transcript glossary",
);
assert.ok(
  html.includes('"Open transcript glossary"'),
  "glossary-sourced reviews name the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "transcript-glossary.html")),
  "transcript glossary exists as a real screen",
);
assert.ok(html.includes('"routed-link"'), "pronunciation review renders routed links with shared styling");

console.log("pronunciation name review: glossary-sourced terms open transcript glossary");
