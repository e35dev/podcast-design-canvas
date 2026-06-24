"use strict";

// Behavior tests for the layout-first landing (#1026).
// Run with: `node preview/layout-first.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { createLayoutFirstController, isVideoFile } = require("./layout-first.js");
const layoutHandoff = require("./layout-handoff.js");

const html = fs.readFileSync(path.join(__dirname, "layout-first.html"), "utf8");
const app = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const root = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

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
    this.href = options.href || "";
  }

  focus() { lastFocused = this; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) {
    delete this.attributes[name];
    if (name === "href") this.href = "";
  }
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
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode.firstChild = this.parentNode.children[0] || null;
  }
  querySelector(selector) {
    return findAll(this, selector)[0] || null;
  }
}

function findAll(rootNode, selector) {
  const nodes = [];
  function visit(node) {
    if (matches(node, selector)) nodes.push(node);
    node.children.forEach(visit);
  }
  visit(rootNode);
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
  const strong = new Element("strong", { dataset: { layoutLabel: "" }, textContent: label });
  button.appendChild(strong);
  return button;
}

function makeZone(slot, className = "drop-zone") {
  const zone = new Element("div", { className, dataset: { slot } });
  const input = new Element("input", { dataset: { fileInput: slot } });
  zone.appendChild(input);
  return zone;
}

const elementsById = {
  "layout-scene-label": new Element("span", { textContent: "Interview scene" }),
  "layout-runtime-label": new Element("span", { textContent: "Host + guest" }),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": new Element("div", { hidden: true }),
  "layout-error": new Element("p"),
};

const layoutButtons = [
  makeLayoutButton("interview", "Using interview"),
  makeLayoutButton("solo", "Use solo"),
  makeLayoutButton("panel", "Use panel"),
];
const zones = [
  makeZone("host"),
  makeZone("guest"),
  makeZone("guest-b", "drop-zone is-hidden"),
  makeZone("broll"),
];

const documentStub = {
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return elementsById[id] || null; },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return layoutButtons;
    if (selector === ".drop-zone[data-slot]") return zones;
    return [];
  },
};

const createdUrls = [];
const revokedUrls = [];
const urlApi = {
  createObjectURL(file) {
    const url = `blob:${file.name}`;
    createdUrls.push(url);
    return url;
  },
  revokeObjectURL(url) {
    revokedUrls.push(url);
  },
};
const stored = {};
const storage = {
  setItem(key, value) {
    stored[key] = value;
  },
  getItem(key) {
    return stored[key] || null;
  },
  removeItem(key) {
    delete stored[key];
  },
};

function video(name) {
  return { name, type: "video/mp4" };
}

const controller = createLayoutFirstController(documentStub, { URL: urlApi, handoff: layoutHandoff, storage });
elementsById["layout-continue"].dataset.readyHref = "./app.html#speaker-role-mapping?path=episode";

assert.match(html, /Start with a podcast layout/, "layout-first landing opens with layout selection");
assert.match(html, /data-layout="interview"/, "layout-first offers an interview layout");
assert.match(html, /data-layout="solo"/, "layout-first offers a solo layout");
assert.match(html, /data-layout="panel"/, "layout-first offers a panel layout");
assert.match(html, /data-slot="broll" data-optional="true"/, "layout-first marks b-roll as optional");
assert.match(html, /Continue to production workspace/, "layout-first has a production workspace handoff");
assert.match(html, /data-ready-href=".\/app.html#speaker-role-mapping\?path=episode"/, "layout-first stores the ready handoff target separately");
assert.doesNotMatch(html, /id="layout-continue"[^>]* href=/, "disabled Continue has no initial href");
assert.match(html, /type="file" accept="video\/\*"/, "layout-first supports choosing video files");
assert.match(html, /script src=".\/layout-handoff.js"/, "layout-first loads shared handoff state");
assert.match(html, /script src=".\/layout-first.js"/, "layout-first uses source-backed behavior");
assert.ok(app.includes("layout-first.html"), "preview app links back to the layout-first start");
assert.ok(root.includes("preview/layout-first.html"), "root catalog leads with the layout-first landing");
assert.equal(isVideoFile(video("host.mp4")), true, "video files are accepted");
assert.equal(isVideoFile({ name: "notes.txt", type: "text/plain" }), false, "non-video files are rejected");

