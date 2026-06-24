"use strict";

// Smoke test: speaker visual match must hand off to the visual direction path
// (#583). After the guest match is settled, the primary continue control should
// open preset-style-picker — the first screen in the shell's visual direction
// path — instead of a dead button that only toggles local state.
// Run with: `node prototype/speaker-visual-match-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "speaker-visual-match.html"), "utf8");
const nextVisualSurface = "preset-style-picker.html";

assert.ok(
  fs.existsSync(path.join(root, "prototype", nextVisualSurface)),
  "next visual direction screen exists as a real screen",
);
assert.ok(
  source.includes(`const nextVisualSurface = "${nextVisualSurface}"`),
  "speaker visual match declares the visual direction handoff target",
);
assert.ok(
  source.includes('<a class="continue-link" id="continuePreset"'),
  "preset handoff uses a continue link instead of a dead button",
);
assert.ok(
  source.includes("function updateContinueHandoff()"),
  "speaker visual match updates the continue link from match state",
);
assert.ok(
  source.includes("continuePresetLink.href = nextVisualSurface"),
  "ready continue action links to the visual direction screen",
);
assert.ok(
  source.includes('continuePresetLink.removeAttribute("href")'),
  "blocked continue action removes navigation",
);
assert.ok(
  source.includes('continuePresetLink.setAttribute("aria-disabled", String(!ready))'),
  "blocked continue action is exposed as disabled",
);
assert.ok(
  !source.includes("presetReady"),
  "preset handoff no longer relies on a local-only ready flag",
);

console.log("speaker visual match: preset handoff links to the visual direction screen");
