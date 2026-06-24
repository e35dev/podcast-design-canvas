"use strict";

// Guards off-camera speaker presence hand-off links (#583): participants
// with an unconfirmed audio-only role open speaker role mapping, and
// participants set to the photo style without a photo source open social
// context intake.
// Run with: `node prototype/off-camera-speaker-presence-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "off-camera-speaker-presence.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const speakerSetupNav = fs.readFileSync(path.join(root, "preview", "speaker-setup-nav.js"), "utf8");
const ingestNav = fs.readFileSync(path.join(root, "preview", "ingest-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/off-camera-speaker-presence.html"),
  "off-camera speaker presence is reachable from the preview shell",
);
assert.ok(
  speakerSetupNav.includes('id: "off-camera-speaker-presence"'),
  "off-camera speaker presence is part of the connected speaker setup path",
);

assert.ok(
  shell.includes("../prototype/speaker-role-mapping.html"),
  "speaker role mapping is reachable from the preview shell",
);
assert.ok(
  ingestNav.includes("speaker-role-mapping.html"),
  "speaker role mapping is part of the connected ingest path",
);
assert.ok(
  html.includes('fixScreen: "speaker-role-mapping.html"'),
  "unconfirmed audio-only role routes to speaker role mapping",
);
assert.ok(
  html.includes('fixLabel: "speaker role mapping"'),
  "unconfirmed role route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "speaker-role-mapping.html")),
  "speaker role mapping exists as a real screen",
);

assert.ok(
  shell.includes("../prototype/social-context-intake.html"),
  "social context intake is reachable from the preview shell",
);
assert.ok(
  ingestNav.includes("social-context-intake.html"),
  "social context intake is part of the connected ingest path",
);
assert.ok(
  html.includes('fixScreen: "social-context-intake.html"'),
  "photo style without a photo source routes to social context intake",
);
assert.ok(
  html.includes('fixLabel: "social context intake"'),
  "photo route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "social-context-intake.html")),
  "social context intake exists as a real screen",
);

assert.ok(html.includes('action.className = "fix-link"'), "off-camera presence renders fix links with shared styling");
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link rendering requires target and label");
assert.ok(html.includes("action.href = issue.fixScreen"), "fix link points to the owning fix screen");

console.log("off-camera speaker presence: unconfirmed role opens speaker role mapping");
console.log("off-camera speaker presence: photo without source opens social context intake");
