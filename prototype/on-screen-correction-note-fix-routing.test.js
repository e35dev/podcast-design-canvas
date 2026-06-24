"use strict";

// Guards the on-screen correction note hand-off (#583): a correction that appears on
// screen is drawn with the show's title-card style, so styling and pacing it is owned
// by contextual title cards. A placed or previewing correction routes there.
// Run with: `node prototype/on-screen-correction-note-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "on-screen-correction-note.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const cleanupNav = fs.readFileSync(path.join(root, "preview", "cleanup-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/on-screen-correction-note.html"),
  "on-screen correction note is reachable from the preview shell",
);
assert.ok(
  cleanupNav.includes('id: "on-screen-correction-note"'),
  "on-screen correction note is part of the connected cleanup path",
);
assert.ok(
  shell.includes("../prototype/contextual-title-cards.html"),
  "contextual title cards is reachable from the preview shell",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "contextual-title-cards.html")),
  "contextual title cards exists as a real screen",
);

assert.ok(
  html.includes('"contextual-title-cards.html"'),
  "an on-screen correction routes to contextual title cards, where its styling is owned",
);
assert.ok(
  html.includes('"contextual title cards"'),
  "the correction hand-off names the fix screen in creator-facing copy",
);

assert.ok(
  html.includes('state === "placed" || state === "drafted"'),
  "only corrections that actually appear on screen route to title cards",
);
assert.ok(
  html.includes("result.fixScreen && result.fixLabel"),
  "the fix link only renders when a target screen and label are present",
);
assert.ok(html.includes('"fix-link"'), "the correction hand-off renders with shared fix-link styling");

const focusBlock = html.match(/\.issue \.fix-link:hover,[\s\S]*?\}/);
assert.ok(focusBlock, "the fix link declares a hover/focus-visible rule");
assert.ok(/outline\s*:\s*\d/.test(focusBlock[0]), "the fix link keeps a visible focus outline");

console.log("on-screen correction note: a placed correction opens contextual title cards to style it");
