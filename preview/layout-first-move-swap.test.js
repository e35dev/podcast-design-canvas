"use strict";

// Behavior test for dragging a placed recording between layout-first slots (#1026):
// dropping it on an empty slot moves it, dropping it on a filled slot swaps the two.
// Kept in its own file so it does not collide with the frequently-edited layout-first.test.js.
// Run with: `node preview/layout-first-move-swap.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { createLayoutFirstController } = require("./layout-first.js");

const jsSource = fs.readFileSync(path.join(__dirname, "layout-first.js"), "utf8");

class ClassList {
  constructor(initial = "") {
    this.classes = new Set(String(initial).split(/\s+/).filter(Boolean));
  }
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
  removeAttribute(name) { delete this.attributes[name]; }
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
  (function visit(node) {
    if (matches(node, selector)) out.push(node);
    node.children.forEach(visit);
  })(root);
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
const urlApi = {
  createObjectURL() { urlSeq += 1; return "blob:" + urlSeq; },
  revokeObjectURL() {},
};

const controller = createLayoutFirstController(documentStub, { URL: urlApi });

// The wiring that makes a placed video draggable and the move logic both exist.
assert.ok(jsSource.includes("wrap.draggable = true"), "a placed video is draggable to another slot");
assert.ok(jsSource.includes("function moveSlotVideo"), "the controller can move a placed video between slots");

function vid(name, size, mtime) {
  return { name, type: "video/mp4", size, lastModified: mtime };
}

controller.applyLayout("interview");
controller.placeVideoFile(controller.zonesBySlot.host, vid("a.mp4", 1, 1));

// Move a placed video onto an empty slot: it lands there and the source empties.
controller.moveSlotVideo(controller.zonesBySlot.host, controller.zonesBySlot.guest);
assert.equal(controller.zonesBySlot.guest.dataset.fileName, "a.mp4", "dragging a video onto an empty slot moves it there");
assert.equal(controller.zonesBySlot.host.classList.contains("filled"), false, "the source slot is emptied after a move");

// Drop onto a filled slot: the two recordings swap.
controller.placeVideoFile(controller.zonesBySlot.host, vid("b.mp4", 2, 2));
controller.moveSlotVideo(controller.zonesBySlot.host, controller.zonesBySlot.guest);
assert.equal(controller.zonesBySlot.guest.dataset.fileName, "b.mp4", "dragging onto a filled slot puts the dragged video there");
assert.equal(controller.zonesBySlot.host.dataset.fileName, "a.mp4", "and swaps the other recording back to the source slot");

// Dragging a slot onto itself, or from an empty slot, changes nothing.
controller.moveSlotVideo(controller.zonesBySlot.host, controller.zonesBySlot.host);
assert.equal(controller.zonesBySlot.host.dataset.fileName, "a.mp4", "dragging a slot onto itself changes nothing");
controller.moveSlotVideo(controller.zonesBySlot.broll, controller.zonesBySlot.host);
assert.equal(controller.zonesBySlot.host.dataset.fileName, "a.mp4", "dragging from an empty slot changes nothing");

console.log("layout-first move/swap: dragging a placed video moves it to an empty slot and swaps with a filled one");
