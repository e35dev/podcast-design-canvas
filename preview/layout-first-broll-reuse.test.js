"use strict";

// Behavior test for reusing a speaker recording as the optional b-roll cutaway (#1131):
// placing the same video that is already in a required speaker slot into the b-roll slot
// is a normal production choice (e.g. a wide shot pulled from the same raw take), not a
// mistaken duplicate, so it must not silently clear the speaker's placement or block
// Continue. Two speaker slots sharing the same recording must still behave as a real
// duplicate. Run: `node preview/layout-first-broll-reuse.test.js`

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

// 1. Placing a speaker's recording into b-roll afterward must not clear the speaker slot.
const reuse = buildController();
const hostTake = video("host-wide-take.mp4");
reuse.placeVideoFile(reuse.zonesBySlot.host, hostTake);
reuse.placeVideoFile(reuse.zonesBySlot.guest, video("guest-take.mp4"));
reuse.placeVideoFile(reuse.zonesBySlot.broll, hostTake);

assert.equal(reuse.zonesBySlot.host.classList.contains("filled"), true,
  "reusing the host recording as b-roll keeps the host slot filled");
assert.equal(reuse.zonesBySlot.broll.classList.contains("filled"), true,
  "the b-roll slot also holds the reused recording");
assert.equal(reuse.zonesBySlot.host.dataset.fileSig, reuse.zonesBySlot.broll.dataset.fileSig,
  "host and b-roll knowingly share the same recording identity");

// 2. The shared source must not be reported as a blocking duplicate or gate Continue.
assert.deepEqual(reuse.duplicateFileNames(), [],
  "a recording shared between a speaker slot and b-roll is not a reported duplicate");
assert.deepEqual(reuse.duplicateBlockingZones(), [],
  "a recording shared between a speaker slot and b-roll does not block Continue");

// 3. The reverse order (place in b-roll first, then the speaker slot) behaves the same way.
const reuseReversed = buildController();
const guestTake = video("guest-wide-take.mp4");
reuseReversed.placeVideoFile(reuseReversed.zonesBySlot.broll, guestTake);
reuseReversed.placeVideoFile(reuseReversed.zonesBySlot.host, video("host-take.mp4"));
reuseReversed.placeVideoFile(reuseReversed.zonesBySlot.guest, guestTake);
assert.equal(reuseReversed.zonesBySlot.broll.classList.contains("filled"), true,
  "placing the b-roll source first then reusing it for a speaker slot keeps b-roll filled");
assert.equal(reuseReversed.zonesBySlot.guest.classList.contains("filled"), true,
  "the speaker slot also keeps the reused recording");

// 4. Two REQUIRED speaker slots sharing the same recording is still a real duplicate: the
// fix must not weaken the existing single-seat duplicate guard, only exempt b-roll.
const speakerDuplicate = buildController();
const sharedTake = video("shared-take.mp4");
speakerDuplicate.placeVideoFile(speakerDuplicate.zonesBySlot.host, sharedTake);
speakerDuplicate.placeVideoFile(speakerDuplicate.zonesBySlot.guest, sharedTake);
assert.equal(speakerDuplicate.zonesBySlot.host.classList.contains("filled"), false,
  "placing the same recording in a second speaker slot still moves it out of the first");

console.log("layout-first b-roll reuse: a speaker recording reused as b-roll keeps both placements and is never a blocking duplicate");
