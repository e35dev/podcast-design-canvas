"use strict";

// Guards preview-app hash routing when a handoff carries entry context (#583).
// Run with: `node preview/app-hash-query.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const appHtml = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const appScript = appHtml.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeWindow(hash) {
  const listeners = {};
  return {
    location: { hash },
    addEventListener(name, fn) {
      listeners[name] = fn;
    },
    dispatchHashChange() {
      listeners.hashchange?.();
    },
  };
}

function createElement(tagName) {
  const node = {
    tagName,
    attributes: {},
    children: [],
    className: "",
    href: "",
    id: "",
    title: "",
    textContent: "",
    src: "",
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "id") this.id = value;
      if (name === "class") this.className = value;
    },
    removeAttribute() {},
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    classList: { toggle() {} },
  };
  return node;
}

function boot(hash) {
  const frame = createElement("iframe");
  frame.id = "screen";
  const openDirect = createElement("a");
  openDirect.id = "open-direct";
  const crumbLabel = createElement("span");
  crumbLabel.id = "crumb-label";
  const stepCount = createElement("span");
  stepCount.id = "step-count";
  const prevStep = createElement("a");
  prevStep.id = "prev-step";
  const nextStep = createElement("a");
  nextStep.id = "next-step";
  const railElement = createElement("nav");
  railElement.id = "rail";
  const progressEl = createElement("span");
  progressEl.id = "progress";

  const nodes = [frame, openDirect, crumbLabel, stepCount, prevStep, nextStep, railElement, progressEl];

  const document = {
    createElement,
    querySelector(selector) {
      if (!selector.startsWith("#")) return null;
      const id = selector.slice(1);
      return nodes.find((node) => node.id === id) || null;
    },
  };

  const window = makeWindow(hash);
  const storage = new Map();
  vm.runInNewContext(appScript, {
    document,
    window,
    sessionStorage: {
      getItem(key) {
        return storage.get(key) || null;
      },
      setItem(key, value) {
        storage.set(key, value);
      },
    },
  });

  return { frame, openDirect, window };
}

const styleHandoff = boot("#contextual-broll-moments?from=style");
assert.equal(
  styleHandoff.frame.src,
  "../prototype/contextual-broll-moments.html?from=style",
  "preview app keeps style entry context when loading contextual visuals",
);
assert.equal(
  styleHandoff.openDirect.href,
  "../prototype/contextual-broll-moments.html?from=style",
  "open-direct keeps style entry context for contextual visuals",
);

const cleanupHandoff = boot("#contextual-broll-moments?from=cleanup");
assert.equal(
  cleanupHandoff.frame.src,
  "../prototype/contextual-broll-moments.html?from=cleanup",
  "preview app keeps cleanup entry context when loading contextual visuals",
);

const unknownScreen = boot("#not-a-real-screen?from=style");
assert.equal(
  unknownScreen.frame.src.endsWith(".html"),
  true,
  "unknown hash values still fall back to a known screen",
);
assert.ok(
  !unknownScreen.frame.src.includes("?from=style"),
  "fallback screen ignores query strings from an unknown hash",
);

console.log("preview app hash query: handoff context survives embedded routing");
