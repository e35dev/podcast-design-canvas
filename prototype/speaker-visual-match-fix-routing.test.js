"use strict";

// Guards speaker-visual-match fix-routing hand-off links (#583): the
// guest-review card routes to preset comparison; the preset-ready card routes
// to the preset style picker.
// Run with: `node prototype/speaker-visual-match-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "speaker-visual-match.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const nav = fs.readFileSync(path.join(root, "preview", "speaker-setup-nav.js"), "utf8");

// Guard 1: screen is registered in the speaker setup flow
assert.ok(
  html.includes("../preview/speaker-setup-nav.js"),
  "speaker-visual-match loads speaker-setup-nav.js",
);
assert.ok(
  nav.includes('id: "speaker-visual-match"'),
  "speaker-visual-match is registered in SPEAKER_SETUP_FLOW",
);

// Guard 2: both fix routes declared in source
assert.ok(
  html.includes('fixScreen: presetComparisonSurface'),
  "guest-review issues route to preset comparison preview",
);
assert.ok(
  html.includes('fixLabel: "preset comparison"'),
  "guest-review issues name the fix screen in creator-facing copy",
);
assert.ok(
  html.includes('fixScreen: "preset-style-picker.html"'),
  "preset-ready issues route to preset style picker",
);
assert.ok(
  html.includes('fixLabel: "preset styling"'),
  "preset-ready issues name the fix screen in creator-facing copy",
);

// Guard 3: both target files exist and are linked from the shell
const targets = ["preset-comparison-preview.html", "preset-style-picker.html"];
for (const file of targets) {
  assert.ok(fs.existsSync(path.join(__dirname, file)), `fix target exists: ${file}`);
  assert.ok(shell.includes(`../prototype/${file}`), `${file} is reachable from the preview shell`);
}

// Guard 4: link renderer uses fixScreen and fixLabel
assert.ok(
  html.includes("openLink.href = issue.fixScreen"),
  "open link routes to the owning fix screen",
);
assert.ok(
  html.includes("openLink.textContent = `Open ${issue.fixLabel}`"),
  "open link text names the fix screen in creator-facing copy",
);

console.log("speaker-visual-match: guest-review opens preset comparison; preset-ready opens preset style picker");
