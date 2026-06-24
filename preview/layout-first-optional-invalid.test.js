"use strict";

// Behavior test for the optional b-roll slot's readiness messaging on the layout-first canvas
// (#1026). Rejecting a file into the OPTIONAL b-roll slot must not block Continue, but the
// readiness summary must not claim "Optional b-roll can be added later" while the slot is
// showing a rejection — that contradicts the visible "Invalid file" badge and alert. Standalone
// (own DOM stub) so it does not touch the shared layout-first.test.js.
// Run: `node preview/layout-first-optional-invalid.test.js`

const fs = require("fs");
const path = require("path");
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
  const controller = createLayoutFirstController(documentStub, { URL: urlApi });
  return { controller, elementsById };
}

function video(name) { return { name, type: "video/mp4", size: 2048 }; }
function notVideo(name) { return { name, type: "image/png", size: 2048 }; }

const { controller: ctl, elementsById } = buildController();
const host = ctl.zonesBySlot.host;
const guest = ctl.zonesBySlot.guest;
const broll = ctl.zonesBySlot.broll;
const slotStatus = elementsById["layout-slot-status"];
const continueLink = elementsById["layout-continue"];

// Required speaker videos placed; b-roll still empty -> the baseline "can be added later" copy.
ctl.placeVideoFile(host, video("host.mp4"));
ctl.placeVideoFile(guest, video("guest.mp4"));
assert.ok(!continueLink.classList.contains("is-disabled"), "both required videos enable Continue");
assert.match(slotStatus.textContent, /Optional b-roll can be added later/, "an untouched b-roll reads 'can be added later'");

// Reject a non-video into the OPTIONAL b-roll slot.
ctl.placeVideoFile(broll, notVideo("notes.png"));
assert.ok(broll.classList.contains("is-invalid"), "the b-roll slot flags the rejected file");
assert.equal(ctl.slotIndicators.broll.textContent, "Invalid file", "the b-roll badge shows the rejection");
// b-roll is optional, so the rejection must NOT block Continue (required slots are still filled).
assert.ok(!continueLink.classList.contains("is-disabled"), "an invalid optional b-roll does not block Continue");
// ...but the readiness summary must reflect the rejection, not the untouched-slot copy.
assert.doesNotMatch(
  slotStatus.textContent,
  /Optional b-roll can be added later/,
  "an invalid b-roll no longer reads like an untouched optional slot",
);
assert.match(slotStatus.textContent, /b-roll file wasn't a video/i, "the summary acknowledges the rejected optional file");

// Placing a valid b-roll clears the rejection wording.
ctl.placeVideoFile(broll, video("broll.mp4"));
assert.ok(broll.classList.contains("filled") && !broll.classList.contains("is-invalid"), "a valid b-roll fills the slot");
assert.match(slotStatus.textContent, /Optional b-roll is in place/, "a placed b-roll reports it is in place");

console.log("layout-first optional b-roll: a rejected optional file is reflected in the readiness summary without blocking Continue");
