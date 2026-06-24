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
assert.match(html, /id="layout-error-card"[^>]*role="alert"/, "placement error card has alert role so screen readers announce rejections");
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

// Start the panel scenario from a clean slate (earlier switches set videos aside, which
// now persist across compatible layouts — see the dedicated preserve test below).
controller.resetVideos();
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

// Switching back to a compatible layout restores a video that was set aside, so toggling
// layouts never silently discards a creator's placement (#1026 / #1131).
preserve.applyLayout("interview");
assert.equal(
  preserve.zonesBySlot.guest.classList.contains("filled"),
  true,
  "switching back to a compatible layout restores the set-aside guest video",
);
assert.equal(
  preserve.zonesBySlot.guest.dataset.fileName,
  "p-guest.mp4",
  "the restored slot holds the original recording",
);
assert.ok(
  createdUrls.filter((url) => url === "blob:p-guest.mp4").length >= 2,
  "restoring a set-aside video recreates its object URL",
);

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

// Each slot's status badge is tied to its file control via aria-describedby, so a
// screen-reader user hears the slot's current state when they focus "Choose <slot> video",
// not only sighted creators who can read the badge on the canvas.
["host", "guest", "guest-b", "broll"].forEach((slot) => {
  assert.equal(slotState(slot).id, `slot-state-${slot}`, `the ${slot} status badge has a stable id`);
  const slotInput = stateCtl.zonesBySlot[slot].querySelector("[data-file-input]");
  assert.equal(
    slotInput.getAttribute("aria-describedby"),
    `slot-state-${slot}`,
    `the ${slot} file control is described by its status badge`,
  );
});

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

// A video set aside when its slot is hidden must NOT restore as a duplicate after the same
// source is reused in another slot. Reusing the source drops it from the set-aside cache, so
// switching back leaves the hidden slot empty (source identity holds across switches). Fresh.
const reuseZones = [
  makeZone("host"),
  makeZone("guest"),
  makeZone("guest-b", "drop-zone is-hidden"),
  makeZone("broll"),
];
const reuseButtons = [
  makeLayoutButton("interview", "Using interview"),
  makeLayoutButton("solo", "Use solo"),
  makeLayoutButton("panel", "Use panel"),
];
const reuseById = {
  "layout-scene-label": new Element("span"),
  "layout-runtime-label": new Element("span"),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": new Element("div", { hidden: true }),
  "layout-error": new Element("p"),
};
const reuseDoc = {
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return reuseById[id] || null; },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return reuseButtons;
    if (selector === ".drop-zone[data-slot]") return reuseZones;
    return [];
  },
};
const reuse = createLayoutFirstController(reuseDoc, { URL: urlApi });
const reusedSource = { name: "shared.mp4", type: "video/mp4", size: 4096, lastModified: 1717100000000 };
reuse.applyLayout("panel");
reuse.placeVideoFile(reuse.zonesBySlot["guest-b"], reusedSource);
assert.equal(reuse.zonesBySlot["guest-b"].classList.contains("filled"), true, "the source is placed in guest-b");
reuse.applyLayout("interview"); // guest-b leaves the layout and is set aside
assert.equal(reuse.zonesBySlot["guest-b"].classList.contains("filled"), false, "guest-b is hidden after switching to interview");
reuse.placeVideoFile(reuse.zonesBySlot.host, reusedSource); // the same source is reused in a visible slot
assert.equal(reuse.zonesBySlot.host.classList.contains("filled"), true, "the source is now placed in host");
reuse.applyLayout("panel"); // guest-b returns
assert.equal(
  reuse.zonesBySlot["guest-b"].classList.contains("filled"),
  false,
  "a set-aside source does not restore as a duplicate after it was reused in another slot",
);
assert.equal(reuse.zonesBySlot.host.classList.contains("filled"), true, "the reused source stays in its new slot");
assert.deepEqual(reuse.duplicateFileNames(), [], "no duplicate recording across slots after switching back");

