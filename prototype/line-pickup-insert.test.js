const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
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
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
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

  querySelector(selector) {
    if (selector === ".seam") {
      return this.children.find((child) => child.className === "seam") || null;
    }
    return null;
  }

  querySelectorAll(selector) {
    if (selector === "[data-moment]") {
      return this.children.filter((child) => child.dataset.moment);
    }
    return [];
  }
}

const moments = new Element("div");
const markedMoment = new Element("article");
markedMoment.dataset.moment = "marked";
const takeReadyMoment = new Element("article");
takeReadyMoment.dataset.moment = "take-ready";
const insertedMoment = new Element("article");
insertedMoment.dataset.moment = "inserted";
moments.append(markedMoment, takeReadyMoment, insertedMoment);

const markedPreview = new Element("div");
const markedTag = new Element("span");
const markedStatus = new Element("span");
const actionNote = new Element("div");
const markPickup = new Element("button");
const attachTake = new Element("button");
const captionReview = new Element("button");

const document = {
  querySelector(selector) {
    if (selector === "#moments") return moments;
    if (selector === '[data-preview="marked"]') return markedPreview;
    if (selector === '[data-tag="marked"]') return markedTag;
    if (selector === '[data-status="marked"]') return markedStatus;
    if (selector === "#actionNote") return actionNote;
    if (selector === "#markPickup") return markPickup;
    if (selector === "#attachTake") return attachTake;
    if (selector === "#captionReview") return captionReview;
    throw new Error(`Unexpected selector: ${selector}`);
  },
  createElement(tagName) {
    return new Element(tagName);
  },
};

const html = fs.readFileSync("prototype/line-pickup-insert.html", "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = { document, module: { exports: {} } };

vm.runInNewContext(script, sandbox);

assert.deepStrictEqual(Object.keys(sandbox.module.exports.actionCopy), ["mark", "attach", "caption"]);
assert.match(actionNote.textContent, /Pickup reminder selected/);
assert.match(markedMoment.className, /\bactive\b/);
assert.doesNotMatch(takeReadyMoment.className, /\bactive\b/);
assert.strictEqual(markedTag.textContent, "marked");
assert.strictEqual(markedStatus.textContent, "marked");
assert.strictEqual(captionReview.disabled, true);

captionReview.click();
assert.match(actionNote.textContent, /Pickup reminder selected/);

attachTake.click();
assert.match(actionNote.textContent, /Replacement take attached/);
assert.strictEqual(markedTag.textContent, "take ready");
assert.strictEqual(markedStatus.textContent, "take ready");
assert.strictEqual(markedStatus.className, "badge review");
assert.strictEqual(markedPreview.children.filter((child) => child.className === "seam").length, 1);
assert.strictEqual(captionReview.disabled, false);

attachTake.click();
assert.strictEqual(markedPreview.children.filter((child) => child.className === "seam").length, 1);

captionReview.click();
assert.match(actionNote.textContent, /Caption review opened/);
assert.strictEqual(markedStatus.textContent, "caption review open");
assert.strictEqual(markedStatus.className, "badge review");

markPickup.click();
assert.match(actionNote.textContent, /Pickup reminder selected/);
assert.match(markedMoment.className, /\bactive\b/);
assert.strictEqual(markedTag.textContent, "marked");
assert.strictEqual(markedStatus.textContent, "marked");
assert.strictEqual(markedStatus.className, "badge review");
assert.strictEqual(markedPreview.children.filter((child) => child.className === "seam").length, 0);
assert.strictEqual(captionReview.disabled, true);
