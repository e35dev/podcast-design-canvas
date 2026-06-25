"use strict";

// Behavior test for real video placement on the preview example canvas (#1131): the canvas
// accepts actual uploaded/synced video files into its layout slots (by drop or by choosing a
// file), renders them, flags duplicate speaker recordings, gates Continue on valid media, and
// preserves placement until removed or reset. Runs the same inline canvas script the browser
// loads, against a DOM stub.
// Run with: `node preview/preview-canvas-video.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.match(/<script>\s*\(function \(\) \{([\s\S]*?)\}\(\)\);\s*<\/script>/)[1];

// The slots also expose a real video file input wired into placement.
assert.match(html, /class="slot-file" type="file" accept="video\/\*" data-file-input="host"/, "host slot accepts a real video file");
assert.match(html, /class="slot-file" type="file" accept="video\/\*" data-file-input="guest"/, "guest slot accepts a real video file");
assert.match(html, /class="slot-file" type="file" accept="video\/\*" data-file-input="broll"/, "b-roll slot accepts a real video file");

let nodeId = 0;

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.id = "";
    this.uid = ++nodeId;
    this.className = "";
    this.type = "";
    this.controls = false;
    this.muted = false;
    this.src = "";
    this.hidden = false;
    this.textContent = "";
    this.href = "";
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
    this.children = [];
    this.parentNode = null;
    this.files = null;
    this.focused = false;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "href") this.href = String(value);
  }
  removeAttribute(name) {
    delete this.attributes[name];
    if (name === "href") this.href = "";
  }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  appendChild(node) { node.parentNode = this; this.children.push(node); return node; }
  insertBefore(node, before) {
    node.parentNode = this;
    const index = this.children.indexOf(before);
    if (index === -1) this.children.unshift(node);
    else this.children.splice(index, 0, node);
    return node;
  }
  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }
  get firstChild() { return this.children[0] || null; }
  focus() { this.focused = true; }

  querySelector(selector) {
    if (selector[0] === ".") {
      const className = selector.slice(1);
      return descendants(this).find((node) => node.className.split(/\s+/).includes(className)) || null;
    }
    return null;
  }

  get classList() {
    const element = this;
    const split = () => element.className.split(/\s+/).filter(Boolean);
    return {
      add(name) { const next = new Set(split()); next.add(name); element.className = [...next].join(" "); },
      remove() { const drop = [...arguments]; element.className = split().filter((c) => drop.indexOf(c) === -1).join(" "); },
      contains(name) { return split().includes(name); },
    };
  }
}

function descendants(node) {
  return node.children.flatMap((child) => [child, ...descendants(child)]);
}

function makeZone(slot) {
  const zone = new Element("div");
  zone.className = `drop-zone ${slot}`;
  zone.dataset.slot = slot;
  const label = new Element("span");
  label.className = "slot-label";
  zone.appendChild(label);
  const input = new Element("input");
  input.className = "slot-file";
  input.type = "file";
  input.dataset.fileInput = slot;
  zone.appendChild(input);
  return zone;
}

const zones = ["host", "guest", "broll"].map(makeZone);
const inputs = zones.map((zone) => zone.children.find((child) => child.className === "slot-file"));
const chips = ["host", "guest", "broll"].map((track) => {
  const chip = new Element("span");
  chip.className = "drag-chip";
  chip.dataset.track = track;
  return chip;
});

const slotStatus = new Element("p"); slotStatus.id = "canvas-slot-status";
slotStatus.textContent = "0 of 2 required speaker videos ready. Optional b-roll can be added later.";
const resetButton = new Element("button"); resetButton.id = "canvas-reset";
const continueLink = new Element("a"); continueLink.id = "canvas-continue";
continueLink.attributes["aria-disabled"] = "true";
const continueNote = new Element("p"); continueNote.id = "canvas-continue-note";

const byId = {
  "canvas-slot-status": slotStatus,
  "canvas-reset": resetButton,
  "canvas-continue": continueLink,
  "canvas-continue-note": continueNote,
};

function zoneFor(slot) { return zones.find((zone) => zone.dataset.slot === slot); }

