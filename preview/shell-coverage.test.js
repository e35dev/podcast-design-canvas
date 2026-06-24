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
assert.match(shell, /Episode path/, "shell documents the seven-step episode path");
assert.match(shell, /Publish prep after export/, "shell documents the publish prep path");
assert.ok(shell.includes("episode-readiness.html"), "shell links to episode readiness in setup path");
assert.ok(shell.includes("export-package-handoff.html"), "shell links to export package handoff in publish path");

console.log(
  `preview shell coverage: ${prototypes.length} prototypes, all reachable, no dead links`,
);
