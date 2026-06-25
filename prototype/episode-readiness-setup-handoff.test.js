"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-readiness.html"), "utf8");
const helperScript = fs.readFileSync(path.join(__dirname, "..", "preview", "episode-setup-state.js"), "utf8");

assert.ok(
  html.includes("../preview/episode-setup-state.js"),
  "episode readiness loads the shared episode setup helper",
);
assert.match(
  html,
  /id="episode-setup" class="setup-summary" hidden/,
  "episode readiness reserves a hidden episode-setup summary",
);
assert.ok(
  html.includes("episodeSetupApi.readinessTracksFromState"),
  "episode readiness seeds its tracks from the shared setup handoff when present",
);
assert.ok(
  html.includes("renderEpisodeSetupSummary()"),
  "episode readiness renders a visible setup summary when setup data exists",
);

function createNode(tagName) {
  return {
    tagName,
    children: [],
    attributes: {},
    dataset: {},
    value: "",
    checked: false,
    className: "",
    hidden: undefined,
    textContent: "",
    append(...children) {
      this.children.push(...children);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    addEventListener() {},
  };
}

const roots = {};
[
  "#tracks",
  "#issues",
  "#status",
  "#continue",
  "#continueNote",
  "#addGuest",
  "#reset",
  "#layout-handoff",
  "#episode-setup",
].forEach((selector) => {
  roots[selector] = createNode(selector.replace("#", ""));
});

const sessionStorage = {
  _data: new Map(),
  getItem(key) {
    return this._data.has(key) ? this._data.get(key) : null;
  },
  setItem(key, value) {
    this._data.set(key, value);
  },
};

const setupSandbox = { window: { sessionStorage }, module: { exports: {} } };
vm.runInNewContext(helperScript, setupSandbox);
const setup = setupSandbox.module.exports;
setup.save(sessionStorage, setup.applySourceSample(setup.createDefaultState(), "multi-file"));

const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const sandbox = {
  document: {
    createElement: createNode,
    createTextNode(text) {
      return { textContent: text, children: [] };
    },
    querySelector(selector) {
      return roots[selector] || createNode("div");
    },
  },
  window: {
    PodcastLayoutHandoff: null,
    PodcastEpisodeSetupState: setup,
    location: { search: "" },
    sessionStorage,
  },
  structuredClone,
  console,
};
vm.createContext(sandbox);
vm.runInContext(script, sandbox);

assert.equal(
  roots["#episode-setup"].hidden,
  false,
  "episode readiness reveals the setup summary when a carried setup exists",
);
assert.match(
  roots["#episode-setup"].children[0].textContent,
  /Separate synced uploads/,
  "the setup summary names the chosen source path",
);
assert.match(
  roots["#episode-setup"].children[1].textContent,
  /speaker links/,
  "the setup summary reports attached social-link context",
);

const readinessTracks = roots["#tracks"].children;
assert.equal(readinessTracks.length, 3, "episode readiness renders the carried speaker tracks");
const metaFields = readinessTracks[0].children[0].children;
assert.equal(
  metaFields[1].children[1].value,
  "Dana Brooks",
  "episode readiness carries the chosen speaker name into the next step",
);
assert.equal(
  metaFields[3].children[1].value,
  "https://danabrooks.fm",
  "episode readiness carries social-link context into the next step",
);

console.log("episode readiness: source path, speaker names, and social links carry forward from setup");
