"use strict";

// Guards that speaker role mapping opens pre-filled from the guided episode setup intake:
// when a completed setup is carried in (and no layout-first start takes precedence), role
// mapping seeds one row per setup speaker with the role they were already assigned, instead
// of asking for the same roles again.
// Run with: `node prototype/speaker-role-mapping-setup-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "speaker-role-mapping.html"), "utf8");
const setupHandoff = require("../preview/episode-setup-handoff.js");
const layoutHandoff = require("../preview/layout-handoff.js");

assert.ok(
  html.includes("../preview/episode-setup-handoff.js"),
  "speaker role mapping loads the shared episode-setup handoff helper",
);
assert.ok(
  html.includes("tracksFromSetup(setupHandoff)"),
  "speaker role mapping seeds its tracks from a carried episode setup",
);

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {},
    textContent: "", value: "", checked: false, disabled: false,
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    addEventListener() {}, append(...c) { this._children.push(...c); },
    appendChild(c) { this._children.push(c); return c; },
    replaceChildren(...c) { this._children = c; },
    insertBefore(c) { this._children.unshift(c); return c; },
    remove() {}, querySelector() { return makeNode(); }, querySelectorAll() { return []; },
  };
}

function runRoleMapping(search) {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  ["#tracks", "#status", "#issues", "#layout-handoff", "#addTrack", "#reset"].forEach((sel) => {
    roots[sel] = makeNode();
  });
  const documentStub = {
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: (sel) => roots[sel] || makeNode(),
  };
  const windowStub = {
    PodcastLayoutHandoff: layoutHandoff,
    PodcastEpisodeSetupHandoff: setupHandoff,
    location: { search },
    sessionStorage: undefined,
  };
  const sandbox = { document: documentStub, window: windowStub, structuredClone: globalThis.structuredClone, console };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() — must not throw
  return roots;
}

// A carried two-speaker setup seeds exactly two role rows (not the four sample tracks).
const state = setupHandoff.normalize({
  sourceType: "upload",
  speakers: [
    { name: "Dana Brooks", role: "host", social: "" },
    { name: "Marcus Lee", role: "guest-1", social: "" },
  ],
});
const seeded = runRoleMapping("?" + setupHandoff.queryForState(state));
assert.strictEqual(
  seeded["#tracks"]._children.length,
  2,
  "role mapping seeds one row per carried setup speaker rather than the four-track sample",
);

// With no carried setup, role mapping falls back to its own sample tracks.
const sample = runRoleMapping("");
assert.strictEqual(
  sample["#tracks"]._children.length,
  4,
  "role mapping keeps its sample tracks when nothing was carried in",
);

console.log("speaker role mapping: pre-fills its rows from the carried episode setup");
