"use strict";

// Guards the source-media-health inline editor from dropping focus on each
// typed character. Run with: `node prototype/source-media-health-name-focus.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "source-media-health.html"), "utf8");
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
        node._selectors["[data-role]"] = makeNode("strong");
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
    scrollIntoView() {},
    get childElementCount() {
      return node._children.length;
    },
  };
  return node;
}

const roots = {};
[
  "#speakers",
  "#status",
  "#issues",
  "#batchImport",
  "#batchStatus",
  "#batchDetail",
  "#batchToolbar",
  "#batchLinks",
  "#batchConditionTags",
  "#batchFilterNote",
  "#addSpeaker",
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
  window: { setTimeout() {} },
  structuredClone: globalThis.structuredClone,
  console,
};

vm.createContext(sandbox);
vm.runInContext(script, sandbox);

assert.strictEqual(typeof sandbox.updateSpeaker, "function", "source media health exposes updateSpeaker()");

function issueTitles() {
  return roots["#issues"]._children.map((article) => article._children[0].textContent);
}

function batchLinkNames() {
  return roots["#batchLinks"]._children.map((row) => row._children[0]._children[0].textContent);
}

const speakersReplaceCount = roots["#speakers"]._replaceCount;
assert.ok(
  issueTitles().some((title) => title.includes("Marcus Lee")),
  "sample summary starts with the flagged Marcus issue",
);

sandbox.updateSpeaker({ target: { dataset: { field: "name" }, value: "Guest 1 — Marcus Stone" } }, 1);

assert.strictEqual(
  roots["#speakers"]._replaceCount,
  speakersReplaceCount,
  "typing in the speaker name refreshes summary copy without rebuilding the speaker list",
);
assert.ok(
  issueTitles().some((title) => title.includes("Marcus Stone")),
  "issue titles pick up the edited speaker name",
);
assert.ok(
  batchLinkNames().some((name) => name.includes("Marcus Stone")),
  "batch jump links pick up the edited speaker name",
);

sandbox.updateSpeaker({ target: { dataset: { field: "condition" }, value: "good" } }, 1);

assert.ok(
  roots["#speakers"]._replaceCount > speakersReplaceCount,
  "changing the detected condition still rebuilds the speaker list when row controls change",
);

console.log("source media health: name edits preserve the speaker list while summary copy stays live");
