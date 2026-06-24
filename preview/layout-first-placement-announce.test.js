"use strict";

// Guards that placing a recording into a slot announces to screen readers, like remove/move/swap/
// clear already do (#1026). Inserting videos into the named slots is the core canvas action, but on
// its own it only updated the readiness summary — never naming the slot just filled. Behaviour-only
// (drives the controller, inspects the action live region); kept in its own file so it does not
// collide with the frequently-edited layout-first.test.js.
// Run with: `node preview/layout-first-placement-announce.test.js`

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
let seq = 0;
const urlApi = { createObjectURL() { seq += 1; return "blob:" + seq; }, revokeObjectURL() {} };
const video = (name, size) => ({ name, type: "video/mp4", size, lastModified: size });

const controller = createLayoutFirstController(documentStub, { URL: urlApi });
controller.applyLayout("interview");

// A single placement names the slot it filled.
actionStatus.textContent = "";
controller.placeVideoFiles(controller.zonesBySlot.host, [video("host.mp4", 11)]);
assert.equal(actionStatus.textContent, "Placed the Host video.", "placing one recording names the slot it filled");
assert.ok(controller.zonesBySlot.host.querySelector(".placed-video"), "the recording is actually placed");

// Each slot is named on its own placement, not a hard-coded one.
actionStatus.textContent = "";
controller.placeVideoFiles(controller.zonesBySlot.guest, [video("guest.mp4", 22)]);
assert.equal(actionStatus.textContent, "Placed the Guest video.", "a different slot is named on its own placement");

// A multi-file drop that spills into open slots reports the count placed.
controller.resetVideos();
actionStatus.textContent = "";
controller.placeVideoFiles(controller.zonesBySlot.host, [video("a.mp4", 31), video("b.mp4", 32)]);
assert.equal(actionStatus.textContent, "Placed 2 videos.", "a multi-file placement reports how many landed");

// A rejected file does not announce a placement.
controller.resetVideos();
actionStatus.textContent = "";
controller.placeVideoFiles(controller.zonesBySlot.host, [{ name: "notes.txt", type: "text/plain", size: 5, lastModified: 5 }]);
assert.equal(actionStatus.textContent, "", "a rejected file announces no placement");

console.log("layout-first placement announce: placing a recording into a slot is confirmed to screen readers");
