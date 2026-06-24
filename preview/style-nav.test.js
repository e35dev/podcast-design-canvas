"use strict";

// Guards visual direction prototype navigation (#583 / #584).
// Run with: `node preview/style-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "style-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "style nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "style nav links to the guided episode flow");
assert.ok(navScript.includes("episode-watch-through-preview.html"), "style nav hands off to the publish prep path");
assert.ok(navScript.includes("speaker-eye-line-coherence.html"), "style nav links back to speaker setup");
assert.ok(navScript.includes('document.querySelector(".style-nav")'), "style nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "style nav builds the DOM without innerHTML");

const styleScreens = [
  "preset-style-picker.html",
  "preset-comparison-preview.html",
  "layout-safe-areas.html",
  "speaker-framing-safety.html",
  "canvas-layer-controls.html",
];

for (const file of styleScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/style-nav.js"), `${file} loads style navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses style nav instead of tools nav`);
  assert.ok(html.includes("data-style-step="), `${file} declares its style step`);
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
      if (name === "class") this.className = value;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    insertBefore(child, before) {
      const index = this.children.indexOf(before);
      if (index === -1) {
        this.children.unshift(child);
      } else {
        this.children.splice(index, 0, child);
      }
      return child;
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function makeWindow(fileName, embedded = false) {
  const window = { location: { pathname: `/prototype/${fileName}`, search: "" } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, styleStep, embedded = false) {
  const head = createElement("head");
  const body = createElement("body");
  if (styleStep) {
    body.dataset = { styleStep };
  }
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
      return (
        [...flatten(head), ...flatten(body)].find((node) =>
          node.className.split(" ").includes(className),
        ) || null
      );
    },
  };
  vm.runInNewContext(navScript, {
    document,
    window: makeWindow(fileName, embedded),
  });
  return { nodes: [...flatten(head), ...flatten(body)] };
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
}

const lastNav = renderNavFor("canvas-layer-controls.html", "canvas-layer-controls");
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Watch the finished episode"),
  "last visual direction screen hands off to the publish prep path",
);
assert.ok(
  lastNav.nodes.some((node) => node.href === "episode-watch-through-preview.html"),
  "last visual direction screen links to watch-through preview",
);

const embeddedFirstNav = renderNavFor("preset-style-picker.html", "preset-style-picker", true);
const embeddedHome = linkWithText(embeddedFirstNav.nodes, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded style nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedSetupBack = linkWithText(embeddedFirstNav.nodes, "Previous: Speaker eye-line coherence");
assert.equal(
  embeddedSetupBack.href,
  "../preview/app.html#speaker-eye-line-coherence",
  "embedded style nav routes the setup back-link through the preview app hash",
);
assert.equal(embeddedSetupBack.target, "_top", "embedded setup back-link targets the parent app");
const embeddedStyleNext = linkWithText(embeddedFirstNav.nodes, "Next: Preset comparison");
assert.equal(
  embeddedStyleNext.href,
  "../preview/app.html#preset-comparison-preview",
  "embedded style nav routes next style steps through the preview app hash",
);
assert.equal(embeddedStyleNext.target, "_top", "embedded style next link targets the parent app");

const embeddedMiddleNav = renderNavFor("layout-safe-areas.html", "layout-safe-areas", true);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Previous: Preset comparison").href,
  "../preview/app.html#preset-comparison-preview",
  "embedded style nav routes previous style steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Next: Speaker framing safety").href,
  "../preview/app.html#speaker-framing-safety",
  "embedded style nav routes middle next steps through the preview app hash",
);

const embeddedLastNav = renderNavFor("canvas-layer-controls.html", "canvas-layer-controls", true);
const embeddedHandoff = linkWithText(embeddedLastNav.nodes, "Continue: Watch the finished episode");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#episode-watch-through-preview",
  "embedded style nav routes the publish handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded style handoff targets the parent app");

console.log("style nav: visual direction screens connected back to the preview shell");
