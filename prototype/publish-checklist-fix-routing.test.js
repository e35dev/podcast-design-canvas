"use strict";

// Guards publish checklist hand-off links (#583): blocked or review items open
// the screen that owns each publishing fix.
// Run with: `node prototype/publish-checklist-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "publish-checklist.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "checklist warnings render an open-fix-screen link");
assert.ok(html.includes("openLink.href = item.fixScreen"), "open link routes to the owning fix screen");

const itemBlock = html.match(/const items = \[([\s\S]*?)\];/);
assert.ok(itemBlock, "publish checklist items are declared");
const fixScreens = [...itemBlock[1].matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 5, "checklist items declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(fixScreens.includes("thumbnail-cover-frame.html"), "thumbnail checklist item routes to cover frame");
assert.ok(
  fixScreens.includes("client-review-copy-flow.html"),
  "review watermark checklist item routes to the review copy flow that owns the watermark",
);

// Context preservation (#583): cross-flow checklist fixes carry the publish path so the
// creator returns to the publish checklist after fixing on another flow screen.
const vm = require("vm");
const navSource = fs.readFileSync(path.join(dir, "..", "preview", "publish-nav.js"), "utf8");
function checklistFixHref(href, search) {
  const link = {
    value: href,
    getAttribute(name) { return name === "href" ? this.value : null; },
    set href(v) { this.value = v; },
    get href() { return this.value; },
    target: "",
  };
  const document = {
    readyState: "loading",
    addEventListener() {},
    body: { dataset: {} },
    head: { appendChild() {} },
    querySelector() { return null; },
    getElementById() { return null; },
    createElement() { return { style: {}, setAttribute() {}, appendChild() {} }; },
  };
  const window = { location: { pathname: "/prototype/publish-checklist.html", search } };
  window.self = window;
  window.top = window;
  vm.runInNewContext(navSource + ";setPublishChecklistFixLink(link);", { document, window, URLSearchParams, link });
  return link.href;
}

assert.equal(
  checklistFixHref("audio-caption-quality-review.html", "?path=publish"),
  "audio-caption-quality-review.html?path=publish",
  "caption-quality checklist fix carries the publish context",
);
assert.equal(
  checklistFixHref("episode-chapter-markers.html?draft=ch#list", "?path=publish"),
  "episode-chapter-markers.html?draft=ch&path=publish#list",
  "chapters checklist fix merges publish context, preserving query and hash",
);
assert.equal(
  checklistFixHref("client-review-copy-flow.html", "?path=publish"),
  "client-review-copy-flow.html",
  "in-flow publish targets are left to the existing publish-link normalizer",
);

console.log(`publish checklist: ${fixScreens.length} checklist items open their owning fix screen`);
