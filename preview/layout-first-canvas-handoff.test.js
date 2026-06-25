"use strict";

// Guards the layout-first example canvas handoff: the creator can continue into
// speaker roles after placing the required host and guest tracks, while b-roll stays optional.
// Run with: `node preview/layout-first-canvas-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

class Element {
  constructor(tagName, id = "", className = "") {
    this.tagName = tagName;
    this.id = id;
    this.className = className;
    this.children = [];
    this.parentNode = null;
    this.attributes = {};
    this.listeners = {};
    this.dataset = {};
    this.textContent = "";
    this.href = "";
    this.focused = false;
    this.hidden = false;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "href") {
      this.href = String(value);
    }
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === "href") {
      this.href = "";
    }
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  insertBefore(node, before) {
    node.parentNode = this;
    const index = this.children.indexOf(before);
    if (index === -1) {
      this.children.unshift(node);
    } else {
      this.children.splice(index, 0, node);
    }
    return node;
  }

  appendChild(node) {
    node.parentNode = this;
    this.children.push(node);
    return node;
  }

  remove() {
    if (!this.parentNode) {
      return;
    }
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  querySelector(selector) {
    const chipMatch = selector.match(/^\.drag-chip\[data-track="([^"]+)"\]$/);
    if (chipMatch) {
      return chips.find((chip) => chip.dataset.track === chipMatch[1]) || null;
    }
    if (selector === ".placed-track") {
      return this.children.find((child) => child.className === "placed-track") || null;
    }
    if (selector === ".placed-remove") {
      return this.children.find((child) => child.className === "placed-remove") || null;
    }
    if (selector === ".slot-state") {
      return this.children.find((child) => child.className.split(/\s+/).includes("slot-state")) || null;
    }
    if (selector === "[data-layout-label]") {
      return this.children.find((child) => Object.prototype.hasOwnProperty.call(child.dataset, "layoutLabel")) || null;
    }
    const slotMatch = selector.match(/^\.drop-zone\[data-slot="([^"]+)"\]$/);
    if (slotMatch) {
      return zones.find((zone) => zone.dataset.slot === slotMatch[1]) || null;
    }
    return null;
  }

  click() {
    if (this.listeners.click) {
      this.listeners.click({ target: this });
    }
  }

  focus() {
    chips.forEach((chip) => {
      chip.focused = false;
    });
    this.focused = true;
  }

  get classList() {
    const element = this;
    const split = () => element.className.split(/\s+/).filter(Boolean);
    return {
      add(name) {
        const next = new Set(split());
        next.add(name);
        element.className = [...next].join(" ");
      },
      remove(name) {
        element.className = split().filter((entry) => entry !== name).join(" ");
      },
      contains(name) {
        return split().includes(name);
      },
      toggle(name, force) {
        const shouldAdd = force === undefined ? !split().includes(name) : Boolean(force);
        if (shouldAdd) {
          this.add(name);
        } else {
          this.remove(name);
        }
        return shouldAdd;
      },
    };
  }
}

const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const script = html.match(/<script>\s*\(function \(\) \{([\s\S]*?)\}\(\)\);\s*<\/script>/)[1];

function makeLayoutButton(layout, label) {
  const button = new Element("button", "", "layout-choice");
  button.dataset.layout = layout;
  const strong = new Element("strong");
  strong.dataset.layoutLabel = "";
  strong.textContent = label;
  button.children.push(strong);
  return button;
}

const layoutButtons = [
  makeLayoutButton("interview", "Using interview split"),
  makeLayoutButton("solo", "Use solo spotlight"),
  makeLayoutButton("panel", "Use panel grid"),
];

const chips = ["host", "guest", "guest-b", "broll"].map((track) => {
  const chip = new Element("span", "", "drag-chip");
  chip.dataset.track = track;
  return chip;
});

const zones = ["host", "guest", "guest-b", "broll"].map((slot) => {
  const zone = new Element("div", "", `drop-zone ${slot}${slot === "guest-b" ? " is-hidden" : ""}`);
  zone.dataset.slot = slot;
  const label = new Element("span");
  label.className = "slot-label";
  zone.children.push(label);
  return zone;
});