assert.equal(controller.requiredSlots().length, 2, "interview requires host and guest only");
assert.match(
  elementsById["layout-slot-status"].textContent,
  /Still need the Host and Guest videos/,
  "readiness copy names every missing required speaker video before any placement",
);
assert.equal(elementsById["layout-continue"].href, "", "disabled Continue starts without a navigation target");
let preventedDisabledContinue = false;
elementsById["layout-continue"].listeners.click({
  preventDefault() {
    preventedDisabledContinue = true;
  },
});
assert.equal(preventedDisabledContinue, true, "disabled Continue prevents activation");
controller.placeVideoFile(controller.zonesBySlot.host, video("host.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "interview does not continue after host alone",
);
assert.match(
  elementsById["layout-slot-status"].textContent,
  /Still need the Guest video\./,
  "readiness copy names the one remaining required speaker video",
);
controller.placeVideoFile(controller.zonesBySlot.guest, video("guest.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "interview continues after host and guest without b-roll",
);
assert.equal(
  elementsById["layout-continue"].href,
  "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest",
  "enabled Continue carries the selected layout and placed slots into the workspace target",
);
assert.equal(
  JSON.parse(stored[layoutHandoff.STORAGE_KEY]).layout,
  "interview",
  "enabled Continue stores the layout handoff for the role-mapping workspace",
);
assert.match(
  elementsById["layout-slot-status"].textContent,
  /Optional b-roll can be added later/,
  "readiness copy says b-roll is optional",
);
assert.equal(controller.zonesBySlot.broll.classList.contains("filled"), false, "b-roll remains empty and optional");

controller.placeVideoFile(controller.zonesBySlot.broll, video("broll.mp4"));
assert.match(
  elementsById["layout-slot-status"].textContent,
  /Optional b-roll is in place\./,
  "readiness copy acknowledges b-roll when the optional slot is filled",
);
controller.removeVideo(controller.zonesBySlot.broll);
assert.match(
  elementsById["layout-slot-status"].textContent,
  /Optional b-roll can be added later\./,
  "readiness copy invites b-roll again after the optional slot is cleared",
);

controller.applyLayout("panel");
assert.equal(
  controller.zonesBySlot.host.classList.contains("filled"),
  true,
  "switching layouts keeps the host video when that slot still exists",
);
assert.equal(
  controller.zonesBySlot.guest.classList.contains("filled"),
  true,
  "switching layouts keeps the guest video when that slot still exists",
);
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "switching to panel re-gates continue until the new required guest slot is filled",
);
controller.placeVideoFile(controller.zonesBySlot["guest-b"], video("panel-guest-b.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "panel continues once the newly required guest slot is filled",
);
controller.applyLayout("solo");
assert.equal(
  controller.zonesBySlot.host.classList.contains("filled"),
  true,
  "switching to solo keeps the host video in the shared slot",
);
assert.equal(
  controller.zonesBySlot.guest.classList.contains("filled"),
  false,
  "switching to solo clears the guest video because that slot is no longer visible",
);
assert.ok(
  revokedUrls.includes("blob:guest.mp4"),
  "switching away from a hidden slot revokes that slot's object URL",
);
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "solo stays ready when its single required host slot was already placed",
);

// Per-slot remove: a creator can clear one wrong video without resetting the layout.
const jsSource = fs.readFileSync(path.join(__dirname, "layout-first.js"), "utf8");
assert.match(jsSource, /placed-remove/, "placed videos expose a per-slot remove control");
assert.match(jsSource, /aria-label", "Remove the/, "the remove control is labelled per slot");

controller.applyLayout("interview");
controller.placeVideoFile(controller.zonesBySlot.guest, video("guest.mp4"));
controller.removeVideo(controller.zonesBySlot.guest);
assert.equal(
  controller.zonesBySlot.guest.classList.contains("filled"),
  false,
  "removing a slot clears just that video",
);
assert.equal(
  controller.zonesBySlot.host.classList.contains("filled"),
  true,
  "removing one slot leaves the other placed videos intact",
);
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "Continue re-gates after a required video is removed",
);
assert.ok(revokedUrls.includes("blob:guest.mp4"), "removing a slot revokes its object URL");
assert.equal(stored[layoutHandoff.STORAGE_KEY], undefined, "removing a required video clears stale layout handoff storage");
// Re-filling the cleared slot restores readiness.
controller.placeVideoFile(controller.zonesBySlot.guest, video("guest.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "re-filling the removed slot restores the continue handoff",
);

controller.applyLayout("panel");
assert.equal(controller.requiredSlots().length, 3, "panel requires host and two guest videos");
controller.placeVideoFile(controller.zonesBySlot.host, video("panel-host.mp4"));
controller.placeVideoFile(controller.zonesBySlot.guest, video("panel-guest-a.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "panel does not continue until the second guest is filled",
);
controller.placeVideoFile(controller.zonesBySlot["guest-b"], video("panel-guest-b.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "panel continues after all required speaker videos are filled",
);

controller.placeVideoFile(controller.zonesBySlot.host, { name: "notes.txt", type: "text/plain" });
assert.equal(elementsById["layout-error-card"].hidden, false, "non-video drops show a visible error");
assert.match(elementsById["layout-error"].textContent, /video/, "non-video error stays creator-facing");
elementsById["layout-reset"].listeners.click();
assert.equal(controller.filledRequiredSlots().length, 0, "reset clears filled required slots");
assert.equal(stored[layoutHandoff.STORAGE_KEY], undefined, "reset clears stale layout handoff storage");
assert.ok(revokedUrls.length > 0 && createdUrls.length > 0, "reset revokes created object URLs");

// Switching layout preserves videos placed in slots that stay visible (#1026), and only
// clears slots that leave the new layout. Uses a fresh controller to isolate state.
const preserveZones = [
  makeZone("host"),
  makeZone("guest"),
  makeZone("guest-b", "drop-zone is-hidden"),
  makeZone("broll"),
];
const preserveButtons = [
  makeLayoutButton("interview", "Using interview"),
  makeLayoutButton("solo", "Use solo"),
  makeLayoutButton("panel", "Use panel"),
];
const preserveById = {
  "layout-scene-label": new Element("span"),
  "layout-runtime-label": new Element("span"),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": new Element("div", { hidden: true }),
  "layout-error": new Element("p"),
};
const preserveDoc = {
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return preserveById[id] || null; },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return preserveButtons;
    if (selector === ".drop-zone[data-slot]") return preserveZones;
    return [];
  },
};
const preserve = createLayoutFirstController(preserveDoc, { URL: urlApi });
preserve.placeVideoFile(preserve.zonesBySlot.host, video("p-host.mp4"));
preserve.placeVideoFile(preserve.zonesBySlot.guest, video("p-guest.mp4"));
preserve.applyLayout("panel");
assert.equal(preserve.zonesBySlot.host.classList.contains("filled"), true, "switching interview->panel keeps the placed host video");
assert.equal(preserve.zonesBySlot.guest.classList.contains("filled"), true, "switching interview->panel keeps the placed guest video");
assert.equal(preserve.zonesBySlot["guest-b"].classList.contains("filled"), false, "the newly revealed panel slot starts empty");
preserve.applyLayout("solo");
assert.equal(preserve.zonesBySlot.host.classList.contains("filled"), true, "switching to solo keeps the still-visible host video");
assert.equal(preserve.zonesBySlot.guest.classList.contains("filled"), false, "a slot that leaves the layout is cleared");
assert.ok(revokedUrls.includes("blob:p-guest.mp4"), "leaving a slot revokes its object URL");

// Source movement is keyed on file identity (name + size + modified time), not display
// name. The same recording moves out of its old slot before filling the new one, while
// two separate recordings that merely share a filename (riverside-track.mp4) are allowed.
controller.resetVideos();
controller.applyLayout("interview");
const sharedTake = { name: "riverside-track.mp4", type: "video/mp4", size: 12582912, lastModified: 1717000000000 };
controller.placeVideoFile(controller.zonesBySlot.host, sharedTake);
controller.placeVideoFile(controller.zonesBySlot.guest, sharedTake);
assert.deepEqual(
  controller.duplicateFileNames(),
  [],
  "moving the same recording prevents duplicate speaker-slot identity",
);
assert.equal(
  controller.zonesBySlot.host.classList.contains("filled"),
  false,
  "placing the same source in a new slot clears the previous slot",
);
assert.equal(
  controller.zonesBySlot.guest.classList.contains("filled"),
  true,
  "placing the same source fills the new target slot",
);
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "Continue re-gates because moving the source leaves the host slot empty",
);
assert.match(
  elementsById["layout-slot-status"].textContent,
  /Still need the Host video/i,
  "move guidance returns to the missing-slot readiness copy",
);
const separateGuestTake = { name: "riverside-track.mp4", type: "video/mp4", size: 20447232, lastModified: 1717000900000 };
controller.placeVideoFile(controller.zonesBySlot.host, sharedTake);
controller.placeVideoFile(controller.zonesBySlot.guest, separateGuestTake);
assert.deepEqual(
  controller.duplicateFileNames(),
  [],
  "two separate recordings that share a filename are not treated as duplicates",
);
assert.equal(
  controller.zonesBySlot.host.classList.contains("filled"),
  true,
  "same filename with different source metadata does not clear the host slot",
);
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "Continue is restored once each speaker has a separate recording",
);

