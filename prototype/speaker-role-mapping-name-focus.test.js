"use strict";

// Guards the role-mapping name editor from dropping focus on each typed character.
// Run with: `node prototype/speaker-role-mapping-name-focus.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "speaker-role-mapping.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeNode(tag) {
  let className = "";
  let innerHTML = "";
  const node = {
    tagName: tag,
    id: "",
    dataset: {},
    style: {},
    hidden: false,
    disabled: false,
    textContent: "",
    value: "",
    _children: [],
    _selectors: Object.create(null),
    _replaceCount: 0,
    set className(value) { className = value; },
    get className() { return className; },
    set innerHTML(value) {
      innerHTML = value;
      if (tag === "article") {
        node._selectors['[data-field="name"]'] = makeNode("input");
      }
    },
    get innerHTML() { return innerHTML; },
    setAttribute() {},
    getAttribute() { return null; },
    removeAttribute() {},
    addEventListener() {},
    appendChild(child) {
      node._children.push(child);
      return child;
    },
    append(...children) {
      node._children.push(...children);
    },
    replaceChildren(...children) {
      node._children = children;
      node._replaceCount += 1;
    },
    querySelector(selector) {
      return node._selectors[selector] || makeNode("div");
    },
    querySelectorAll() {
      return [];
    },
    get childElementCount() {
      return node._children.length;
    },
  };
  return node;
}

const roots = {};
[
  "#tracks",
  "#status",
  "#issues",
  "#layout-handoff",
  "#addTrack",
  "#reset",
].forEach((selector) => {
  roots[selector] = makeNode("div");
});

const documentStub = {
  createElement: (tag) => makeNode(tag),
  createTextNode: (text) => ({ textContent: text }),
  querySelector: (selector) => roots[selector] || makeNode("div"),
};

const sandbox = {
  document: documentStub,
  window: { location: { search: "" }, sessionStorage: undefined },
  structuredClone: globalThis.structuredClone,
  console,
};

vm.createContext(sandbox);
vm.runInContext(script, sandbox);

assert.strictEqual(typeof sandbox.updateTrack, "function", "speaker role mapping exposes updateTrack()");

function issueTitles() {
  return roots["#issues"]._children.map((article) => article._children[0].textContent);
}

const tracksReplaceCount = roots["#tracks"]._replaceCount;
assert.ok(
  issueTitles().some((title) => title.includes("Marcus Lee")),
  "sample issues start with the seeded speaker name",
);

sandbox.updateTrack({ target: { dataset: { field: "name" }, value: "Marcus Stone" } }, 1);

assert.strictEqual(
  roots["#tracks"]._replaceCount,
  tracksReplaceCount,
  "typing a speaker name refreshes summary copy without rebuilding the track list",
);
assert.ok(
  issueTitles().some((title) => title.includes("Marcus Stone")),
  "issue titles pick up the edited speaker name",
);

sandbox.updateTrack({ target: { dataset: { field: "role" }, value: "guest" } }, 3);

assert.ok(
  roots["#tracks"]._replaceCount > tracksReplaceCount,
  "changing the role still rebuilds the track rows when row controls change",
);

console.log("speaker role mapping: name edits preserve the track list while summary copy stays live");