const slotStatus = new Element("p", "canvas-slot-status");
slotStatus.textContent = "0 of 2 required speaker videos ready. Optional b-roll can be added later.";
const resetButton = new Element("button", "canvas-reset");
const continueLink = new Element("a", "canvas-continue");
continueLink.attributes["aria-disabled"] = "true";
continueLink.textContent = "Fill required speaker slots to continue";
const continueNote = new Element("p", "canvas-continue-note");
continueNote.textContent = "Place the host and guest into the layout before continuing into speaker roles. Optional b-roll can be added later.";
const sceneLabel = new Element("span", "canvas-scene-label");
const runtimeLabel = new Element("span", "canvas-runtime-label");
const speakerRow = new Element("div", "canvas-speaker-row", "speaker-row");

const document = {
  querySelector(selector) {
    const chipMatch = selector.match(/^\.drag-chip\[data-track="([^"]+)"\]$/);
    if (chipMatch) {
      return chips.find((chip) => chip.dataset.track === chipMatch[1]) || null;
    }
    const slotMatch = selector.match(/^\.drop-zone\[data-slot="([^"]+)"\]$/);
    if (slotMatch) {
      return zones.find((zone) => zone.dataset.slot === slotMatch[1]) || null;
    }
    return null;
  },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return layoutButtons;
    if (selector === ".drag-chip") return chips;
    if (selector === ".drop-zone[data-slot]") return zones;
    if (selector === ".drop-zone.filled") {
      return zones.filter((zone) => zone.classList.contains("filled"));
    }
    return [];
  },
  getElementById(id) {
    return {
      "canvas-slot-status": slotStatus,
      "canvas-reset": resetButton,
      "canvas-continue": continueLink,
      "canvas-continue-note": continueNote,
      "canvas-scene-label": sceneLabel,
      "canvas-runtime-label": runtimeLabel,
      "canvas-speaker-row": speakerRow,
    }[id] || null;
  },
  createElement(tagName) {
    return new Element(tagName);
  },
};

vm.runInNewContext(script, { document });

function slotState(slot) {
  return zones.find((zone) => zone.dataset.slot === slot).querySelector(".slot-state");
}

assert.match(html, /\.slot-state/, "example canvas styles per-slot placement badges");
assert.equal(slotState("host").textContent, "Needs video", "an empty host slot flags that it needs a video");
assert.equal(slotState("guest").textContent, "Needs video", "an empty guest slot flags that it needs a video");
assert.equal(slotState("broll").textContent, "Optional", "the optional b-roll slot is labelled optional");

assert.strictEqual(continueLink.attributes["aria-disabled"], "true");
assert.strictEqual(continueLink.href, "");
assert.match(continueNote.textContent, /before continuing into speaker roles/);

function drop(slot, track) {
  const zone = zones.find((entry) => entry.dataset.slot === slot);
  zone.listeners.drop({
    preventDefault() {},
    dataTransfer: {
      getData() {
        return track;
      },
    },
  });
}

function pressKey(node, key) {
  node.listeners.keydown({
    key,
    preventDefault() {},
    target: node,
  });
}

const hostChip = chips.find((chip) => chip.dataset.track === "host");
const guestChip = chips.find((chip) => chip.dataset.track === "guest");
const guestBChip = chips.find((chip) => chip.dataset.track === "guest-b");
const brollChip = chips.find((chip) => chip.dataset.track === "broll");
const hostZone = zones.find((zone) => zone.dataset.slot === "host");
const guestZone = zones.find((zone) => zone.dataset.slot === "guest");
const guestBZone = zones.find((zone) => zone.dataset.slot === "guest-b");
const brollZone = zones.find((zone) => zone.dataset.slot === "broll");
const soloButton = layoutButtons.find((button) => button.dataset.layout === "solo");
const panelButton = layoutButtons.find((button) => button.dataset.layout === "panel");
const interviewButton = layoutButtons.find((button) => button.dataset.layout === "interview");

assert.equal(interviewButton.getAttribute("aria-checked"), "true", "interview starts selected");
assert.equal(guestBChip.hidden, true, "the second guest track is hidden until the panel layout is selected");
assert.equal(guestBZone.classList.contains("is-hidden"), true, "the second guest slot is hidden in the interview layout");

