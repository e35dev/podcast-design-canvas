"use strict";

// Guards speaker-setup prototype navigation (#582 / #583 / #584).
// Run with: `node preview/speaker-setup-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "speaker-setup-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "speaker setup nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "speaker setup nav links to the guided episode flow");
assert.ok(navScript.includes("preset-style-picker.html"), "speaker setup nav hands off to the visual direction path");
assert.ok(navScript.includes("speaker-role-mapping.html"), "speaker setup nav links back to speaker roles");
assert.ok(navScript.includes('document.querySelector(".speaker-setup-nav")'), "speaker setup nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "speaker setup nav builds the DOM without innerHTML");

const setupScreens = [
  "speaker-attribution-review.html",
  "guest-profile-reuse.html",
  "speaker-visual-match.html",
  "speaker-eye-line-coherence.html",
];

for (const file of setupScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/speaker-setup-nav.js"), `${file} loads speaker setup navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses speaker setup nav instead of tools nav`);
  assert.ok(html.includes("data-setup-step="), `${file} declares its speaker setup step`);
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

function renderNavFor(fileName, setupStep) {
  const head = createElement("head");
  const body = createElement("body");
  if (setupStep) {
    body.dataset = { setupStep };
  }
  const document = {
    readyState: "complete",
    head,
    body,
    createElement,
    getElementById(id) {
      return flatten(head).find((node) => node.id === id) || null;
    },
    querySelector(selector) {
      if (selector === ".speaker-setup-nav") {
        return flatten(body).find((node) => node.className === "speaker-setup-nav") || null;
      }
      return null;
    },
    addEventListener() {},
  };
  vm.runInNewContext(navScript, {
    document,
    window: { location: { pathname: `/prototype/${fileName}`, search: "" } },
  });
  return { nodes: [...flatten(head), ...flatten(body)] };
}

const lastNav = renderNavFor("speaker-eye-line-coherence.html", "speaker-eye-line-coherence");
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Pick a preset style"),
  "last speaker setup screen hands off to the visual direction path",
);
assert.ok(
  lastNav.nodes.some((node) => node.href === "preset-style-picker.html"),
  "last speaker setup screen links to preset style picker",
);
assert.ok(
  !lastNav.nodes.some((node) => node.textContent && node.textContent.startsWith("Next:")),
  "last speaker setup screen does not render a next link",
);

console.log("speaker setup nav: speaker-setup screens connected back to the preview shell");
