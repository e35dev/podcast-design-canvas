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

  querySelectorAll(selector) {
    if (selector === "button") {
      return this.children.filter((child) => child.tagName === "button");
    }
    return [];
  }

  click() {
    if (this.listeners.click) {
      this.listeners.click({ target: this });
    }
  }
}

const toolbar = new Element("div");
const variants = new Element("div");
const surfaceNote = new Element("div");

["large", "small", "mobile", "dark"].forEach((surface) => {
  const button = new Element("button");
  button.dataset.surface = surface;
  toolbar.appendChild(button);
});

const document = {
  querySelector(selector) {
    if (selector === "#surfaceToolbar") return toolbar;
    if (selector === "#variants") return variants;
    if (selector === "#surfaceNote") return surfaceNote;
    throw new Error(`Unexpected selector: ${selector}`);
  },
  createElement(tagName) {
    return new Element(tagName);
  },
};

const html = fs.readFileSync("prototype/thumbnail-cover-frame.html", "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const sandbox = { document, module: { exports: {} } };

vm.runInNewContext(script, sandbox);

function buttonFor(surface) {
  const button = toolbar.children.find((child) => child.dataset.surface === surface);
  assert(button, `Missing button for ${surface}`);
  return button;
}

function assertSurface(surface, expectedClass, expectedCopy) {
  buttonFor(surface).click();
  assert.strictEqual(variants.className, expectedClass);
  assert.match(surfaceNote.textContent, expectedCopy);
  toolbar.children.forEach((button) => {
    const active = button.dataset.surface === surface;
    assert.strictEqual(button.className, active ? "active" : "");
    assert.strictEqual(button.attributes["aria-pressed"], String(active));
  });
}

assert.deepStrictEqual(Object.keys(sandbox.module.exports.surfaces), ["large", "small", "mobile", "dark"]);
assert.strictEqual(variants.className, "variants preview-large");
assert.match(surfaceNote.textContent, /Large header preview/);
assert.strictEqual(buttonFor("large").attributes["aria-pressed"], "true");

assertSurface("small", "variants preview-small", /Small grid preview/);
assertSurface("mobile", "variants preview-mobile", /Mobile feed preview/);
assertSurface("dark", "variants preview-dark", /Dark surface preview/);
assertSurface("large", "variants preview-large", /watch-page size/);
