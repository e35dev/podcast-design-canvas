"use strict";

// Guards the accessible name on a draggable placed video (#1026): the drag-to-move/swap
// affordance is otherwise only visual, so a placed video carries a drag role description and
// a slot-named label for screen-reader users. Kept in its own file so it does not collide with
// the frequently-edited layout-first.test.js.
// Run with: `node preview/layout-first-drag-label.test.js`

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
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
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
  if (selector === "[data-layout-label]") return Object.prototype.hasOwnProperty.call(node.dataset, "layoutLabel");
  if (selector === "[data-file-input]") return Boolean(node.dataset.fileInput);
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

const layoutButtons = [makeLayoutButton("interview"), makeLayoutButton("solo"), makeLayoutButton("panel")];
const zones = [makeZone("host"), makeZone("guest"), makeZone("guest-b", "drop-zone is-hidden"), makeZone("broll")];
const documentStub = {
  createElement(tagName) { return new Element(tagName); },
  getElementById() { return null; },
  addEventListener() {},
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return layoutButtons;
    if (selector === ".drop-zone[data-slot]") return zones;
    return [];
  },
};
let urlSeq = 0;
const urlApi = { createObjectURL() { urlSeq += 1; return "blob:" + urlSeq; }, revokeObjectURL() {} };

const controller = createLayoutFirstController(documentStub, { URL: urlApi });

assert.ok(jsSource.includes('aria-roledescription'), "the placed video declares a drag role description");

controller.applyLayout("interview");
controller.placeVideoFile(controller.zonesBySlot.host, { name: "host.mp4", type: "video/mp4", size: 1, lastModified: 1 });

const placed = controller.zonesBySlot.host.querySelector(".placed-video");
assert.ok(placed, "a placed video element is rendered in the slot");
assert.equal(placed.getAttribute("draggable"), "true", "the placed video is exposed as draggable");
assert.equal(placed.getAttribute("aria-roledescription"), "Draggable video", "screen readers hear it is a draggable video");
const label = placed.getAttribute("aria-label") || "";
assert.match(label, /^Host video/, "the accessible name starts with the slot it holds");
assert.match(label, /move or swap/i, "the accessible name explains the drag action");

// A guest slot's placed video names that slot, not a hard-coded one.
controller.placeVideoFile(controller.zonesBySlot.guest, { name: "guest.mp4", type: "video/mp4", size: 2, lastModified: 2 });
const guestPlaced = controller.zonesBySlot.guest.querySelector(".placed-video");
assert.match(guestPlaced.getAttribute("aria-label") || "", /^Guest video/, "each placed video names its own slot");

console.log("layout-first drag label: a placed video is an accessible, slot-named draggable item");
