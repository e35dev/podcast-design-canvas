"use strict";

// Behavior test for replacing a placed layout-first recording (#1026 / #1131): a creator can
// drop a new video onto a filled slot or click the slot chrome to pick a replacement without
// removing the current file first. Run: `node preview/layout-first-replace-slot.test.js`

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
    this.id = options.id || "";
    this.dataset = options.dataset || {};
    this.className = options.className || "";
    this.classList = new ClassList(options.className || "");
    this.children = [];
    this.firstChild = null;
    this.parentNode = null;
    this.textContent = options.textContent || "";
    this.hidden = Boolean(options.hidden);
    this.attributes = {};
    this.listeners = {};
    this.files = null;
    this.value = "";
    this.draggable = false;
  }
  focus() {}
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
  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((c) => c !== this);
    this.parentNode.firstChild = this.parentNode.children[0] || null;
  }
  querySelector(selector) { return findAll(this, selector)[0] || null; }
  closest(selector) {
    let node = this;
    while (node) {
      if (matches(node, selector)) return node;
      node = node.parentNode;
    }
    return null;
  }
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
  if (selector === ".placed-video") return node.className === "placed-video";
  if (selector === ".placed-remove") return node.className === "placed-remove";
  if (selector === "video") return node.tagName === "VIDEO";
  return false;
}

function makeLayoutButton(layout, label) {
  const button = new Element("button", { dataset: { layout } });
  button.appendChild(new Element("strong", { dataset: { layoutLabel: "" }, textContent: label }));
  return button;
}

function makeZone(slot, className = "drop-zone") {
  const zone = new Element("div", { className, dataset: { slot } });
  zone.appendChild(new Element("input", { className: "slot-file", dataset: { fileInput: slot } }));
  return zone;
}

function video(name, size = 2048) {
  return { name, type: "video/mp4", size, lastModified: 1717000000000 + size };
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
    URL: {
      createObjectURL(file) { return `blob:${file.name}`; },
      revokeObjectURL() {},
    },
  });
}

const controller = buildController();
const hostZone = controller.zonesBySlot.host;
controller.placeVideoFile(hostZone, video("host-take-a.mp4"));
assert.equal(hostZone.dataset.fileName, "host-take-a.mp4", "host starts with the first recording");

// Dropping a new file onto the filled slot replaces the placed video.
controller.placeVideoFiles(hostZone, [video("host-take-b.mp4")]);
assert.equal(hostZone.dataset.fileName, "host-take-b.mp4", "a drop onto a filled slot replaces the recording");
assert.equal(hostZone.classList.contains("filled"), true, "the slot stays filled after replacement");

// Clicking the slot chrome opens the picker so the creator can choose a replacement.
const hostInput = hostZone.querySelector("[data-file-input]");
let pickerOpens = 0;
hostInput.click = () => { pickerOpens += 1; };
hostZone.listeners.click({ target: hostZone });
assert.equal(pickerOpens, 1, "clicking filled slot chrome opens the file picker for replacement");

// Clicks on the placed preview or Remove stay on those controls.
const placed = hostZone.querySelector(".placed-video");
const remove = placed.querySelector(".placed-remove");
const preview = placed.children.find((child) => child.tagName && child.tagName.toUpperCase() === "VIDEO");
pickerOpens = 0;
hostZone.listeners.click({ target: remove });
assert.equal(pickerOpens, 0, "clicking Remove does not open the replacement picker");
hostZone.listeners.click({ target: preview });
assert.equal(pickerOpens, 0, "clicking the video preview does not open the replacement picker");

// Replacing clears duplicate-signature matches in other slots, same as a fresh placement.
controller.placeVideoFile(controller.zonesBySlot.guest, video("guest.mp4"));
controller.placeVideoFile(hostZone, video("guest.mp4"));
assert.equal(controller.zonesBySlot.guest.classList.contains("filled"), false,
  "replacing host with the guest recording clears the duplicate from guest");

console.log("layout-first replace-slot: filled slots accept drops and chrome clicks to pick a replacement video");
