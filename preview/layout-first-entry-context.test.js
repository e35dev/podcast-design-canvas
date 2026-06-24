"use strict";

// Regression tests for layout-first workflow entry context on the placement canvas.
// Run with: `node preview/layout-first-entry-context.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "layout-first.html"), "utf8");
const contextScript = fs.readFileSync(path.join(__dirname, "layout-first-entry-context.js"), "utf8");

function loadModule() {
  const sandbox = { module: { exports: {} }, exports: {}, URLSearchParams };
  vm.runInNewContext(contextScript, sandbox);
  return sandbox.module.exports;
}

const { readEntryContext, mergeReturnHref, applyLayoutEntryContext } = loadModule();

assert.ok(html.includes("layout-first-entry-context.js"), "layout-first loads entry context helper");
assert.ok(html.includes("layout-entry-context"), "layout-first exposes entry context banner");
assert.ok(html.includes("applyLayoutEntryContext"), "layout-first wires entry context on load");

const ingest = readEntryContext("?from=ingest&path=ingest");
assert.equal(ingest.label, "Episode ingest setup");
assert.equal(
  mergeReturnHref(ingest),
  "../prototype/speaker-role-mapping.html?path=ingest",
  "ingest context returns to speaker roles with path preserved",
);

const style = readEntryContext("?from=style&path=episode");
assert.equal(style.label, "Visual direction path");
assert.equal(
  mergeReturnHref(style),
  "../prototype/canvas-layer-controls.html?from=style&path=episode",
  "style context merges episode path onto the return link",
);

assert.equal(readEntryContext("?from=unknown"), null, "unknown entry sources are ignored");

function createEl() {
  return { hidden: true, textContent: "", href: "" };
}

const banner = createEl();
const title = createEl();
const detail = createEl();
const back = createEl();
const applied = applyLayoutEntryContext({
  readSearch: () => "?from=music&path=episode",
  bannerElement: banner,
  titleElement: title,
  detailElement: detail,
  backLinkElement: back,
});
assert.equal(applied.from, "music");
assert.equal(banner.hidden, false, "banner is shown for known entry context");
assert.equal(title.textContent, "Music cue setup");
assert.match(detail.textContent, /Place required speaker videos/);
assert.equal(back.href, "../prototype/music-cue-setup.html?path=episode");

const hidden = applyLayoutEntryContext({
  readSearch: () => "",
  bannerElement: createEl(),
});
assert.equal(hidden, null, "no context when from= is absent");

console.log("layout-first entry context: placement canvas surfaces ingest/style/music entry paths");
