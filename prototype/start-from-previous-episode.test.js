const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = {};
    this.attributes = {};
    this.disabled = false;
    this.checked = false;
    this.type = "";
    this.value = "";
    this.className = "";
    this._text = "";
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

  dispatch(type) {
    if (this.listeners[type]) {
      this.listeners[type]({ target: this });
    }
  }
}

const ids = [
  "episodeSelect",
  "startDraft",
  "carryList",
  "roleList",
  "importMedia",
  "confirmRoles",
  "continueStyle",
  "saveTemplate",
  "resetSample",
  "statusBadge",
  "previewFrame",
  "summaryGrid",
  "issues",
  "draftList",
];

const elements = Object.fromEntries(ids.map((id) => [id, new Element("div")]));
elements.episodeSelect.tagName = "select";
[
  "startDraft",
  "importMedia",
  "confirmRoles",
  "continueStyle",
  "saveTemplate",
  "resetSample",
].forEach((id) => {
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

const html = fs.readFileSync(path.join(__dirname, "start-from-previous-episode.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = { document, module: { exports: {} } };

vm.runInNewContext(script, sandbox);

function carryCheckbox(index) {
  const label = elements.carryList.children[index];
  assert(label, `Missing carry item ${index}`);
  const checkbox = label.children.find((child) => child.tagName === "input");
  assert(checkbox, `Missing checkbox ${index}`);
  return checkbox;
}

function roleCard(index) {
  const card = elements.roleList.children[index];
  assert(card, `Missing role card ${index}`);
  return card;
}

function roleSelect(index) {
  const label = roleCard(index).children.find((child) => child.tagName === "label");
  assert(label, `Missing role select wrapper ${index}`);
  const select = label.children.find((child) => child.tagName === "select");
  assert(select, `Missing role select ${index}`);
  return select;
}

assert.strictEqual(elements.statusBadge.textContent, "choose starter");
assert.strictEqual(elements.startDraft.disabled, false);
assert.strictEqual(elements.importMedia.disabled, true);
assert.match(elements.issues.textContent, /Start a draft before importing new recordings/);

elements.startDraft.click();
assert.strictEqual(elements.statusBadge.textContent, "draft from previous");
assert.strictEqual(elements.startDraft.disabled, true);
assert.strictEqual(elements.importMedia.disabled, false);
assert.match(elements.previewFrame.textContent, /Previous guest and topic cleared for the next episode/);

elements.importMedia.click();
assert.strictEqual(elements.statusBadge.textContent, "media replaced");
assert.strictEqual(elements.confirmRoles.disabled, false);
assert.strictEqual(roleSelect(0).disabled, false);
assert.strictEqual(roleSelect(0).value, "Maya host camera");
assert.strictEqual(roleSelect(1).value, "Jordan guest camera");

roleSelect(1).value = "Maya host camera";
roleSelect(1).dispatch("change");
assert.strictEqual(elements.confirmRoles.disabled, true);
assert.match(elements.issues.textContent, /Host and Guest cannot use the same recording/);

roleSelect(1).value = "Jordan guest camera";
roleSelect(1).dispatch("change");
assert.strictEqual(elements.confirmRoles.disabled, false);
assert.match(elements.issues.textContent, /Confirm the new speaker roles before styling/);

elements.confirmRoles.click();
assert.strictEqual(elements.statusBadge.textContent, "roles confirmed");
assert.strictEqual(elements.continueStyle.disabled, false);
assert.strictEqual((elements.roleList.textContent.match(/confirmed/g) || []).length, 2);

elements.continueStyle.click();
assert.strictEqual(elements.statusBadge.textContent, "ready to style");
assert.strictEqual(elements.saveTemplate.disabled, false);
assert.strictEqual(elements.continueStyle.disabled, true);

const rolesCarry = carryCheckbox(3);
rolesCarry.checked = false;
rolesCarry.dispatch("change");
assert.strictEqual(elements.statusBadge.textContent, "media replaced");
assert.strictEqual(elements.continueStyle.disabled, true);
assert.strictEqual(elements.saveTemplate.disabled, true);
assert.match(elements.roleList.textContent, /Speaker 1/);
assert.match(elements.roleList.textContent, /Speaker 2/);

elements.confirmRoles.click();
elements.continueStyle.click();
elements.saveTemplate.click();
assert.strictEqual(elements.statusBadge.textContent, "saved to template");
assert.match(elements.issues.textContent, /Future episodes updated/);

elements.resetSample.click();
assert.strictEqual(elements.statusBadge.textContent, "choose starter");
assert.strictEqual(elements.startDraft.disabled, false);
assert.strictEqual(elements.importMedia.disabled, true);