// Removing a placed video returns keyboard focus to that slot's file input, so a
// keyboard/screen-reader user is not stranded on the page body after the Remove button
// (which lived inside the cleared video) disappears. Fresh controller to isolate state.
const focusZones = [
  makeZone("host"),
  makeZone("guest"),
  makeZone("guest-b", "drop-zone is-hidden"),
  makeZone("broll"),
];
const focusButtons = [
  makeLayoutButton("interview", "Using interview"),
  makeLayoutButton("solo", "Use solo"),
  makeLayoutButton("panel", "Use panel"),
];
const focusById = {
  "layout-scene-label": new Element("span"),
  "layout-runtime-label": new Element("span"),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": new Element("div", { hidden: true }),
  "layout-error": new Element("p"),
};
const focusDoc = {
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return focusById[id] || null; },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return focusButtons;
    if (selector === ".drop-zone[data-slot]") return focusZones;
    return [];
  },
};
const focusController = createLayoutFirstController(focusDoc, { URL: urlApi });
focusController.placeVideoFile(focusController.zonesBySlot.guest, video("guest.mp4"));
lastFocused = null;
focusController.removeVideo(focusController.zonesBySlot.guest);
assert.strictEqual(
  lastFocused,
  focusController.zonesBySlot.guest.querySelector("[data-file-input]"),
  "removing a video returns focus to that slot's file input",
);
assert.strictEqual(
  focusController.zonesBySlot.guest.querySelector(".placed-video"),
  null,
  "the removed video (with its focused Remove button) is gone from the slot",
);

