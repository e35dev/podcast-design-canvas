"use strict";

// Behavior test for screen-reader announcement of placement errors on the layout-first canvas
// (#1131 / #1026). Sighted creators now see a rejected slot flagged (#1167); the error card was
// never announced, so screen-reader users got no feedback on a rejected placement. The card is
// now role="alert", and it is revealed with the message on a rejected drop and hidden again on a
// good one — which is what drives the announcement. Standalone (own DOM stub) so it does not
// touch the shared layout-first.test.js. Run: `node preview/layout-first-announce-errors.test.js`

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
const errorCard = new Element("div", { className: "status-card warning", hidden: true });
const elementsById = {
  "layout-scene-label": new Element("span"),
  "layout-runtime-label": new Element("span"),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": errorCard,
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

const ctl = createLayoutFirstController(documentStub, { URL: urlApi });
const errorText = elementsById["layout-error"];

// The error card carries alert semantics so assistive tech announces it when it appears.
assert.match(
  html,
  /id="layout-error-card"[^>]*\brole="alert"/,
  "the layout-first error card is a role=alert region",
);

// A rejected placement reveals the card with a message — the trigger for the announcement.
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "poster.png", type: "image/png", size: 2048 });
assert.equal(errorCard.hidden, false, "a rejected placement reveals the error card");
assert.ok(errorText.textContent.length > 0, "the revealed error carries a message to announce");

// A successful placement clears and hides the card again (so the alert isn't left standing).
ctl.placeVideoFile(ctl.zonesBySlot.host, { name: "host.mp4", type: "video/mp4", size: 2048 });
assert.equal(errorCard.hidden, true, "a successful placement hides the error card");
assert.equal(errorText.textContent, "", "the error message is cleared after a good placement");

console.log("layout-first announce-errors: error card is role=alert and is revealed/cleared with each placement result");
