"use strict";

// Behavior test for disabled Continue guidance on the layout-first landing (#1026 / #1131):
// clicking gated Continue focuses the first slot that still blocks progress — missing
// required video, invalid rejection, or duplicate recording. Standalone DOM stub.
// Run: `node preview/layout-first-continue-guidance.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { createLayoutFirstController } = require("./layout-first.js");
const html = fs.readFileSync(path.join(__dirname, "layout-first.html"), "utf8");

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

let lastFocused = null;

class Element {
  constructor(tagName, options = {}) {
    this.tagName = tagName;
    this.id = options.id || "";
    this.dataset = options.dataset || {};
    this.className = options.className || "";
    this.classList = new ClassList(options.className || "");
    this.children = [];
    this.firstChild = null;
    this.textContent = options.textContent || "";
    this.hidden = Boolean(options.hidden);
    this.attributes = {};
    this.listeners = {};
    this.files = null;
    this.value = "";
  }
  focus() { lastFocused = this; }
  scrollIntoView() {}
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  appendChild(child) {
    this.children.push(child);
    this.firstChild = this.children[0] || null;
    child.parentNode = this;
    return child;
  }
  insertBefore(child, before) {
    const index = this.children.indexOf(before);
    if (index === -1) this.children.unshift(child);
    else this.children.splice(index, 0, child);
    this.firstChild = this.children[0] || null;
    child.parentNode = this;
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
  zone.appendChild(new Element("span", { className: "slot-label", textContent: `${slot} slot` }));
  const input = new Element("input", { className: "slot-file", dataset: { fileInput: slot } });
  zone.appendChild(input);
  return zone;
}

function video(name) {
  return { name, type: "video/mp4", size: 1024, lastModified: 1717000000000 };
}

function buildController() {
  const zones = [
    makeZone("host"),
    makeZone("guest"),
    makeZone("guest-b", "drop-zone is-hidden"),
    makeZone("broll"),
  ];
  const buttons = [
    makeLayoutButton("interview", "Using interview"),
    makeLayoutButton("solo", "Use solo"),
    makeLayoutButton("panel", "Use panel"),
  ];
  const byId = {
    "layout-scene-label": new Element("span"),
    "layout-runtime-label": new Element("span"),
    "speaker-row": new Element("div", { className: "speaker-row" }),
    "layout-slot-status": new Element("p"),
    "layout-reset": new Element("button"),
    "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
    "layout-error-card": new Element("div", { hidden: true }),
    "layout-error": new Element("p"),
  };
  const doc = {
    createElement(tagName) { return new Element(tagName); },
    getElementById(id) { return byId[id] || null; },
    querySelectorAll(selector) {
      if (selector === "[data-layout]") return buttons;
      if (selector === ".drop-zone[data-slot]") return zones;
      return [];
    },
  };
  const controller = createLayoutFirstController(doc, { URL: { createObjectURL() { return "blob:test"; }, revokeObjectURL() {} } });
  return { controller, byId };
}

assert.ok(
  !html.includes("pointer-events: none"),
  "disabled Continue stays clickable so gated clicks can guide the creator to blocking slots",
);

const { controller, byId } = buildController();
lastFocused = null;
byId["layout-continue"].listeners.click({ preventDefault() {} });
assert.strictEqual(
  lastFocused,
  controller.zonesBySlot.host.querySelector("[data-file-input]"),
  "gated Continue focuses the first missing required slot",
);

controller.placeVideoFile(controller.zonesBySlot.host, video("host.mp4"));
lastFocused = null;
byId["layout-continue"].listeners.click({ preventDefault() {} });
assert.strictEqual(
  lastFocused,
  controller.zonesBySlot.guest.querySelector("[data-file-input]"),
  "gated Continue advances to the next missing required slot",
);

controller.placeVideoFile(controller.zonesBySlot.guest, { name: "notes.txt", type: "text/plain" });
assert.equal(controller.zonesBySlot.guest.classList.contains("is-invalid"), true, "non-video rejection flags the slot");
lastFocused = null;
byId["layout-continue"].listeners.click({ preventDefault() {} });
assert.strictEqual(
  lastFocused,
  controller.zonesBySlot.guest.querySelector("[data-file-input]"),
  "gated Continue focuses the invalid required slot before empty ones",
);

controller.placeVideoFile(controller.zonesBySlot.guest, video("guest.mp4"));
controller.zonesBySlot.host.dataset.fileSig = "shared-take";
controller.zonesBySlot.guest.dataset.fileSig = "shared-take";
controller.zonesBySlot.host.classList.add("filled");
controller.zonesBySlot.guest.classList.add("filled");
controller.updateSlotStatus();
assert.equal(controller.duplicateBlockingZones().length, 2, "duplicate recording identity blocks both speaker slots");
lastFocused = null;
byId["layout-continue"].listeners.click({ preventDefault() {} });
assert.strictEqual(
  lastFocused,
  controller.zonesBySlot.host.querySelector("[data-file-input]"),
  "gated Continue focuses the first duplicate speaker slot",
);

console.log("layout-first continue-guidance: disabled Continue focuses the first blocking slot");