// A 0-byte video (a failed/aborted export) is rejected: it never fills a slot, surfaces a
// clear error, and keeps Continue gated — while a normal video still places. Fresh controller.
const emptyZones = [
  makeZone("host"),
  makeZone("guest"),
  makeZone("guest-b", "drop-zone is-hidden"),
  makeZone("broll"),
];
const emptyButtons = [
  makeLayoutButton("interview", "Using interview"),
  makeLayoutButton("solo", "Use solo"),
  makeLayoutButton("panel", "Use panel"),
];
const emptyById = {
  "layout-scene-label": new Element("span"),
  "layout-runtime-label": new Element("span"),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": new Element("div", { hidden: true }),
  "layout-error": new Element("p"),
};
const emptyDoc = {
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return emptyById[id] || null; },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return emptyButtons;
    if (selector === ".drop-zone[data-slot]") return emptyZones;
    return [];
  },
};
const emptyCtl = createLayoutFirstController(emptyDoc, { URL: urlApi });
emptyCtl.placeVideoFile(emptyCtl.zonesBySlot.host, { name: "aborted.mp4", type: "video/mp4", size: 0 });
assert.strictEqual(
  emptyCtl.zonesBySlot.host.classList.contains("filled"),
  false,
  "a 0-byte video does not fill the slot",
);
assert.strictEqual(emptyById["layout-error-card"].hidden, false, "a 0-byte video surfaces a visible error");
assert.match(emptyById["layout-error"].textContent, /empty/i, "the empty-file error is creator-facing");
assert.strictEqual(
  emptyById["layout-continue"].attributes["aria-disabled"],
  "true",
  "a 0-byte video keeps Continue gated",
);
emptyCtl.placeVideoFile(emptyCtl.zonesBySlot.host, { name: "host.mp4", type: "video/mp4", size: 2048 });
assert.strictEqual(
  emptyCtl.zonesBySlot.host.classList.contains("filled"),
  true,
  "a normal video still places after an empty one was rejected",
);
assert.strictEqual(emptyById["layout-error-card"].hidden, true, "placing a valid video clears the empty-file error");

