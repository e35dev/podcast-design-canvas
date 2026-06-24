"use strict";

// Guards core episode flow prototype navigation (#581 / #583 / #584).
// Run with: `node preview/episode-flow-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "episode-flow-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes("../preview/index.html"), "episode flow nav links back to the episode flow home");
assert.ok(navScript.includes("episode-flow.html"), "episode flow nav links to the guided episode flow");
assert.ok(navScript.includes('app.textContent = "Preview app"'), "episode flow nav exposes a preview app link");
assert.ok(navScript.includes("episode-watch-through-preview.html"), "episode flow nav hands off to publish prep");
assert.ok(navScript.includes('document.querySelector(".episode-flow-nav")'), "episode flow nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "episode flow nav builds the DOM without innerHTML");

const episodeScreens = [
  "source-media-health.html",
  "speaker-sync-repair.html",
  "audio-cleanup-controls.html",
  "audio-caption-quality-review.html",
  "export-readiness-review.html",
];

for (const file of episodeScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/episode-flow-nav.js"), `${file} loads episode flow navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses episode flow nav instead of tools nav`);
}

function createElement(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    className: "",
    href: "",
    id: "",
    target: "",
    textContent: "",
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "id") this.id = value;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    insertBefore(child, before) {
      const index = this.children.indexOf(before);
      this.children.splice(index === -1 ? 0 : index, 0, child);
      return child;
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function makeWindow(fileName, embedded = false) {
  const window = { location: { pathname: `/prototype/${fileName}` } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, embedded = false) {
  const head = createElement("head");
  const body = createElement("body");
  const document = {
    readyState: "complete",
    head,
    body,
    createElement,
    getElementById(id) {
      return [...flatten(head), ...flatten(body)].find((node) => node.id === id) || null;
    },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      const className = selector.slice(1);
      return flatten(body).find((node) => node.className.split(" ").includes(className)) || null;
    },
  };

  vm.runInNewContext(navScript, {
    document,
    window: makeWindow(fileName, embedded),
  });

  return flatten(body);
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
}

const firstNav = renderNavFor("source-media-health.html");
const previewApp = linkWithText(firstNav, "Preview app");
assert.equal(previewApp.href, "../preview/app.html", "episode flow nav links to the unified preview app");
assert.ok(
  linkWithText(firstNav, "Previous: Speaker roles"),
  "first episode flow screen links back to speaker roles",
);
assert.ok(
  linkWithText(firstNav, "Next: Speaker sync repair"),
  "first episode flow screen renders the next episode step",
);

const lastNav = renderNavFor("export-readiness-review.html");
const publishHandoff = linkWithText(lastNav, "Continue: Watch-through preview");
assert.equal(
  publishHandoff.href,
  "episode-watch-through-preview.html",
  "last episode flow screen hands off to watch-through preview",
);

const embeddedFirstNav = renderNavFor("source-media-health.html", true);
const embeddedPreviewApp = linkWithText(embeddedFirstNav, "Preview app");
assert.equal(embeddedPreviewApp.href, "../preview/app.html", "embedded episode flow nav keeps the preview app href");
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedHome = linkWithText(embeddedFirstNav, "Episode flow home");
assert.equal(embeddedHome.target, "_top", "embedded episode flow home targets the parent app");
const embeddedPrevious = linkWithText(embeddedFirstNav, "Previous: Speaker roles");
assert.equal(
  embeddedPrevious.href,
  "../preview/app.html#speaker-role-mapping",
  "embedded episode flow nav routes previous steps through the preview app hash",
);
assert.equal(embeddedPrevious.target, "_top", "embedded previous link targets the parent app");

const embeddedLastNav = renderNavFor("export-readiness-review.html", true);
const embeddedHandoff = linkWithText(embeddedLastNav, "Continue: Watch-through preview");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#episode-watch-through-preview",
  "embedded episode flow nav routes publish prep handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded publish prep handoff targets the parent app");

console.log("episode flow nav: core episode screens connected to the preview shell and app");
