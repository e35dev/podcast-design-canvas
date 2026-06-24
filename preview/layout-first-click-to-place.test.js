"use strict";

// Behavior test for click-to-place on the layout-first landing (#1026 / #1131): clicking
// anywhere in an empty, visible slot opens that slot's file picker. Standalone (own DOM stub)
// so it does not touch the shared layout-first.test.js. Run: `node preview/layout-first-click-to-place.test.js`

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

const ctl = createLayoutFirstController(documentStub, { URL: urlApi });

// Clicking an empty, visible slot opens that slot's file picker.
const hostInput = ctl.zonesBySlot.host.querySelector("[data-file-input]");
let hostOpened = 0;
hostInput.click = () => { hostOpened += 1; };
ctl.zonesBySlot.host.listeners.click({ target: ctl.zonesBySlot.host });
assert.equal(hostOpened, 1, "clicking an empty slot opens its file picker");

// Clicking the file input itself must not re-open the picker (native click already opens it).
ctl.zonesBySlot.host.listeners.click({ target: hostInput });
assert.equal(hostOpened, 1, "clicking the file input itself does not double-open the picker");

// A filled slot leaves clicks to its video and Remove control (no hijack).
ctl.placeVideoFile(ctl.zonesBySlot.guest, video("guest.mp4"));
const guestInput = ctl.zonesBySlot.guest.querySelector("[data-file-input]");
let guestOpened = 0;
guestInput.click = () => { guestOpened += 1; };
ctl.zonesBySlot.guest.listeners.click({ target: ctl.zonesBySlot.guest });
assert.equal(guestOpened, 0, "a filled slot does not hijack clicks to open the picker");

// A slot hidden by the current layout opens nothing on a stray click.
const hiddenInput = ctl.zonesBySlot["guest-b"].querySelector("[data-file-input]");
let hiddenOpened = 0;
hiddenInput.click = () => { hiddenOpened += 1; };
ctl.zonesBySlot["guest-b"].listeners.click({ target: ctl.zonesBySlot["guest-b"] });
assert.equal(hiddenOpened, 0, "a hidden slot does not open a picker");

assert.match(html, /\.drop-zone:not\(\.filled\) \{ cursor: pointer/, "empty slots show a clickable cursor");

console.log("layout-first click-to-place: empty slots open their picker; input/filled/hidden slots are handled");
