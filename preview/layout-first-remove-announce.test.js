"use strict";

// Guards that activating the Remove button announces the removal to screen readers, the same as
// the keyboard Delete path already does (#1026). Otherwise a screen-reader user who clicks the
// primary Remove control hears only the recomputed readiness line, never what the press did.
// Kept in its own file so it does not collide with the frequently-edited layout-first.test.js.
// Run with: `node preview/layout-first-remove-announce.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { createLayoutFirstController } = require("./layout-first.js");
const jsSource = fs.readFileSync(path.join(__dirname, "layout-first.js"), "utf8");

class ClassList {
  constructor(initial = "") { this.classes = new Set(String(initial).split(/\s+/).filter(Boolean)); }
  add(name) { this.classes.add(name); }
  remove(name) { this.classes.delete(name); }
  contains(name) { return this.classes.has(name); }
  toggle(name, force) {
    const shouldAdd = force === undefined ? !this.classes.has(name) : Boolean(force);
    if (shouldAdd) this.classes.add(name); else this.classes.delete(name);
    return shouldAdd;
  }
}

class Element {
  constructor(tagName, options = {}) {
    this.tagName = tagName;
    this.dataset = options.dataset || {};
    this.className = options.className || "";
    this.classList = new ClassList(options.className || "");
    this.children = [];
    this.firstChild = null;
    this.attributes = {};
    this.listeners = {};
    this.value = "";
    this.textContent = "";
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  dispatch(type, event) { if (this.listeners[type]) this.listeners[type](event || {}); }
  focus() {}
  appendChild(child) { this.children.push(child); this.firstChild = this.children[0] || null; child.parentNode = this; return child; }
  insertBefore(child, before) {
    const index = this.children.indexOf(before);
    if (index === -1) this.children.unshift(child); else this.children.splice(index, 0, child);
    this.firstChild = this.children[0] || null;
    child.parentNode = this;
    return child;
  }
  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((c) => c !== this);
    this.parentNode.firstChild = this.parentNode.children[0] || null;
  }
  querySelector(selector) { return findAll(this, selector)[0] || null; }
}

function findAll(root, selector) {
  const out = [];
  (function visit(node) { if (matches(node, selector)) out.push(node); node.children.forEach(visit); })(root);
  return out;
}
function matches(node, selector) {
  if (selector === ".drop-zone[data-slot]") return node.classList.contains("drop-zone") && Boolean(node.dataset.slot);
  if (selector === "[data-layout]") return Boolean(node.dataset.layout);
  if (selector === "[data-file-input]") return Boolean(node.dataset.fileInput);
  if (selector === ".placed-remove") return node.className === "placed-remove";
  if (selector === ".placed-video") return node.className === "placed-video";
  return false;
}
function makeLayoutButton(layout) {
  const button = new Element("button", { dataset: { layout } });
  button.appendChild(new Element("strong", { dataset: { layoutLabel: "" } }));
  return button;
}
function makeZone(slot, className = "drop-zone") {
  const zone = new Element("div", { className, dataset: { slot } });
  zone.appendChild(new Element("input", { dataset: { fileInput: slot } }));
  return zone;
}

const actionStatus = new Element("p");
const layoutButtons = [makeLayoutButton("interview"), makeLayoutButton("solo"), makeLayoutButton("panel")];
const zones = [makeZone("host"), makeZone("guest"), makeZone("guest-b", "drop-zone is-hidden"), makeZone("broll")];
const documentStub = {
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return id === "layout-action-status" ? actionStatus : null; },
  addEventListener() {},
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return layoutButtons;
    if (selector === ".drop-zone[data-slot]") return zones;
    return [];
  },
};
const urlApi = { createObjectURL() { return "blob:1"; }, revokeObjectURL() {} };

const controller = createLayoutFirstController(documentStub, { URL: urlApi });

// The Remove button click handler announces, not only the keyboard Delete path.
assert.equal(
  (jsSource.match(/announceAction\("Removed the " \+ removedName \+ " video\."\)/g) || []).length,
  2,
  "both the Remove button and the keyboard Delete path announce the removal",
);

controller.applyLayout("interview");
controller.placeVideoFile(controller.zonesBySlot.host, { name: "host.mp4", type: "video/mp4", size: 1, lastModified: 1 });
actionStatus.textContent = "";

const removeButton = controller.zonesBySlot.host.querySelector(".placed-remove");
assert.ok(removeButton, "the placed video renders a Remove button");

let stopped = false;
removeButton.dispatch("click", { stopPropagation() { stopped = true; } });

assert.ok(stopped, "the click handler stops propagation so it is not read as a slot drop");
assert.equal(actionStatus.textContent, "Removed the Host video.", "clicking Remove announces the removal with the slot name");
assert.ok(!controller.zonesBySlot.host.querySelector(".placed-video"), "the placed video is actually removed");

console.log("layout-first remove announce: clicking Remove announces the removal like keyboard Delete");
