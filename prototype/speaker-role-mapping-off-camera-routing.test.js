"use strict";

// Guards the speaker role mapping off-camera hand-off (#583): once a producer or
// narrator is confirmed as an off-camera role, role mapping routes the creator to the
// off-camera speaker presence screen, where their on-screen treatment is owned.
// Run with: `node prototype/speaker-role-mapping-off-camera-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "speaker-role-mapping.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const ingestNav = fs.readFileSync(path.join(root, "preview", "ingest-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/speaker-role-mapping.html"),
  "speaker role mapping is reachable from the preview shell",
);
assert.ok(
  ingestNav.includes('id: "speaker-role-mapping"'),
  "speaker role mapping is part of the connected ingest path",
);
assert.ok(
  shell.includes("../prototype/off-camera-speaker-presence.html"),
  "off-camera speaker presence is reachable from the preview shell",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "off-camera-speaker-presence.html")),
  "off-camera speaker presence exists as a real screen",
);

assert.ok(
  html.includes('"off-camera-speaker-presence.html"'),
  "a confirmed off-camera speaker routes to the off-camera speaker presence screen",
);
assert.ok(
  html.includes('"off-camera speaker presence"'),
  "the off-camera hand-off names the fix screen in creator-facing copy",
);
assert.ok(
  html.includes('roles[role].offcamera && state === "confirmed"'),
  "only a settled (confirmed) off-camera speaker is offered the presence hand-off",
);
assert.ok(
  html.includes("issue.fixScreen && issue.fixLabel"),
  "the fix link only renders when a target screen and label are present",
);
assert.ok(html.includes('"fix-link"'), "the off-camera hand-off renders with shared fix-link styling");

const focusBlock = html.match(/\.issue \.fix-link:hover,[\s\S]*?\}/);
assert.ok(focusBlock, "the fix link declares a hover/focus-visible rule");
assert.ok(/outline\s*:\s*\d/.test(focusBlock[0]), "the fix link keeps a visible focus outline");

console.log("speaker role mapping: a confirmed off-camera speaker opens off-camera speaker presence");
