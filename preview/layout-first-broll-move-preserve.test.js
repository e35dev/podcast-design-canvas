"use strict";

// Regression test for moving a reused b-roll copy into a speaker slot (#1131).
//
// A recording can legitimately live in a speaker slot AND the optional b-roll slot at the
// same time — reusing a host/guest take as a cutaway is a deliberate production choice, not
// a duplicate (the invariant established by #1304). A move/swap only rearranges the two
// slots it involves, so MOVING the reused b-roll copy into another speaker slot must vacate
// only the b-roll source — it must never silently destroy the *separate* speaker placement
// the recording was reused from. Before this guard, the move ran the speaker slot's
// matching-source cleanup and emptied it, deleting a placed recording with no warning.
//
// Run: `node preview/layout-first-broll-move-preserve.test.js`

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

// --- The bug: moving a reused b-roll copy into a freed speaker slot deleted the recording's
//     separate speaker placement (the host take) with no warning. -------------------------
const ctl = buildController();
const hostTake = video("host-take.mp4");
ctl.placeVideoFile(ctl.zonesBySlot.host, hostTake);
ctl.placeVideoFile(ctl.zonesBySlot.guest, video("guest-take.mp4"));
ctl.placeVideoFile(ctl.zonesBySlot.broll, hostTake); // deliberate reuse (#1304): host AND b-roll

// Host and b-roll knowingly share the recording; neither is a duplicate yet.
assert.equal(ctl.zonesBySlot.host.classList.contains("filled"), true,
  "precondition: host holds its recording");
assert.equal(ctl.zonesBySlot.broll.classList.contains("filled"), true,
  "precondition: b-roll reuses the same recording");

// Free the guest slot, then move the reused b-roll copy into it.
ctl.removeVideo(ctl.zonesBySlot.guest);
ctl.moveSlotVideo(ctl.zonesBySlot.broll, ctl.zonesBySlot.guest);

// The move must relocate only the b-roll source — the host's separate placement survives.
assert.equal(ctl.zonesBySlot.host.classList.contains("filled"), true,
  "moving the reused b-roll copy keeps the host recording instead of silently deleting it");
assert.equal(ctl.zonesBySlot.host.dataset.fileName, "host-take.mp4",
  "the host's original recording is preserved intact");
assert.equal(ctl.zonesBySlot.guest.classList.contains("filled"), true,
  "the moved recording lands in the previously-empty speaker slot");
assert.equal(ctl.zonesBySlot.guest.dataset.fileName, "host-take.mp4",
  "the guest slot receives the moved recording");
assert.equal(ctl.zonesBySlot.broll.classList.contains("filled"), false,
  "only the b-roll source slot is vacated by the move");

// The now-shared recording across two speaker slots is surfaced honestly as a duplicate
// (and gates Continue) rather than being silently resolved by destroying a placement.
assert.deepEqual(ctl.duplicateFileNames(), ["host-take.mp4"],
  "two speaker slots sharing a recording is reported as a duplicate for the creator to resolve");

// --- Guard the scope: a normal (non-b-roll) move still relocates cleanly. -----------------
const plain = buildController();
plain.placeVideoFile(plain.zonesBySlot.host, video("only-host.mp4"));
plain.moveSlotVideo(plain.zonesBySlot.host, plain.zonesBySlot.guest);
assert.equal(plain.zonesBySlot.guest.classList.contains("filled"), true,
  "a plain move relocates the recording into the target slot");
assert.equal(plain.zonesBySlot.host.classList.contains("filled"), false,
  "a plain move vacates the origin slot");
assert.deepEqual(plain.duplicateFileNames(), [],
  "a plain move leaves a single placement, not a duplicate");

console.log("layout-first b-roll move preserve: moving a reused b-roll copy keeps the speaker recording it was reused from");