hostZone.listeners.click({ target: hostZone });
assert.match(slotStatus.textContent, /Pick a track first/);

hostChip.listeners.click({ target: hostChip });
assert.equal(hostChip.getAttribute("aria-pressed"), "true");
assert.match(slotStatus.textContent, /Choose its matching slot/);

guestZone.listeners.click({ target: guestZone });
assert.match(slotStatus.textContent, /different slot/);
assert.equal(hostChip.getAttribute("aria-pressed"), "true");

hostZone.listeners.click({ target: hostZone });
assert.equal(hostChip.getAttribute("aria-pressed"), "false");
assert.match(slotStatus.textContent, /1 of 2 required speaker videos ready/);

pressKey(guestChip, "Enter");
assert.equal(guestChip.getAttribute("aria-pressed"), "true");
pressKey(guestZone, " ");
assert.equal(guestChip.getAttribute("aria-pressed"), "false");
assert.strictEqual(continueLink.attributes["aria-disabled"], "false");
assert.strictEqual(
  continueLink.href,
  "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest",
  "interview continue carries the selected layout and required slots",
);

soloButton.click();
assert.equal(soloButton.getAttribute("aria-checked"), "true", "solo layout button becomes active");
assert.equal(speakerRow.className, "speaker-row layout-solo", "solo layout visibly switches to a one-speaker composition");
assert.equal(hostZone.classList.contains("filled"), true, "switching to solo preserves the placed host track");
assert.equal(guestZone.classList.contains("filled"), true, "switching to solo keeps the guest placement available for switching back");
assert.equal(guestZone.classList.contains("is-hidden"), true, "solo hides the guest slot instead of leaving the interview shape visible");
assert.equal(continueLink.attributes["aria-disabled"], "false", "solo remains ready because the host track is already placed");
assert.strictEqual(
  continueLink.href,
  "./app.html#speaker-role-mapping?path=episode&layout=solo&slots=host",
  "solo continue only carries the required host slot",
);

panelButton.click();
assert.equal(panelButton.getAttribute("aria-checked"), "true", "panel layout button becomes active");
assert.equal(speakerRow.className, "speaker-row layout-panel", "panel layout visibly switches to a three-speaker composition");
assert.equal(guestZone.classList.contains("is-hidden"), false, "panel restores the first guest slot with its placement");
assert.equal(guestBZone.classList.contains("is-hidden"), false, "panel reveals the second guest slot");
assert.equal(guestBChip.hidden, false, "panel reveals the second guest track chip");
assert.equal(hostZone.classList.contains("filled"), true, "panel keeps the host placement");
assert.equal(guestZone.classList.contains("filled"), true, "panel keeps the first guest placement");
assert.equal(continueLink.attributes["aria-disabled"], "true", "panel regates until Guest 2 is placed");
assert.match(slotStatus.textContent, /Still need the Guest 2 video/);

pressKey(guestBChip, "Enter");
pressKey(guestBZone, "Enter");
assert.equal(guestBZone.classList.contains("filled"), true, "keyboard placement fills the revealed Guest 2 panel slot");
assert.equal(continueLink.attributes["aria-disabled"], "false", "panel unlocks after all three speaker tracks are placed");
assert.strictEqual(
  continueLink.href,
  "./app.html#speaker-role-mapping?path=episode&layout=panel&slots=host%2Cguest%2Cguest-b",
  "panel continue carries all required speaker slots",
);

resetButton.click();
assert.strictEqual(continueLink.attributes["aria-disabled"], "true");
assert.strictEqual(continueLink.href, "");
assert.match(slotStatus.textContent, /Still need the Host, Guest, and Guest 2 videos/);
assert.equal(hostChip.getAttribute("aria-pressed"), "false");
assert.equal(guestChip.getAttribute("aria-pressed"), "false");
assert.equal(guestBChip.getAttribute("aria-pressed"), "false");
assert.equal(brollChip.getAttribute("aria-pressed"), "false");

interviewButton.click();
drop("host", "guest");
assert.match(slotStatus.textContent, /different slot/);
assert.strictEqual(continueLink.attributes["aria-disabled"], "true");

