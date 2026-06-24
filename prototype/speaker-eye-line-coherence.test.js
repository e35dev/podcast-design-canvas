const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.dataset = {};
    this.disabled = false;
    this._text = "";
    this.className = "";
    this.classList = {
      toggle: (className, enabled) => {
        const classes = new Set(this.className.split(/\s+/).filter(Boolean));
        if (enabled) classes.add(className);
        else classes.delete(className);
        this.className = Array.from(classes).join(" ");
      },
    };
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

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  click() {
    if (!this.disabled && this.listeners.click) {
      this.listeners.click({ target: this });
    }
  }

  querySelectorAll(selector) {
    if (selector === "[data-moment]") {
      return this.children.filter((child) => child.dataset.moment);
    }
    return [];
  }
}

const moments = new Element("div");
const splitMoment = new Element("article");
splitMoment.dataset.moment = "split";
const reactionMoment = new Element("article");
reactionMoment.dataset.moment = "reaction";
moments.append(splitMoment, reactionMoment);

const splitPreview = new Element("div");
splitPreview.className = "preview same-way";
const splitStatus = new Element("span");
splitStatus.className = "badge review";
const actionNote = new Element("div");
const openPreview = new Element("button");
const swapPlacement = new Element("button");
const saveArrangement = new Element("button");

const document = {
  querySelector(selector) {
    if (selector === "#moments") return moments;
    if (selector === '[data-preview="split"]') return splitPreview;
    if (selector === '[data-status="split"]') return splitStatus;
    if (selector === "#actionNote") return actionNote;
    if (selector === "#openPreview") return openPreview;
    if (selector === "#swapPlacement") return swapPlacement;
    if (selector === "#saveArrangement") return saveArrangement;
    throw new Error(`Unexpected selector: ${selector}`);
  },
  createElement(tagName) {
    return new Element(tagName);
  },
};

const html = fs.readFileSync("prototype/speaker-eye-line-coherence.html", "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = { document, module: { exports: {} } };

vm.runInNewContext(script, sandbox);

assert.deepStrictEqual(Object.keys(sandbox.module.exports.actions), ["preview", "swap", "save"]);
assert.match(actionNote.textContent, /Shared-frame preview opened/);
assert.match(splitMoment.className, /\bactive\b/);
assert.doesNotMatch(reactionMoment.className, /\bactive\b/);
assert.strictEqual(splitPreview.className, "preview same-way");
assert.strictEqual(splitStatus.textContent, "needs review");
assert.strictEqual(saveArrangement.disabled, true);

saveArrangement.click();
assert.match(actionNote.textContent, /Shared-frame preview opened/);

swapPlacement.click();
assert.match(actionNote.textContent, /Placement swapped/);
assert.strictEqual(splitPreview.className, "preview swapped");
assert.strictEqual(splitStatus.className, "badge ready");
assert.strictEqual(splitStatus.textContent, "coherent");
assert.strictEqual(saveArrangement.disabled, false);

saveArrangement.click();
assert.match(actionNote.textContent, /Recurring arrangement saved/);
assert.strictEqual(saveArrangement.disabled, true);

openPreview.click();
assert.match(actionNote.textContent, /Shared-frame preview opened/);
assert.strictEqual(splitPreview.className, "preview swapped");
assert.match(splitMoment.className, /\bactive\b/);
