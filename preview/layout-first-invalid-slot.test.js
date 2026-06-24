"use strict";

// Behavior test for invalid-slot feedback on the layout-first canvas (#1131 / #1026): a slot
// that rejects a file (non-video or empty) is flagged on the slot itself and named in the
// error, and the flag clears once a valid file lands or the slot is cleared. Standalone (own
// DOM stub) so it does not touch the shared layout-first.test.js.
// Run: `node preview/layout-first-invalid-slot.test.js`

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

function video(name) { return { name, type: "video/mp4", size: 2048 }; }
function notVideo(name) { return { name, type: "image/png", size: 2048 }; }
function emptyVideo(name) { return { name, type: "video/mp4", size: 0 }; }

const ctl = createLayoutFirstController(documentStub, { URL: urlApi });
const host = ctl.zonesBySlot.host;
const errorText = elementsById["layout-error"];
const errorCard = elementsById["layout-error-card"];
const slotStatus = elementsById["layout-slot-status"];

function slotState(slot) {
  const zone = ctl.zonesBySlot[slot];
  return zone.children.find((child) => child.className === "slot-state");
}

// A non-video file flags the specific slot and names it in the error.
ctl.placeVideoFile(host, notVideo("poster.png"));
assert.ok(host.classList.contains("is-invalid"), "a non-video file flags the slot it was dropped on");
assert.ok(!host.classList.contains("filled"), "a rejected file does not fill the slot");
assert.match(errorText.textContent, /Host/, "the error names the slot that rejected the file");
assert.doesNotMatch(errorText.textContent, /\bneeds\b/i, "the rejection error does not use needs wording");
assert.equal(slotState("host").textContent, "Invalid file", "a rejected slot badge does not read Needs video");
assert.ok(slotState("host").classList.contains("is-invalid"), "the rejected slot badge carries the invalid state");
assert.doesNotMatch(
  slotStatus.textContent,
  /Still need the Host/,
  "the side-panel summary does not treat a rejected slot as still needing a video",
);

// Placing a valid video in that slot clears the invalid flag.
ctl.placeVideoFile(host, video("host-cam.mp4"));
assert.ok(host.classList.contains("filled"), "a valid video fills the slot");
assert.ok(!host.classList.contains("is-invalid"), "a valid placement clears the invalid flag");

// A 0-byte (empty) export flags the slot and names it too.
const guest = ctl.zonesBySlot.guest;
ctl.placeVideoFile(guest, emptyVideo("guest.mp4"));
assert.ok(guest.classList.contains("is-invalid"), "an empty file flags the slot");
assert.match(errorText.textContent, /Guest/, "the empty-file error names the slot");
assert.equal(slotState("guest").textContent, "Invalid file", "an empty-file rejection shows Invalid file on the badge");

// Rejecting on a second slot clears the first slot's stale invalid flag.
ctl.placeVideoFile(host, notVideo("poster-again.png"));
assert.ok(!guest.classList.contains("is-invalid"), "a new rejection clears the prior slot's invalid flag");
assert.ok(host.classList.contains("is-invalid"), "only the slot named in the error stays flagged");
assert.match(errorText.textContent, /Host/, "the error follows the latest rejection");

// Placing a valid video in another slot keeps the invalid slot's error visible.
ctl.placeVideoFile(guest, video("guest-cam.mp4"));
assert.ok(host.classList.contains("is-invalid"), "host stays flagged while guest is filled");
assert.ok(guest.classList.contains("filled"), "guest accepts a valid video");
assert.match(errorText.textContent, /Host/, "the invalid-slot error stays visible after another slot is filled");
assert.ok(errorCard.hidden === false, "the error card stays open while a slot remains invalid");
assert.doesNotMatch(
  slotStatus.textContent,
  /Still need the Host/,
  "a filled guest plus invalid host does not list host in Still need",
);

// Switching layout while a slot stays invalid keeps its error visible (not cleared by applyLayout).
ctl.applyLayout("solo");
assert.ok(host.classList.contains("is-invalid"), "layout switch keeps invalid state on a still-visible slot");
assert.match(errorText.textContent, /Host/, "layout switch keeps the invalid-slot error visible");
assert.ok(errorCard.hidden === false, "the error card stays open after layout switch");

// Removing/clearing the slot clears the flag (reset path goes through clearZone).
ctl.applyLayout("interview");
ctl.placeVideoFile(guest, notVideo("guest.png"));
assert.ok(guest.classList.contains("is-invalid"), "guest re-flagged before reset");
ctl.resetVideos();
assert.ok(!guest.classList.contains("is-invalid"), "resetting the canvas clears the invalid flag");

assert.match(html, /\.drop-zone\.is-invalid \{/, "an invalid-slot style is defined");

console.log("layout-first invalid-slot: rejected files flag and name the slot; valid placement and reset clear it");
