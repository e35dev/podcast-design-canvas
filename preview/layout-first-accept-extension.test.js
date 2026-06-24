"use strict";

// Behavior test for typeless-video acceptance on the layout-first canvas (#1131 / #1026):
// drag-and-drop bypasses the input's accept filter and some browsers report an empty MIME
// type for a valid recording, so a real .mp4/.mov dropped in should still be placed. A
// non-empty, non-video type stays rejected. Standalone (own DOM stub) so it does not touch
// the shared layout-first.test.js. Run: `node preview/layout-first-accept-extension.test.js`

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
    this.textContent = options.textContent || "";
    this.hidden = Boolean(options.hidden);
    this.attributes = {};
    this.listeners = {};
    this.files = null;
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
  const urlApi = {
    createObjectURL(file) { return `blob:${file.name}`; },
    revokeObjectURL() {},
  };
  return createLayoutFirstController(documentStub, { URL: urlApi });
}

// A valid recording the browser tagged with a video MIME type fills the slot (unchanged).
let ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "host.mp4", type: "video/mp4", size: 2048 });
assert.ok(ctl.zonesBySlot.host.classList.contains("filled"), "a video/* file is accepted");

// A recording with an empty MIME type (common via drag-and-drop) but a video extension fills.
ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "host-cam.MOV", type: "", size: 2048 });
assert.ok(ctl.zonesBySlot.host.classList.contains("filled"), "a typeless file with a video extension is accepted");

ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.guest, { name: "guest.webm", type: "", size: 2048 });
assert.ok(ctl.zonesBySlot.guest.classList.contains("filled"), "a typeless .webm is accepted");

// application/octet-stream (common on drag-and-drop) with a video extension is accepted too.
ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "host-cam.mp4", type: "application/octet-stream", size: 2048 });
assert.ok(ctl.zonesBySlot.host.classList.contains("filled"), "an octet-stream file with a video extension is accepted");
ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "notes.txt", type: "application/octet-stream", size: 2048 });
assert.ok(!ctl.zonesBySlot.host.classList.contains("filled"), "an octet-stream file without a video extension is rejected");
assert.ok(ctl.zonesBySlot.host.classList.contains("is-invalid"), "a rejected octet-stream file flags the slot");

// A typeless file that is NOT a known video extension is still rejected.
ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "notes.txt", type: "", size: 2048 });
assert.ok(!ctl.zonesBySlot.host.classList.contains("filled"), "a typeless non-video file is rejected");
assert.ok(ctl.zonesBySlot.host.classList.contains("is-invalid"), "a rejected typeless file flags the slot");

// A file the browser positively identifies as a non-video is still rejected, even if its
// name happens to carry a video-looking extension — we never loosen the guard for those.
ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "poster.png", type: "image/png", size: 2048 });
assert.ok(!ctl.zonesBySlot.host.classList.contains("filled"), "an image/* file is rejected");
ctl = buildController();
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "spoof.mp4", type: "image/png", size: 2048 });
assert.ok(!ctl.zonesBySlot.host.classList.contains("filled"), "a non-video MIME type is rejected even with a video-looking name");

console.log("layout-first accept-extension: typeless video files place by extension; typed non-videos stay rejected");