const docHandlers = {};
const document = {
  addEventListener(type, fn) { docHandlers[type] = fn; },
  getElementById(id) { return byId[id] || null; },
  createElement(tagName) { return new Element(tagName); },
  querySelector(selector) {
    let m = selector.match(/^\.drop-zone\[data-slot="([^"]+)"\]$/);
    if (m) return zoneFor(m[1]) || null;
    m = selector.match(/^\.drag-chip\[data-track="([^"]+)"\]$/);
    if (m) return chips.find((chip) => chip.dataset.track === m[1]) || null;
    return null;
  },
  querySelectorAll(selector) {
    if (selector === ".drag-chip") return chips;
    if (selector === ".drop-zone[data-slot]") return zones;
    if (selector === ".slot-file") return inputs;
    if (selector === ".drop-zone.filled") return zones.filter((zone) => zone.classList.contains("filled"));
    return [];
  },
};

const revoked = [];
const createdUrls = [];
const URL = {
  createObjectURL(file) { const url = `blob:${file.name}#${file.size || 0}`; createdUrls.push(url); return url; },
  revokeObjectURL(url) { revoked.push(url); },
};

vm.runInNewContext(script, { document, window: { URL }, URL });

function video(name, size, lastModified) {
  return { name, type: "video/mp4", size, lastModified };
}

function dropFile(slot, file) {
  zoneFor(slot).listeners.drop({ preventDefault() {}, dataTransfer: { files: [file], getData() { return ""; } } });
}

function chooseFile(slot, file) {
  const input = inputs.find((entry) => entry.dataset.fileInput === slot);
  input.files = [file];
  input.listeners.change();
}

// Distinct host and guest videos: each renders in its slot and Continue unlocks with the handoff.
dropFile("host", video("host.mp4", 1000, 11));
assert.ok(zoneFor("host").classList.contains("filled"), "dropping a real host video fills the host slot");
const hostVideo = zoneFor("host").querySelector(".placed-video");
assert.ok(hostVideo, "the host slot renders a placed video");
const hostVideoEl = hostVideo.children.find((child) => child.tagName === "video");
assert.ok(hostVideoEl, "the placed video renders an actual <video> element");
assert.ok(hostVideoEl.src, "the placed <video> points at the uploaded file via an object URL");
assert.equal(continueLink.attributes["aria-disabled"], "true", "Continue stays gated until both speaker videos are placed");

chooseFile("guest", video("guest.mp4", 2000, 22));
assert.ok(zoneFor("guest").classList.contains("filled"), "choosing a real guest video fills the guest slot");
assert.equal(continueLink.attributes["aria-disabled"], "false", "Continue unlocks once host and guest hold valid media");
assert.equal(
  continueLink.href,
  "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest",
  "Continue carries the speaker-roles handoff, selected layout, and required slots once media is valid",
);
assert.match(slotStatus.textContent, /Required speaker videos ready/, "status reports both required videos ready");
assert.equal(zoneFor("broll").classList.contains("filled"), false, "b-roll stays optional and empty");

// Placement is preserved (not lost) while adding optional b-roll media.
chooseFile("broll", video("intro.mp4", 3000, 33));
assert.ok(zoneFor("host").classList.contains("filled"), "host video is preserved when b-roll is added");
assert.ok(zoneFor("guest").classList.contains("filled"), "guest video is preserved when b-roll is added");
assert.equal(continueLink.attributes["aria-disabled"], "false", "Continue stays unlocked with optional b-roll added");
assert.match(slotStatus.textContent, /Optional b-roll is in place/, "status reflects optional b-roll placement");

// Duplicate guard: the same recording in both speaker slots is invalid and blocks Continue.
const sharedTake = video("riverside.mp4", 5000, 55);
dropFile("host", sharedTake);
dropFile("guest", sharedTake);
assert.equal(continueLink.attributes["aria-disabled"], "true", "the same recording in both speaker slots blocks Continue");
assert.match(slotStatus.textContent, /same video is in more than one speaker slot/i, "duplicate guidance is creator-facing");

// The side panel names the problem, but a creator scanning the canvas needs to see WHICH two
// slots are in conflict — both previously read the identical "Ready" badge with no way to tell
// them apart (#1131: clearly indicate duplicate slot assignments, not just describe them).
const hostIndicator = zoneFor("host").querySelector(".slot-state");
const guestIndicator = zoneFor("guest").querySelector(".slot-state");
assert.equal(hostIndicator.textContent, "Duplicate video", "the host slot badge names the duplicate, not a misleading Ready");
assert.ok(hostIndicator.classList.contains("is-duplicate"), "the host slot badge carries the duplicate state class");
assert.equal(guestIndicator.textContent, "Duplicate video", "the guest slot badge also names the duplicate");
assert.ok(guestIndicator.classList.contains("is-duplicate"), "the guest slot badge also carries the duplicate state class");