// Multi-file placement: dropping several recordings at once fills the slot they land on
// and spills the rest into the next empty visible slots in order, so a creator can drop
// all their speaker videos together instead of one slot at a time (#1026).
controller.resetVideos();
controller.applyLayout("panel");
controller.placeVideoFiles(controller.zonesBySlot.host, [
  { name: "panel-host.mp4", type: "video/mp4", size: 11, lastModified: 101 },
  { name: "panel-guest-a.mp4", type: "video/mp4", size: 22, lastModified: 202 },
  { name: "panel-guest-b.mp4", type: "video/mp4", size: 33, lastModified: 303 },
]);
assert.equal(controller.zonesBySlot.host.classList.contains("filled"), true, "the dropped slot takes the first recording");
assert.equal(controller.zonesBySlot.guest.classList.contains("filled"), true, "the next empty required slot takes the second recording");
assert.equal(controller.zonesBySlot["guest-b"].classList.contains("filled"), true, "the following empty required slot takes the third recording");
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "panel is ready to continue after one multi-file drop fills every required slot",
);

// A single-file drop is unchanged: only the slot it lands on is filled.
controller.resetVideos();
controller.applyLayout("interview");
controller.placeVideoFiles(controller.zonesBySlot.host, [
  { name: "just-host.mp4", type: "video/mp4", size: 9, lastModified: 9 },
]);
assert.equal(controller.zonesBySlot.host.classList.contains("filled"), true, "a single dropped file fills its slot");
assert.equal(controller.zonesBySlot.guest.classList.contains("filled"), false, "a single dropped file does not touch other slots");

// Overflow: dropping more videos than there are open slots fills what it can (host, guest,
// optional b-roll = 3 visible) and tells the creator the surplus wasn't placed, instead of
// silently dropping the extra files.
controller.resetVideos();
controller.applyLayout("interview");
controller.placeVideoFiles(controller.zonesBySlot.host, [
  { name: "a.mp4", type: "video/mp4", size: 1, lastModified: 1 },
  { name: "b.mp4", type: "video/mp4", size: 2, lastModified: 2 },
  { name: "c.mp4", type: "video/mp4", size: 3, lastModified: 3 },
  { name: "d.mp4", type: "video/mp4", size: 4, lastModified: 4 },
]);
assert.equal(elementsById["layout-error-card"].hidden, false, "an overflowing multi-file drop surfaces a message");
assert.match(
  elementsById["layout-error"].textContent,
  /1 extra video wasn't placed/,
  "the overflow message names how many videos could not be placed",
);
assert.equal(controller.zonesBySlot.broll.classList.contains("filled"), true, "the drop still fills every available slot before overflowing");

// Non-video files in a multi-file drop are placed-around, not silently dropped: the videos land
// and the creator is told the non-video was skipped (drag-and-drop bypasses the input's accept
// filter, so a stray file can ride along).
controller.resetVideos();
controller.applyLayout("interview");
controller.placeVideoFiles(controller.zonesBySlot.host, [
  { name: "host.mp4", type: "video/mp4", size: 1, lastModified: 1 },
  { name: "notes.txt", type: "text/plain", size: 2, lastModified: 2 },
  { name: "guest.mp4", type: "video/mp4", size: 3, lastModified: 3 },
]);
assert.equal(controller.zonesBySlot.host.classList.contains("filled"), true, "the first video fills the target slot");
assert.equal(controller.zonesBySlot.guest.classList.contains("filled"), true, "the other video still spills past the skipped non-video");
assert.equal(elementsById["layout-error-card"].hidden, false, "a skipped non-video in the drop surfaces a message");
assert.match(
  elementsById["layout-error"].textContent,
  /1 file in that drop wasn't a video, so it was skipped/,
  "the message names how many non-video files were skipped",
);

