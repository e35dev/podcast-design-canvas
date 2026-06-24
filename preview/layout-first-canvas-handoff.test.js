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
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === "href") {
      this.href = String(value);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === "href") {
      this.href = "";
    }
  }

  getAttribute(name) {
    return this.attributes[name];
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

  remove() {
    if (!this.parentNode) {
      return;
    }
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode = null;
  }

  querySelector(selector) {
    if (selector === ".placed-track") {
      return this.children.find((child) => child.className === "placed-track") || null;
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

const chips = ["host", "guest", "broll"].map((track) => {
  const chip = new Element("span", "", "drag-chip");
  chip.dataset.track = track;
  return chip;
});

const zones = ["host", "guest", "broll"].map((slot) => {
  const zone = new Element("div", "", `drop-zone ${slot}`);
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

const document = {
  querySelector(selector) {
    const slotMatch = selector.match(/^\.drop-zone\[data-slot="([^"]+)"\]$/);
    if (slotMatch) {
      return zones.find((zone) => zone.dataset.slot === slotMatch[1]) || null;
    }
    return null;
  },
  querySelectorAll(selector) {
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
    }[id] || null;
  },
  createElement(tagName) {
    return new Element(tagName);
  },
};

vm.runInNewContext(script, { document });

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
const brollChip = chips.find((chip) => chip.dataset.track === "broll");
const hostZone = zones.find((zone) => zone.dataset.slot === "host");
const guestZone = zones.find((zone) => zone.dataset.slot === "guest");
const brollZone = zones.find((zone) => zone.dataset.slot === "broll");

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
assert.strictEqual(continueLink.href, "./app.html#speaker-role-mapping?path=episode");

resetButton.click();
assert.strictEqual(continueLink.attributes["aria-disabled"], "true");
assert.strictEqual(continueLink.href, "");
assert.strictEqual(slotStatus.textContent, "0 of 2 required speaker videos ready. Optional b-roll can be added later.");
assert.equal(hostChip.getAttribute("aria-pressed"), "false");
assert.equal(guestChip.getAttribute("aria-pressed"), "false");
assert.equal(brollChip.getAttribute("aria-pressed"), "false");

drop("host", "guest");
assert.match(slotStatus.textContent, /different slot/);
assert.strictEqual(continueLink.attributes["aria-disabled"], "true");

drop("host", "host");
drop("guest", "guest");
assert.strictEqual(continueLink.attributes["aria-disabled"], "false");
assert.strictEqual(continueLink.href, "./app.html#speaker-role-mapping?path=episode");
assert.strictEqual(continueLink.textContent, "Continue to speaker roles →");
assert.match(slotStatus.textContent, /Required speaker videos ready/);
assert.match(continueNote.textContent, /Optional b-roll can be added later/);
assert.equal(brollZone.classList.contains("filled"), false);

pressKey(brollChip, "Enter");
assert.equal(brollChip.getAttribute("aria-pressed"), "true");
pressKey(brollZone, "Enter");
assert.equal(brollChip.getAttribute("aria-pressed"), "false");
assert.strictEqual(continueLink.attributes["aria-disabled"], "false");
assert.strictEqual(continueLink.href, "./app.html#speaker-role-mapping?path=episode");

console.log("layout-first canvas handoff: keyboard, click, and drag placement all unlock continue correctly");