drop("host", "host");
assert.equal(slotState("host").textContent, "Ready", "a placed host slot reads Ready on the canvas");
assert.equal(slotState("guest").textContent, "Needs video", "the still-empty guest slot keeps flagging missing");
drop("guest", "guest");
assert.strictEqual(continueLink.attributes["aria-disabled"], "false");
assert.strictEqual(continueLink.href, "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest");
assert.strictEqual(continueLink.textContent, "Continue to speaker roles →");
assert.match(slotStatus.textContent, /Required speaker videos ready/);
assert.match(continueNote.textContent, /Optional b-roll can be added later/);
assert.equal(brollZone.classList.contains("filled"), false);

pressKey(brollChip, "Enter");
assert.equal(brollChip.getAttribute("aria-pressed"), "true");
pressKey(brollZone, "Enter");
assert.equal(brollChip.getAttribute("aria-pressed"), "false");
assert.strictEqual(continueLink.attributes["aria-disabled"], "false");
assert.strictEqual(continueLink.href, "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest");
assert.match(slotStatus.textContent, /Optional b-roll is in place\./);
assert.match(continueNote.textContent, /Optional b-roll is in place\./);

// Per-track remove: a creator can clear a single placed track without resetting the whole
// layout. Host and guest are both filled from the drag path above.
const hostRemove = hostZone.querySelector(".placed-remove");
assert.ok(hostRemove, "a placed track exposes a per-track remove control");
assert.strictEqual(hostRemove.attributes["aria-label"], "Remove Host track · Dana Brooks", "the remove control is labelled per track");
hostRemove.listeners.click({ stopPropagation() {} });
assert.strictEqual(hostZone.classList.contains("filled"), false, "removing a track clears just that slot");
assert.equal(slotState("host").textContent, "Needs video", "removing a track returns the slot badge to needing a video");
assert.strictEqual(hostZone.querySelector(".placed-track"), null, "the placed track and its remove control are gone");
assert.strictEqual(guestZone.classList.contains("filled"), true, "removing one track leaves the others placed");
assert.strictEqual(continueLink.attributes["aria-disabled"], "true", "Continue re-gates after a required track is removed");
assert.strictEqual(hostChip.focused, true, "removing a track returns focus to its matching palette chip");
// Re-placing the cleared slot restores readiness.
drop("host", "host");
assert.strictEqual(continueLink.attributes["aria-disabled"], "false", "re-placing the removed track restores Continue");

// A non-activating key is a no-op, so Tab still moves focus instead of changing selection.
resetButton.click();
pressKey(brollChip, "Tab");
assert.equal(brollChip.getAttribute("aria-pressed"), "false", "a non-activating key does not select a chip");
assert.match(slotStatus.textContent, /Optional b-roll can be added later\./, "reset returns b-roll copy to the optional-later state");

// The layout picker is a radio group: a roving tabindex makes it a single tab stop, and the
// arrow keys move between options and apply the one they land on (Home/End jump to first/last).
interviewButton.click();
assert.equal(interviewButton.getAttribute("aria-checked"), "true", "interview is the active radio");
assert.equal(interviewButton.getAttribute("tabindex"), "0", "the active layout option is the picker's tab stop");
assert.equal(soloButton.getAttribute("tabindex"), "-1", "an inactive layout option is removed from the tab order");
pressKey(interviewButton, "ArrowRight");
assert.equal(soloButton.getAttribute("aria-checked"), "true", "ArrowRight moves to and applies the next layout (solo)");
assert.equal(soloButton.focused, true, "ArrowRight moves focus to the next layout option");
pressKey(soloButton, "ArrowLeft");
assert.equal(interviewButton.getAttribute("aria-checked"), "true", "ArrowLeft steps back to the previous layout");
pressKey(interviewButton, "End");
assert.equal(panelButton.getAttribute("aria-checked"), "true", "End applies the last layout (panel)");
pressKey(panelButton, "Home");
assert.equal(interviewButton.getAttribute("aria-checked"), "true", "Home applies the first layout (interview)");

console.log("layout-first canvas handoff: keyboard, click, and drag placement all unlock continue correctly");
