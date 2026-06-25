"use strict";

// Guards the connected episode-readiness editor from dropping focus on summary-only edits.
// Run with: `node prototype/episode-readiness-edit-focus.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "episode-readiness.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeNode(tag = "div") {
  let className = "";
  const node = {
    tagName: tag,
    id: "",
    dataset: {},
    style: {},
    hidden: false,
    disabled: false,
    selected: false,
    checked: false,
    textContent: "",
    value: "",
    href: "",
    type: "",
    min: "",
    placeholder: "",
    _attrs: {},
    _children: [],
    _replaceCount: 0,
    _listeners: {},
    set className(value) { className = value; },
    get className() { return className; },
    setAttribute(name, value) {
      this._attrs[name] = String(value);
      if (name === "href") this.href = String(value);
    },
    getAttribute(name) {
      return this._attrs[name] || null;
    },
    removeAttribute(name) {
      delete this._attrs[name];
      if (name === "href") this.href = "";
    },
    addEventListener(type, handler) {
      this._listeners[type] = handler;
    },
    append(...children) {
      this._children.push(...children);
    },
    appendChild(child) {
      this._children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this._children = children;
      this._replaceCount += 1;
    },
    querySelector() {
      return makeNode();
    },
    querySelectorAll() {
      return [];
    },
  };
  return node;
}

const roots = {};
[
  "#tracks",
  "#status",
  "#issues",
  "#continue",
  "#continueNote",
  "#addGuest",
  "#reset",
  "#layout-handoff",
].forEach((selector) => {
  roots[selector] = makeNode("div");
});

const documentStub = {
  createElement: (tag) => makeNode(tag),
  createTextNode: (text) => ({ textContent: text }),
  querySelector: (selector) => roots[selector] || makeNode(),
};

const sandbox = {
  document: documentStub,
  window: { location: { search: "" }, sessionStorage: undefined },
  structuredClone: globalThis.structuredClone,
  console,
};

vm.createContext(sandbox);
vm.runInContext(script, sandbox);

assert.strictEqual(typeof sandbox.updateTrack, "function", "episode readiness exposes updateTrack()");

function summaryTexts() {
  return roots["#issues"]._children
    .map((node) => (node._children && node._children[0] ? node._children[0].textContent : node.textContent))
    .filter(Boolean);
}

const tracksReplaceCount = roots["#tracks"]._replaceCount;
assert.ok(
  summaryTexts().some((text) => text.includes("Guest 1 still needs a speaker name")),
  "sample readiness starts with a missing speaker-name issue",
);

sandbox.updateTrack({ target: { dataset: { field: "name" }, value: "Remote guest" } }, 1);

assert.strictEqual(
  roots["#tracks"]._replaceCount,
  tracksReplaceCount,
  "typing a bucket name refreshes readiness copy without rebuilding track rows",
);
assert.ok(
  summaryTexts().some((text) => text.includes("Remote guest still needs a speaker name")),
  "readiness issue titles pick up the edited bucket name",
);

sandbox.updateTrack({ target: { dataset: { field: "speakerName" }, value: "Marcus Lee" } }, 1);

assert.strictEqual(
  roots["#tracks"]._replaceCount,
  tracksReplaceCount,
  "typing a speaker name keeps the track list stable",
);
assert.strictEqual(roots["#status"].textContent, "Ready for preset styling", "resolving the name issue updates readiness");
assert.strictEqual(roots["#continue"].href, "speaker-role-mapping.html", "summary-only edits can unlock Continue");

sandbox.updateTrack({ target: { dataset: { field: "audioKey" }, value: "host-audio" } }, 1);

assert.ok(
  roots["#tracks"]._replaceCount > tracksReplaceCount,
  "changing the recording still rebuilds track rows when row controls can change",
);
assert.ok(
  summaryTexts().some((text) => text.includes("Host and Remote guest appear to share audio")),
  "recording changes still refresh duplicate-audio readiness issues",
);

console.log("episode readiness: summary-only edits preserve track rows while recording changes rerender");
