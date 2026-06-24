"use strict";

// Guards the creator-facing example layout canvas on the preview shell (#1005).
// Run with: `node preview/example-layout-canvas.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

assert.match(html, /Track tray/, "preview shell exposes a track tray for the example canvas");
assert.match(html, /Host track · Dana Brooks/, "track tray includes a concrete host track");
assert.match(html, /Guest track · Marcus Lee/, "track tray includes a concrete guest track");
assert.match(html, /B-roll clip · Product demo cutaway/, "track tray includes a concrete b-roll clip");
assert.ok((html.match(/draggable="true"/g) || []).length >= 3, "example canvas exposes draggable track chips");
assert.match(html, /Reset example canvas/, "example canvas includes a reset action");

const script = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
assert.ok(script, "preview shell exposes example canvas behavior script");

const sandbox = {
  document: { readyState: "loading", addEventListener() {} },
  module: { exports: {} },
  exports: {},
};
vm.runInNewContext(script[1], sandbox);

const api = sandbox.module.exports;
assert.ok(api.DEFAULT_CANVAS_ASSIGNMENTS, "example canvas exports its default assignments");
assert.equal(
  api.canvasSummary(api.DEFAULT_CANVAS_ASSIGNMENTS),
  "No tracks placed yet. Start by dropping the host track into the main layout.",
  "empty example canvas explains the first placement step",
);

const withHost = api.applyCanvasTrack(api.DEFAULT_CANVAS_ASSIGNMENTS, {
  slot: "host",
  label: "Host track · Dana Brooks",
});
assert.equal(withHost.host, "Host track · Dana Brooks", "host drop assigns the host slot");
assert.equal(
  api.canvasSummary(withHost),
  "1 of 3 layout slots filled. Keep placing speaker tracks before styling the episode.",
  "partial placement keeps the creator focused on filling the remaining slots",
);

const filled = api.applyCanvasTrack(
  api.applyCanvasTrack(withHost, { slot: "guest", label: "Guest track · Marcus Lee" }),
  { slot: "broll", label: "B-roll clip · Product demo cutaway" },
);
assert.equal(
  api.canvasSummary(filled),
  "All three layout slots are filled. Review safe areas and canvas layers before moving deeper into the episode flow.",
  "full placement points the creator toward the next canvas checks",
);

console.log("example layout canvas: track tray and assignment helpers are wired");
