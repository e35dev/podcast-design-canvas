"use strict";

// Guards that episode readiness surfaces the layout-first start handoff, the same way
// speaker role mapping does. Run with:
//   `node prototype/episode-readiness-layout-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-readiness.html"), "utf8");
const handoff = require("../preview/layout-handoff.js");

assert.ok(
  html.includes("../preview/layout-handoff.js"),
  "episode readiness loads the shared layout handoff helper",
);
assert.match(
  html,
  /id="layout-handoff" class="layout-handoff" hidden/,
  "episode readiness reserves a hidden layout-start summary",
);
assert.ok(
  html.includes("layoutHandoffApi.load(layoutHandoffStorage(), window.location.search)"),
  "episode readiness reads fresh URL handoff state and stored layout-start state",
);
assert.ok(
  html.includes("function layoutHandoffStorage()"),
  "episode readiness guards session storage access for static preview contexts",
);
assert.ok(
  html.includes("layoutHandoffApi.placementList(layoutHandoff)"),
  "episode readiness summarizes placed videos with their carried file names",
);
assert.doesNotMatch(
  html,
  /layoutHandoffElement\.innerHTML/,
  "layout handoff summary is not rendered with innerHTML",
);

// Behavioral: run the page's inline script against a tiny DOM/window stub with a real
// layout-first handoff in the URL, and confirm the summary node is populated and revealed.
const state = handoff.stateFromSlots("interview", [
  { slot: "host", name: "host-cam.mp4", sig: "name:host-cam.mp4|size:1|mtime:1" },
  { slot: "guest", name: "guest-cam.mp4", sig: "name:guest-cam.mp4|size:2|mtime:2" },
]);
const search = "?" + handoff.queryForState(state);

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {}, hidden: undefined,
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

const roots = {};
["#tracks", "#status", "#issues", "#continue", "#continueNote", "#addGuest", "#reset", "#layout-handoff"].forEach((sel) => {
  roots[sel] = makeNode();
});
const documentStub = {
  createElement: (tag) => makeNode(tag),
  createTextNode: (text) => ({ textContent: text }),
  querySelector: (sel) => roots[sel] || makeNode(),
};
const windowStub = { PodcastLayoutHandoff: handoff, location: { search }, sessionStorage: undefined };
const sandbox = { document: documentStub, window: windowStub, structuredClone: globalThis.structuredClone, console };
vm.createContext(sandbox);
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(script, sandbox); // runs render() + renderLayoutHandoff() — must not throw

const summary = roots["#layout-handoff"];
assert.strictEqual(summary.hidden, false, "the layout-start summary is revealed when a handoff is present");
assert.strictEqual(summary._children.length, 2, "the summary renders a heading and a copy line");
assert.match(summary._children[0].textContent, /Interview layout/, "the summary names the carried layout");
assert.match(
  summary._children[1].textContent,
  /host-cam\.mp4/,
  "the summary lists the placed host recording carried from layout start",
);
assert.match(
  summary._children[1].textContent,
  /guest-cam\.mp4/,
  "the summary lists the placed guest recording carried from layout start",
);

console.log("episode readiness: layout-first handoff summary surfaces placed videos");
