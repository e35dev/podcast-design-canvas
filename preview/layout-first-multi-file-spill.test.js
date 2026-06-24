"use strict";

// Behavior test for multi-file spill on the layout-first canvas (#1026): when the slot a
// batch lands on rejects the first file, the rest must not spill into other slots.
// Run: `node preview/layout-first-multi-file-spill.test.js`

const assert = require("assert");
const { createLayoutFirstController } = require("./layout-first.js");

class ClassList {
  constructor(initial = "") {
    this.classes = new Set(initial.split(/\s+/).filter(Boolean));
  }
  add(name) { this.classes.add(name); }
  remove(name) { this.classes.delete(name); }
  contains(name) { return this.classes.has(name); }
  toggle(name, force) {
    const shouldAdd = force === undefined ? !this.classes.has(name) : Boolean(force);
    if (shouldAdd) this.classes.add(name);
    else this.classes.delete(name);
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
    this.hidden = Boolean(options.hidden);
    this.attributes = {};
    this.listeners = {};
    this.value = "";
  }
  focus() {}
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  appendChild(child) {
    this.children.push(child);
    this.firstChild = this.children[0] || null;
    return child;
  }
  insertBefore(child, before) {
    const index = this.children.indexOf(before);
    if (index === -1) this.children.unshift(child);
    else this.children.splice(index, 0, child);
    this.firstChild = this.children[0] || null;
    return child;
  }
  querySelector(selector) { return findAll(this, selector)[0] || null; }
}

function findAll(rootNode, selector) {
  const nodes = [];
  (function visit(node) {
    if (matches(node, selector)) nodes.push(node);
    node.children.forEach(visit);
  })(rootNode);
  return nodes;
}

function matches(node, selector) {
  if (selector === ".drop-zone[data-slot]") {
    return node.classList.contains("drop-zone") && Boolean(node.dataset.slot);
  }
  if (selector === "[data-layout]") return Boolean(node.dataset.layout);
  if (selector === "[data-layout-label]") return Object.prototype.hasOwnProperty.call(node.dataset, "layoutLabel");
  if (selector === "[data-file-input]") return Boolean(node.dataset.fileInput);
  return false;
}

function makeLayoutButton(layout, label) {
  const button = new Element("button", { dataset: { layout } });
  button.appendChild(new Element("strong", { dataset: { layoutLabel: "" }, textContent: label }));
  return button;
}

function makeZone(slot, className = "drop-zone") {
  const zone = new Element("div", { className, dataset: { slot } });
  zone.appendChild(new Element("input", { dataset: { fileInput: slot } }));
  return zone;
}

function buildController() {
  const zones = [
    makeZone("host"),
    makeZone("guest"),
    makeZone("guest-b", "drop-zone is-hidden"),
    makeZone("broll"),
  ];
  const layoutButtons = [
    makeLayoutButton("interview", "Using interview"),
    makeLayoutButton("solo", "Use solo"),
    makeLayoutButton("panel", "Use panel"),
  ];
  const elementsById = {
    "layout-scene-label": new Element("span"),
    "layout-runtime-label": new Element("span"),
    "speaker-row": new Element("div", { className: "speaker-row" }),
    "layout-slot-status": new Element("p"),
    "layout-reset": new Element("button"),
    "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
    "layout-error-card": new Element("div", { hidden: true }),
    "layout-error": new Element("p"),
  };
  const documentStub = {
    createElement(tagName) { return new Element(tagName); },
    getElementById(id) { return elementsById[id] || null; },
    querySelectorAll(selector) {
      if (selector === "[data-layout]") return layoutButtons;
      if (selector === ".drop-zone[data-slot]") return zones;
      return [];
    },
  };
  return createLayoutFirstController(documentStub, {
    URL: { createObjectURL(file) { return `blob:${file.name}`; }, revokeObjectURL() {} },
  });
}

function video(name) {
  return { name, type: "video/mp4", size: 2048, lastModified: 1000 };
}

const ctl = buildController();
ctl.applyLayout("panel");
ctl.placeVideoFiles(ctl.zonesBySlot.host, [
  { name: "bad.png", type: "image/png", size: 100 },
  video("host.mp4"),
  video("guest.mp4"),
]);
assert.ok(ctl.zonesBySlot.host.classList.contains("is-invalid"), "the target slot is flagged when the first file is rejected");
assert.ok(!ctl.zonesBySlot.host.classList.contains("filled"), "the target slot stays empty after rejection");
assert.ok(!ctl.zonesBySlot.guest.classList.contains("filled"), "spill does not run when the first file is rejected");
assert.ok(!ctl.zonesBySlot["guest-b"].classList.contains("filled"), "later spill slots stay empty too");

ctl.resetVideos();
ctl.applyLayout("panel");
ctl.placeVideoFiles(ctl.zonesBySlot.host, [
  video("host.mp4"),
  video("guest.mp4"),
  video("guest-b.mp4"),
]);
assert.ok(ctl.zonesBySlot.host.classList.contains("filled"), "a valid first file still fills the target slot");
assert.ok(ctl.zonesBySlot.guest.classList.contains("filled"), "spill still runs after a successful first placement");
assert.ok(ctl.zonesBySlot["guest-b"].classList.contains("filled"), "spill fills following empty slots in order");

// Spill must skip slots that already rejected a file, so a batch drop on another slot
// does not silently clear an Invalid file badge the creator still needs to fix.
ctl.resetVideos();
ctl.applyLayout("interview");
ctl.placeVideoFile(ctl.zonesBySlot.guest, { name: "bad.png", type: "image/png", size: 100 });
assert.ok(ctl.zonesBySlot.guest.classList.contains("is-invalid"), "guest starts rejected");
ctl.placeVideoFiles(ctl.zonesBySlot.host, [video("host.mp4"), video("guest.mp4")]);
assert.ok(ctl.zonesBySlot.host.classList.contains("filled"), "the target slot still fills from the batch");
assert.ok(ctl.zonesBySlot.guest.classList.contains("is-invalid"), "spill does not overwrite a slot that already rejected a file");
assert.ok(!ctl.zonesBySlot.guest.classList.contains("filled"), "the rejected guest slot stays empty until the creator places there");

// A batch that contains the same recording twice must place it once — in the slot it landed
// on — not let the duplicate spill into another slot and clear the first placement. (The same
// source can't be two different speakers.)
ctl.resetVideos();
ctl.applyLayout("panel");
ctl.placeVideoFiles(ctl.zonesBySlot.host, [video("dupe.mp4"), video("dupe.mp4")]);
assert.ok(ctl.zonesBySlot.host.classList.contains("filled"), "a duplicate batch keeps the recording in the slot it landed on");
assert.ok(!ctl.zonesBySlot.guest.classList.contains("filled"), "a duplicate of the same recording does not spill into another slot");
assert.ok(!ctl.zonesBySlot["guest-b"].classList.contains("filled"), "no further slot is filled by a duplicate");

console.log("layout-first multi-file spill: no spill on reject; spill skips invalid slots");