// Per-slot status badges (#1131): each visible slot shows its own assignment state on the
// canvas — required-empty "Needs video", filled "Ready", optional "Optional", hidden none —
// so a creator sees which required videos are still missing at the slot, not only in the
// side-panel summary. Fresh controller to isolate state.
const stateZones = [
  makeZone("host"),
  makeZone("guest"),
  makeZone("guest-b", "drop-zone is-hidden"),
  makeZone("broll"),
];
const stateButtons = [
  makeLayoutButton("interview", "Using interview"),
  makeLayoutButton("solo", "Use solo"),
  makeLayoutButton("panel", "Use panel"),
];
const stateById = {
  "layout-scene-label": new Element("span"),
  "layout-runtime-label": new Element("span"),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": new Element("div", { hidden: true }),
  "layout-error": new Element("p"),
};
const stateDoc = {
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return stateById[id] || null; },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return stateButtons;
    if (selector === ".drop-zone[data-slot]") return stateZones;
    return [];
  },
};
const stateCtl = createLayoutFirstController(stateDoc, { URL: urlApi });
const slotState = (slot) => stateCtl.slotIndicators[slot];

// Interview start: required slots flag missing, optional flags optional, hidden slot is blank.
assert.equal(slotState("host").textContent, "Needs video", "an empty required host slot flags that it needs a video");
assert.ok(slotState("host").classList.contains("is-missing"), "the missing host slot carries the missing state class");
assert.equal(slotState("guest").textContent, "Needs video", "an empty required guest slot flags that it needs a video");
assert.equal(slotState("broll").textContent, "Optional", "the optional b-roll slot is marked optional, not missing");
assert.equal(slotState("guest-b").hidden, true, "a hidden slot shows no status badge");

// Placing a video flips that slot to ready without touching the others.
stateCtl.placeVideoFile(stateCtl.zonesBySlot.host, video("host.mp4"));
assert.equal(slotState("host").textContent, "Ready", "a filled slot reads Ready");
assert.ok(slotState("host").classList.contains("is-ready"), "the filled slot carries the ready state class");
assert.equal(slotState("guest").textContent, "Needs video", "the still-empty required slot keeps flagging missing");

// Removing the video returns the slot to its missing state.
stateCtl.removeVideo(stateCtl.zonesBySlot.host);
assert.equal(slotState("host").textContent, "Needs video", "removing a video returns the slot to needing one");

// Switching to panel reveals the second guest slot, which starts as missing.
stateCtl.applyLayout("panel");
assert.equal(slotState("guest-b").hidden, false, "the revealed panel slot now shows a status badge");
assert.equal(slotState("guest-b").textContent, "Needs video", "the newly revealed required slot flags missing");

// Switching to solo hides the guest slots again — their badges go blank.
stateCtl.applyLayout("solo");
assert.equal(slotState("guest").hidden, true, "a slot hidden by the solo layout shows no status badge");
assert.equal(slotState("host").textContent, "Needs video", "solo's single required slot still flags missing when empty");

assert.match(html, /\.slot-state/, "layout-first styles the per-slot status badge");

console.log("layout-first landing: required speaker readiness, optional b-roll, per-slot status, handoff, and layout-switch preservation verified");
