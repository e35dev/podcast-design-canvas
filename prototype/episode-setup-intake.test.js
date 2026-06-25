"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-setup-intake.html"), "utf8");
const helperScript = fs.readFileSync(path.join(__dirname, "..", "preview", "episode-setup-state.js"), "utf8");
const pageScript = html.match(/<script>\s*const setupApi[\s\S]*?<\/script>/)[0]
  .replace(/^<script>/, "")
  .replace(/<\/script>$/, "");

assert.ok(
  html.includes("../preview/episode-setup-state.js"),
  "episode setup intake loads the shared setup-state helper",
);
assert.match(
  html,
  /Continue to episode readiness/,
  "episode setup intake exposes a creator-facing continue action",
);
assert.doesNotMatch(
  html,
  /innerHTML/,
  "episode setup intake builds its editable content without innerHTML",
);

function createElement(tagName) {
  return {
    tagName,
    children: [],
    attributes: {},
    dataset: {},
    value: "",
    textContent: "",
    href: "",
    target: "",
    className: "",
    readOnly: false,
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
      if (name === "href") this.href = value;
      if (name === "target") this.target = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
      if (name === "href") this.href = "";
      if (name === "target") this.target = "";
    },
    addEventListener(type, handler) {
      this[`on${type}`] = handler;
    },
    click() {
      if (this.onclick) {
        this.onclick({ target: this });
      }
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

const roots = {};
[
  "#source-link",
  "#source-upload",
  "#source-input-title",
  "#source-input",
  "#sourceHint",
  "#loadSource",
  "#tracks",
  "#status",
  "#summaryCopy",
  "#summaryMeta",
  "#issues",
  "#nextNote",
  "#continue",
  "#reset",
].forEach((selector) => {
  roots[selector] = createElement(selector.replace("#", ""));
});

const posted = [];
const windowStub = {
  location: { pathname: "/prototype/episode-setup-intake.html" },
  self: null,
  top: {
    location: { pathname: "/preview/app.html" },
    postMessage(payload) {
      posted.push(payload);
    },
  },
  sessionStorage: {
    _data: new Map(),
    getItem(key) {
      return this._data.has(key) ? this._data.get(key) : null;
    },
    setItem(key, value) {
      this._data.set(key, value);
    },
    removeItem(key) {
      this._data.delete(key);
    },
  },
};
windowStub.self = windowStub;

const sandbox = {
  window: windowStub,
  document: {
    createElement,
    createTextNode(text) {
      return { textContent: text, children: [] };
    },
    querySelector(selector) {
      return roots[selector] || null;
    },
  },
  URLSearchParams,
  structuredClone,
};

vm.runInNewContext(helperScript, sandbox);
sandbox.window.PodcastEpisodeSetupState = sandbox.PodcastEpisodeSetupState;
vm.runInNewContext(pageScript, sandbox);

assert.equal(
  roots["#continue"].attributes["aria-disabled"],
  "true",
  "the continue action starts gated until the source path is loaded",
);
assert.match(
  roots["#sourceHint"].textContent,
  /Riverside/,
  "the default source hint describes the recording-link path",
);
assert.equal(
  flatten(roots["#tracks"]).filter((node) => node.tagName === "article").length,
  3,
  "the setup screen renders one track card per required speaker bucket",
);

roots["#loadSource"].click();
assert.equal(
  roots["#continue"].attributes["aria-disabled"],
  "false",
  "loading the sample source unlocks the continue action when every required track is ready",
);
assert.equal(
  roots["#continue"].href,
  "../preview/app.html#episode-readiness",
  "embedded continue routes back through the preview app to the next step",
);
assert.ok(
  posted.some((payload) => payload.type === "pdc-episode-setup-state" && payload.complete === true),
  "the intake reports completion status to the preview app shell",
);

const firstTrack = roots["#tracks"].children[0];
const firstTrackChildren = roots["#tracks"].children;
const hostNameInput = flatten(firstTrack).find(
  (node) => node.tagName === "input" && node.dataset.field === "speakerName",
);
assert.ok(hostNameInput, "the first track exposes an editable speaker-name field");
hostNameInput.value = "";
firstTrack.oninput({ target: hostNameInput });
assert.equal(
  roots["#tracks"].children[0],
  firstTrack,
  "editing a speaker field updates the setup gate without remounting the active track card",
);
assert.equal(
  roots["#tracks"].children,
  firstTrackChildren,
  "editing a speaker field preserves the track list object while the creator is typing",
);
assert.equal(
  roots["#continue"].attributes["aria-disabled"],
  "true",
  "clearing a required speaker name re-locks the continue action",
);

roots["#source-upload"].click();
assert.equal(
  roots["#continue"].attributes["aria-disabled"],
  "true",
  "switching to the multi-file path resets the setup gate until those files are added",
);
assert.match(
  roots["#sourceHint"].textContent,
  /Separate uploads/,
  "switching source path updates the creator-facing source hint",
);

console.log("episode setup intake: source choice, completion gate, and app handoff verified");
