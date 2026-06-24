const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.disabled = false;
    this.type = "";
    this._text = "";
    this.className = "";
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return [this._text, ...this.children.map((child) => child.textContent)].join("");
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
    this._text = "";
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  click() {
    if (!this.disabled && this.listeners.click) {
      this.listeners.click({ target: this });
    }
  }
}

const ids = [
  "destinations",
  "title",
  "subtitle",
  "status",
  "meta",
  "packages",
  "warnings",
  "handoffNote",
  "downloadPackage",
  "copyMetadata",
  "createReviewCopy",
  "startNextEpisode",
];

const elements = Object.fromEntries(ids.map((id) => [id, new Element("div")]));
["downloadPackage", "copyMetadata", "createReviewCopy", "startNextEpisode"].forEach((id) => {
  elements[id].tagName = "button";
});

const document = {
  querySelector(selector) {
    const id = selector.replace("#", "");
    assert(elements[id], `Unexpected selector: ${selector}`);
    return elements[id];
  },
  createElement(tagName) {
    return new Element(tagName);
  },
};

const html = fs.readFileSync("prototype/export-package-handoff.html", "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const sandbox = { document, module: { exports: {} } };

vm.runInNewContext(script, sandbox);

function destinationButton(label) {
  const button = elements.destinations.children.find((child) => child.textContent === label);
  assert(button, `Missing destination button: ${label}`);
  return button;
}

function noteText() {
  return elements.handoffNote.textContent;
}

assert.strictEqual(sandbox.module.exports.destinationHasRequiredBlock(sandbox.module.exports.destinations.youtube), false);
assert.strictEqual(sandbox.module.exports.destinationHasRequiredBlock(sandbox.module.exports.destinations.review), true);
assert.strictEqual(sandbox.module.exports.completePackageCount(sandbox.module.exports.destinations.youtube), 4);
assert.strictEqual(sandbox.module.exports.ignoredWarningCount(sandbox.module.exports.destinations.youtube), 1);
assert.strictEqual(sandbox.module.exports.packageStatusText("blocked"), "missing required item");

assert.match(noteText(), /Package ready/);
assert.strictEqual(elements.createReviewCopy.disabled, false);

elements.downloadPackage.click();
assert.match(noteText(), /Package download prepared/);
assert.match(noteText(), /4 completed items/);
assert.match(noteText(), /1 visible warning report/);

elements.copyMetadata.click();
assert.match(noteText(), /Metadata copied/);
assert.match(noteText(), /Interview split-screen metadata/);

elements.createReviewCopy.click();
assert.match(noteText(), /Review copy created/);

elements.startNextEpisode.click();
assert.match(noteText(), /Next episode started/);

destinationButton("Client review copy").click();
assert.match(elements.status.textContent, /missing required item/);
assert.strictEqual(elements.downloadPackage.disabled, true);
assert.strictEqual(elements.createReviewCopy.disabled, true);
assert.match(noteText(), /Resolve required item first/);

elements.downloadPackage.click();
assert.match(noteText(), /Resolve required item first/);

elements.createReviewCopy.click();
assert.match(noteText(), /Resolve required item first/);

elements.copyMetadata.click();
assert.match(noteText(), /Metadata copied/);
assert.match(noteText(), /Interview split-screen metadata/);

destinationButton("Archive master").click();
assert.strictEqual(elements.downloadPackage.disabled, false);
assert.strictEqual(elements.createReviewCopy.disabled, false);
assert.match(noteText(), /Package ready/);
