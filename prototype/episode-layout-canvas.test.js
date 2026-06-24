"use strict";

// Dependency-free verification for the episode layout canvas prototype (#1005).
// Supplies a tiny DOM stub so the page script runs to its module.exports block,
// then checks the drag-in placement rules: which pieces each slot accepts, that
// placing / moving / clearing produces the right layout, and the readiness rule.
// Run with: `node prototype/episode-layout-canvas.test.js` (Node built-ins only).

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {},
    textContent: "", value: "", checked: false, disabled: false, draggable: false,
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    replaceChildren(...cs) { this._children = cs; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
  };
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "episode-layout-canvas.html"), "utf8");
  // The bare <script> holds the logic; the head <script src=...> nav include is skipped.
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const document = {
    createElement: (t) => makeNode(t),
    createTextNode: (t) => ({ textContent: t }),
    querySelector: () => makeNode(),
  };
  const sandbox = { document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
assert.ok(typeof M.canAccept === "function", "prototype exports canAccept()");
assert.ok(typeof M.placeItem === "function", "prototype exports placeItem()");
assert.ok(typeof M.clearSlot === "function", "prototype exports clearSlot()");
assert.ok(typeof M.evaluateLayout === "function", "prototype exports evaluateLayout()");

const host = M.SLOTS.find((slot) => slot.id === "host");
const captionsSlot = M.SLOTS.find((slot) => slot.id === "captions");
const insert = M.SLOTS.find((slot) => slot.id === "insert");
const hostSrc = M.SOURCES.find((source) => source.id === "host-track");
const captionsSrc = M.SOURCES.find((source) => source.id === "captions-piece");
const titleSrc = M.SOURCES.find((source) => source.id === "title-piece");

// Slots only accept the right kind of piece, so an impossible layout can't be built.
assert.ok(M.canAccept(host, hostSrc), "the host frame accepts a speaker track");
assert.ok(!M.canAccept(host, captionsSrc), "the host frame rejects captions");
assert.ok(M.canAccept(captionsSlot, captionsSrc), "the caption band accepts captions");
assert.ok(!M.canAccept(captionsSlot, hostSrc), "the caption band rejects a speaker track");
assert.ok(M.canAccept(insert, titleSrc), "the b-roll/title insert accepts a title card");

// Placing a compatible piece fills the slot; an incompatible drop is refused.
const placed = M.placeItem({}, "host", "host-track");
assert.ok(placed.ok && placed.layout.host === "host-track", "placing a speaker fills the host frame");
const refused = M.placeItem({}, "host", "captions-piece");
assert.ok(!refused.ok && !("host" in refused.layout), "an incompatible drop is refused and changes nothing");

// A piece lives in one slot: placing it elsewhere moves it instead of duplicating.
const moved = M.placeItem({ host: "host-track" }, "guest", "host-track");
assert.ok(moved.layout.guest === "host-track" && !("host" in moved.layout), "placing a piece elsewhere moves it");

// Clearing a slot frees it (the piece returns to the palette).
const cleared = M.clearSlot({ host: "host-track" }, "host");
assert.ok(!("host" in cleared), "clearing empties the slot");

// Readiness rule: the scene needs a host and a guest speaker before it can be previewed.
const empty = M.evaluateLayout({});
assert.ok(!empty.ready, "an empty stage is not ready to preview");
assert.ok(
  empty.issues.some((issue) => /host frame is empty/i.test(issue.title)),
  "an empty stage flags the empty host frame",
);
const halfway = M.evaluateLayout({ host: "host-track" });
assert.ok(!halfway.ready, "host alone is not ready — a guest is still needed");
const ready = M.evaluateLayout({ host: "host-track", guest: "guest-1-track", captions: "captions-piece" });
assert.ok(ready.ready, "host + guest + captions is ready to preview");

// The canvas builds the DOM without innerHTML, consistent with the other prototypes.
const html = fs.readFileSync(path.join(__dirname, "episode-layout-canvas.html"), "utf8");
assert.ok(!/innerHTML/.test(html), "the canvas builds the DOM without innerHTML");

// Drag-over must validate against a tracked piece (dataTransfer is unreadable during
// dragover), or the drop never fires; empty slots must also be keyboard-operable.
assert.ok(/draggingSourceId/.test(html), "drag-over validates against the tracked dragged piece");
assert.ok(
  /setAttribute\("role", "button"\)/.test(html) && /addEventListener\("keydown"/.test(html),
  "empty slots are keyboard-operable drop targets",
);

console.log("episode layout canvas: drag-in placement rules and readiness verified");
