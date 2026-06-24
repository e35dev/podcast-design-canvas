"use strict";

// Coverage test for the preview shell (#583 / #584): every prototype screen must be
// reachable from the shell, and every link in the shell must point at a real file.
// Run with: `node preview/shell-coverage.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const shell = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

// Every prototype HTML file on disk.
const prototypes = fs
  .readdirSync(path.join(root, "prototype"))
  .filter((name) => name.endsWith(".html"));

// Every prototype the shell links to (flow steps + the More tools section).
const linked = new Set(
  [...shell.matchAll(/\.\.\/prototype\/([a-z0-9-]+\.html)/g)].map((m) => m[1]),
);

// 1) Every prototype is reachable from the shell.
for (const file of prototypes) {
  assert.ok(linked.has(file), `shell links to prototype/${file}`);
}

// 2) Every shell link points at a file that exists (no dead links).
for (const file of linked) {
  assert.ok(
    fs.existsSync(path.join(root, "prototype", file)),
    `shell link prototype/${file} resolves to a real file`,
  );
}

// 3) The shell still exposes the secondary tools section.
assert.match(shell, /More tools/, "shell has a secondary tools section");
assert.match(shell, /aria-label="Podcast Design Canvas preview shell"/, "shell keeps its landmark");
assert.match(shell, /href="\.\.\/index\.html"/, "shell links back to the full screen catalog");
assert.match(shell, /Example podcast layout canvas/, "shell shows an example podcast layout canvas");
assert.match(shell, /Host video slot/, "shell shows a host drop zone in the example canvas");
assert.match(shell, /Guest video slot/, "shell shows a guest drop zone in the example canvas");
assert.match(shell, /Caption area/, "shell shows a caption slot in the example canvas");
assert.match(shell, /B-roll drop zone/, "shell shows a contextual visuals drop zone in the example canvas");
assert.match(shell, /Drag speaker tracks onto the layout/, "shell exposes draggable tracks for the example canvas");
assert.match(shell, /data-slot="host"/, "shell labels the host slot for drag-in placement");
assert.match(shell, /data-slot="guest"/, "shell labels the guest slot for drag-in placement");
assert.match(shell, /Reset layout/, "shell exposes a reset control on the example canvas");
assert.match(shell, /canvas-slot-status/, "shell shows slot fill status on the example canvas");
assert.match(shell, /data-slot="broll"/, "shell labels the b-roll slot for drag-in placement");
assert.match(shell, /id="canvas-continue"/, "shell exposes a continue handoff from the example canvas");
assert.match(shell, /speaker-role-mapping\?path=episode/, "shell continues from the example canvas into speaker roles");
assert.match(shell, /Optional b-roll can be added later/, "shell treats b-roll as optional in the example canvas");
assert.ok(
  shell.indexOf("Example podcast layout canvas") < shell.indexOf("Episode path"),
  "the example canvas leads the shell before the workflow lists",
);
assert.match(shell, /Episode path/, "shell documents the seven-step episode path");
assert.match(shell, /Episode ingest setup/, "shell documents the ingest setup path");
assert.ok(
  shell.indexOf("Episode ingest setup") < shell.indexOf("Speaker setup"),
  "ingest setup section precedes speaker setup in shell workflow order",
);
assert.match(shell, /Speaker setup/, "shell documents the speaker setup path");
assert.ok(
  shell.indexOf("Speaker setup") < shell.indexOf("Choose a visual direction"),
  "speaker setup section precedes visual direction in shell workflow order",
);
assert.match(shell, /Choose a visual direction/, "shell documents the visual direction path");
assert.match(shell, /Publish prep after export/, "shell documents the publish prep path");
assert.ok(
  shell.indexOf("Choose a visual direction") < shell.indexOf("Publish prep after export"),
  "visual direction section precedes publish prep in shell workflow order",
);
assert.ok(
  shell.indexOf("Publish prep after export") < shell.indexOf("Clean up audio &amp; captions"),
  "publish prep section precedes cleanup helper path in shell workflow order",
);
assert.ok(shell.includes("episode-readiness.html"), "shell links to episode readiness in setup path");
assert.ok(shell.includes("social-context-intake.html"), "shell links to social context intake in ingest path");
assert.ok(shell.includes("speaker-attribution-review.html"), "shell links to speaker attribution in setup path");
assert.ok(shell.includes("preset-style-picker.html"), "shell links to preset style picker in visual path");
assert.ok(shell.includes("canvas-layer-controls.html"), "shell links the example canvas to canvas layer controls");
assert.ok(shell.includes("speaker-framing-safety.html"), "shell links to speaker framing in visual path");
assert.ok(shell.includes("episode-watch-through-preview.html"), "shell links to watch-through in publish path");
assert.ok(shell.includes("destination-crop-preview.html"), "shell links to destination crop in publish path");
assert.ok(shell.includes("show-notes-assembly.html"), "shell links to show notes assembly in publish path");
assert.ok(shell.includes("thumbnail-cover-frame.html"), "shell links to thumbnail frame in publish path");
assert.ok(shell.includes("publish-checklist.html"), "shell links to publish checklist in publish path");
assert.ok(shell.includes("export-package-handoff.html"), "shell links to export package handoff in publish path");
assert.ok(
  shell.indexOf("Publish prep after export") < shell.indexOf("Place music cues"),
  "publish prep section precedes music cue path in shell workflow order",
);
assert.match(shell, /Place music cues/, "shell documents the music cue path");
assert.ok(
  shell.indexOf("Place music cues") < shell.indexOf("Clean up audio &amp; captions"),
  "music cue section precedes cleanup helper path in shell workflow order",
);
assert.ok(shell.includes("music-cue-setup.html"), "shell links to music cue setup in music path");
assert.ok(shell.includes("music-ducking-under-speech.html"), "shell links to music ducking in music path");
assert.match(shell, /Clean up audio &amp; captions/, "shell documents the cleanup helper path");
assert.ok(
  shell.indexOf("Clean up audio &amp; captions") < shell.indexOf("Add contextual visuals"),
  "cleanup helper section precedes contextual visuals in shell workflow order",
);
assert.ok(shell.includes("pause-crosstalk-cleanup.html"), "shell links to pause cleanup in helper path");
assert.ok(shell.includes("on-screen-correction-note.html"), "shell links to correction note in helper path");
assert.match(shell, /Add contextual visuals/, "shell documents the contextual visuals path");
assert.match(shell, /Make it reusable/, "shell documents the reuse path");
assert.ok(
  shell.indexOf("Add contextual visuals") < shell.indexOf("Make it reusable"),
  "contextual visuals section precedes reuse path in shell workflow order",
);
assert.ok(
  shell.indexOf("Make it reusable") < shell.indexOf("More tools"),
  "reuse path section precedes secondary tools in shell workflow order",
);
assert.ok(shell.includes("contextual-broll-moments.html"), "shell links to b-roll in visuals path");
assert.ok(shell.includes("show-segment-system.html"), "shell links to show segments in reuse path");

console.log(
  `preview shell coverage: ${prototypes.length} prototypes, all reachable, no dead links`,
);