// Drop anywhere on the layout: recordings dropped on the canvas (not aimed at a specific
// slot) route to the next empty slot, so a creator can drop their files onto the layout
// and let the product place them in order (#1026).
assert.match(html, /id="layout-canvas"/, "the layout canvas is present as a drop target");
assert.ok(jsSource.includes('getElementById("layout-canvas")'), "the controller wires a layout-wide drop target");
assert.ok(jsSource.includes("event.stopPropagation()"), "a drop on a specific slot does not also bubble to the layout-wide handler");

controller.resetVideos();
controller.applyLayout("interview");
controller.placeDroppedFiles([
  { name: "first.mp4", type: "video/mp4", size: 1, lastModified: 1 },
  { name: "second.mp4", type: "video/mp4", size: 2, lastModified: 2 },
]);
assert.equal(controller.zonesBySlot.host.classList.contains("filled"), true, "a layout drop fills the first empty slot");
assert.equal(controller.zonesBySlot.guest.classList.contains("filled"), true, "extra layout-dropped videos fill the next empty slots");

controller.resetVideos();
controller.applyLayout("interview");
controller.placeVideoFile(controller.zonesBySlot.host, { name: "host.mp4", type: "video/mp4", size: 7, lastModified: 7 });
controller.placeDroppedFiles([{ name: "guest.mp4", type: "video/mp4", size: 8, lastModified: 8 }]);
assert.equal(controller.zonesBySlot.guest.classList.contains("filled"), true, "drop-anywhere targets the next empty slot when the first is taken");
assert.equal(controller.zonesBySlot.host.dataset.fileName, "host.mp4", "drop-anywhere leaves an already-filled slot untouched");

// A canvas-wide drop when every visible slot is already filled should report there's no
// room instead of silently swallowing the file (#1026).
controller.resetVideos();
controller.applyLayout("interview");
controller.placeVideoFile(controller.zonesBySlot.host, { name: "h.mp4", type: "video/mp4", size: 11, lastModified: 11 });
controller.placeVideoFile(controller.zonesBySlot.guest, { name: "g.mp4", type: "video/mp4", size: 12, lastModified: 12 });
controller.placeVideoFile(controller.zonesBySlot.broll, { name: "b.mp4", type: "video/mp4", size: 13, lastModified: 13 });
controller.placeDroppedFiles([{ name: "extra.mp4", type: "video/mp4", size: 14, lastModified: 14 }]);
assert.match(
  elementsById["layout-error"].textContent,
  /no open slot left/i,
  "dropping on a full layout reports there's no room instead of silently ignoring the drop",
);
assert.equal(elementsById["layout-error-card"].hidden, false, "the no-room message is shown to the creator");
assert.equal(controller.zonesBySlot.host.dataset.fileName, "h.mp4", "a full-layout drop leaves existing placements untouched");

// Drag-over highlight stays steady while the cursor crosses the slot's contents. dragenter and
// dragleave fire for each child (label, badge, input), so the highlight is tracked by enter/
// leave depth rather than toggled on every crossing — which would flicker — and a drop clears it.
controller.resetVideos();
const dragZone = controller.zonesBySlot.host;
dragZone.listeners.dragenter({ preventDefault() {} });
assert.equal(dragZone.classList.contains("drag-over"), true, "entering a slot highlights it as a drop target");
dragZone.listeners.dragenter({ preventDefault() {} }); // cursor crosses into a child element
dragZone.listeners.dragleave({ preventDefault() {} }); // ...and back out of that child
assert.equal(dragZone.classList.contains("drag-over"), true, "crossing the slot's contents keeps the highlight");
dragZone.listeners.dragleave({ preventDefault() {} }); // cursor truly leaves the slot
assert.equal(dragZone.classList.contains("drag-over"), false, "leaving the slot clears the highlight");
dragZone.listeners.dragenter({ preventDefault() {} });
dragZone.listeners.drop({ preventDefault() {}, stopPropagation() {}, dataTransfer: { files: [] } });
assert.equal(dragZone.classList.contains("drag-over"), false, "a drop clears the highlight even mid-drag");

console.log("layout-first landing: required speaker readiness, optional b-roll, per-slot status, handoff, and layout-switch preservation verified");