// Two separate recordings that merely share a filename are allowed.
dropFile("guest", video("riverside.mp4", 8000, 88));
assert.equal(continueLink.attributes["aria-disabled"], "false", "distinct recordings that share a name are not duplicates");
assert.equal(hostIndicator.textContent, "Ready", "resolving the conflict restores the host slot's Ready badge");
assert.ok(hostIndicator.classList.contains("is-ready"), "the host slot returns to the ready state class");
assert.equal(guestIndicator.textContent, "Ready", "the guest slot also returns to Ready once its recording is distinct");

// A non-video file is rejected with a creator-facing hint and does not fill the slot.
const beforeFill = zoneFor("host").classList.contains("filled");
zoneFor("host").listeners.drop({
  preventDefault() {},
  dataTransfer: { files: [{ name: "notes.txt", type: "text/plain" }], getData() { return ""; } },
});
assert.match(slotStatus.textContent, /video file/i, "a non-video file surfaces a creator-facing hint");
assert.equal(zoneFor("host").classList.contains("filled"), beforeFill, "a rejected file leaves the prior host placement intact");

// Per-slot remove clears just that slot, revokes its object URL, and re-gates Continue.
const guestRemove = zoneFor("guest").querySelector(".placed-remove");
assert.ok(guestRemove, "a placed video exposes a per-slot remove control");
guestRemove.listeners.click({ stopPropagation() {} });
assert.equal(zoneFor("guest").classList.contains("filled"), false, "removing the guest video clears just that slot");
assert.ok(zoneFor("host").classList.contains("filled"), "removing one slot leaves the other placement intact");
assert.equal(continueLink.attributes["aria-disabled"], "true", "Continue re-gates after a required video is removed");
assert.ok(revoked.length > 0, "removing a placed video revokes its object URL");

// Reset clears every placement and revokes all remaining object URLs.
resetButton.listeners.click();
assert.equal(zones.filter((zone) => zone.classList.contains("filled")).length, 0, "reset clears every placed video");
assert.equal(continueLink.attributes["aria-disabled"], "true", "reset re-gates Continue");
assert.equal(revoked.length, createdUrls.length, "reset revokes every object URL the canvas created");

// Off-slot / page-level drop guard: a real video released anywhere on the page (not on a slot)
// must NOT let the browser navigate away and discard placements — it is prevented and routed
// into the first open slot so a near-miss still places. (All slots are empty after the reset.)
assert.equal(typeof docHandlers.dragover, "function", "the canvas guards page-level dragover so drops are catchable");
assert.equal(typeof docHandlers.drop, "function", "the canvas guards page-level drop");
let dragPrevented = false;
docHandlers.dragover({ preventDefault() { dragPrevented = true; } });
assert.equal(dragPrevented, true, "page-level dragover is prevented so the drop is catchable");

let navPrevented = false;
docHandlers.drop({
  preventDefault() { navPrevented = true; },
  dataTransfer: { files: [video("off-slot.mp4", 4242, 99)], getData() { return ""; } },
});
assert.equal(navPrevented, true, "an off-slot page drop is prevented, so the browser never navigates away and loses placements");
assert.ok(zoneFor("host").classList.contains("filled"), "an off-slot real video still routes into the first open slot");

// With every visible slot filled, an off-slot drop is still prevented (no navigation) and the
// creator is told how to make room rather than the file silently vanishing.
dropFile("guest", video("g-fill.mp4", 51, 51));
dropFile("broll", video("b-fill.mp4", 61, 61));
let fullNavPrevented = false;
docHandlers.drop({
  preventDefault() { fullNavPrevented = true; },
  dataTransfer: { files: [video("extra.mp4", 71, 71)], getData() { return ""; } },
});
assert.equal(fullNavPrevented, true, "a page drop on a full layout is still prevented");
assert.match(slotStatus.textContent, /filled|make room/i, "a page drop with no open slot tells the creator to make room");

console.log("preview canvas video: real media placement, duplicate guard, preservation, cleanup, and off-slot drop guard verified");
