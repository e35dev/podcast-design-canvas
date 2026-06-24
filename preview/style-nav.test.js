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

function renderNavFor(fileName, styleStep) {
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
    window: { location: { pathname: `/prototype/${fileName}`, search: "" } },
  });
  return { nodes: [...flatten(head), ...flatten(body)] };
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

console.log("style nav: visual direction screens connected back to the preview shell");
