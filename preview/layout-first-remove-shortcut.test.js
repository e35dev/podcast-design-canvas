"use strict";

// Guards that a placed video advertises its keyboard REMOVE shortcut, not only its move/swap
// arrows. The keydown handler removes the video on Delete/Backspace (the same as the Remove
// button), but aria-keyshortcuts listed only the arrow keys — so a screen-reader user never
// heard that Delete removes the focused video. The layout-picker buttons already follow the
// rule that advertised keys must match every key the handler acts on; this holds the placed
// video to it too. Purely behavioural (drives the controller, inspects the rendered attribute)
// and kept in its own file so it does not collide with the frequently-edited layout-first.test.js.
// Run with: `node preview/layout-first-remove-shortcut.test.js`

const assert = require("assert");
const { createLayoutFirstController } = require("./layout-first.js");

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
const urlApi = { createObjectURL() { return "blob:1"; }, revokeObjectURL() {} };

const controller = createLayoutFirstController(documentStub, { URL: urlApi });

controller.applyLayout("interview");
controller.placeVideoFile(controller.zonesBySlot.host, { name: "host.mp4", type: "video/mp4", size: 1, lastModified: 1 });

const wrap = controller.zonesBySlot.host.querySelector(".placed-video");
assert.ok(wrap, "the placed video renders a draggable container");

const shortcuts = String(wrap.getAttribute("aria-keyshortcuts") || "");
const advertised = new Set(shortcuts.split(/\s+/).filter(Boolean));

// The move/swap arrows must still be advertised...
["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].forEach((key) => {
  assert.ok(advertised.has(key), "aria-keyshortcuts still advertises the " + key + " move/swap shortcut");
});
// ...and so must the remove keys the handler actually acts on.
assert.ok(advertised.has("Delete"), "aria-keyshortcuts advertises Delete, which the handler uses to remove the video");
assert.ok(advertised.has("Backspace"), "aria-keyshortcuts advertises Backspace, which the handler also uses to remove the video");

// The accessible name mentions the remove shortcut so it is discoverable, not only the move/swap.
const label = String(wrap.getAttribute("aria-label") || "");
assert.ok(/Delete/.test(label), "the accessible name tells the creator Delete removes the video");

// And the advertised remove keys really do remove the video (the handler honours them).
controller.placeVideoFile(controller.zonesBySlot.guest, { name: "guest.mp4", type: "video/mp4", size: 2, lastModified: 2 });
const guestWrap = controller.zonesBySlot.guest.querySelector(".placed-video");
guestWrap.dispatch("keydown", { key: "Delete", target: guestWrap, preventDefault() {} });
assert.ok(!controller.zonesBySlot.guest.querySelector(".placed-video"), "pressing the advertised Delete shortcut removes the focused video");

console.log("layout-first remove shortcut: placed video advertises Delete/Backspace remove keys it handles");
