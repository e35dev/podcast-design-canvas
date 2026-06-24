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
      return flatten(this.children).filter((child) => child.tagName === "button");
    }
    return [];
  }

  click() {
    if (!this.disabled && this.listeners.click) {
      this.listeners.click({ target: this });
    }
  }
}

function flatten(nodes) {
  return nodes.flatMap((node) => [node, ...flatten(node.children || [])]);
}

const toolbar = new Element("div");
const variants = new Element("div");
const surfaceNote = new Element("div");
const exportSummary = new Element("div");
const exportWarnings = new Element("div");
const packageNote = new Element("p");
const saveCover = new Element("button");

["large", "small", "mobile", "dark"].forEach((surface) => {
  const button = new Element("button");
  button.dataset.surface = surface;
  toolbar.appendChild(button);
});

const elements = {
  surfaceToolbar: toolbar,
  variants,
  surfaceNote,
  exportSummary,
  exportWarnings,
  packageNote,
  saveCover,
};

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

const html = fs.readFileSync("prototype/thumbnail-cover-frame.html", "utf8");
const script = fs.readFileSync("prototype/thumbnail-cover-frame.js", "utf8");
const sandbox = { document, module: { exports: {} } };

vm.runInNewContext(script, sandbox);

function buttonFor(surface) {
  const button = toolbar.children.find((child) => child.dataset.surface === surface);
  assert(button, `Missing button for ${surface}`);
  return button;
}

function actionButton(label) {
  const button = flatten([variants]).find((node) => node.tagName === "button" && node.textContent === label);
  assert(button, `Missing action button: ${label}`);
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

assert.ok(
  html.includes('<script src="./thumbnail-cover-frame.js" defer></script>'),
  "thumbnail behavior loads as production JavaScript",
);
assert.deepStrictEqual(Object.keys(sandbox.module.exports.surfaces), ["large", "small", "mobile", "dark"]);

let state = sandbox.module.exports.createInitialState();
assert.strictEqual(sandbox.module.exports.activeFrame(state).id, "reaction");
assert.strictEqual(sandbox.module.exports.exportReadiness(state).status, "review");
assert.strictEqual(sandbox.module.exports.promoteFrame(state, "guest-closeup"), true);
assert.strictEqual(sandbox.module.exports.exportReadiness(state).status, "blocked");
assert.strictEqual(sandbox.module.exports.saveActiveCover(state), false);
assert.strictEqual(sandbox.module.exports.resolveFrameConcern(state, "guest-closeup", "shorten-title"), true);
assert.strictEqual(sandbox.module.exports.exportReadiness(state).status, "ready");
assert.strictEqual(sandbox.module.exports.saveActiveCover(state), true);
assert.strictEqual(state.savedFrameId, "guest-closeup");
assert.strictEqual(sandbox.module.exports.isSavedFrame(state, sandbox.module.exports.activeFrame(state)), true);

state = sandbox.module.exports.createInitialState();
assert.strictEqual(sandbox.module.exports.promoteFrame(state, "host-solo"), true);
assert.strictEqual(sandbox.module.exports.saveActiveCover(state), true);
assert.strictEqual(sandbox.module.exports.isSavedFrame(state, sandbox.module.exports.activeFrame(state)), true);
assert.strictEqual(sandbox.module.exports.resolveFrameConcern(state, "host-solo", "brand-kit"), true);
assert.strictEqual(sandbox.module.exports.isSavedFrame(state, sandbox.module.exports.activeFrame(state)), false);

const controller = sandbox.module.exports.initThumbnailCoverFrame(document);
state = controller.state;

assert.strictEqual(variants.className, "variants preview-large");
assert.match(surfaceNote.textContent, /Large header preview/);
assert.strictEqual(buttonFor("large").attributes["aria-pressed"], "true");
assert.match(variants.textContent, /Host \+ guest reaction frame/);
assert.match(exportSummary.textContent, /Cover ready with notes/);
assert.strictEqual(saveCover.disabled, false);

actionButton("Promote to active cover").click();
assert.strictEqual(state.activeFrameId, "guest-closeup");
assert.match(exportSummary.textContent, /Review before export/);
assert.strictEqual(saveCover.disabled, true);
assert.match(variants.textContent, /Shorten title/);

actionButton("Shorten title").click();
assert.match(variants.textContent, /Launch fix/);
assert.strictEqual(saveCover.disabled, false);
saveCover.click();
assert.strictEqual(state.savedFrameId, "guest-closeup");
assert.strictEqual(saveCover.disabled, true);
assert.match(packageNote.textContent, /saved as the export cover/);

assertSurface("small", "variants preview-small", /Small grid preview/);
assert.match(variants.textContent, /Check smallest preview/);
actionButton("Mark checked").click();
assert.match(packageNote.textContent, /passed the smallest preview check/);
assert.match(exportSummary.textContent, /Cover ready for export/);

assertSurface("mobile", "variants preview-mobile", /Mobile feed preview/);
assertSurface("dark", "variants preview-dark", /Dark surface preview/);
