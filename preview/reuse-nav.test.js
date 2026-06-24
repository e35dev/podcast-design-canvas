"use strict";

// Guards "make it reusable" prototype navigation (#583).
// Run with: `node preview/reuse-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "reuse-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "reuse nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "reuse nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "reuse nav links to the preview app");
assert.ok(navScript.includes("episode-watch-through-preview.html"), "reuse nav hands off to the review stage");
assert.ok(navScript.includes('document.querySelector(".reuse-nav")'), "reuse nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "reuse nav builds the DOM without innerHTML");

const reuseScreens = [
  "show-segment-system.html",
  "show-template-adaptation.html",
  "start-from-previous-episode.html",
  "episode-chapter-markers.html",
];

const flowFiles = [...navScript.matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, reuseScreens, "reuse nav path is the four reuse screens, in order");

for (const file of reuseScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/reuse-nav.js"), `${file} loads reuse navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses reuse nav instead of tools nav`);
  assert.ok(html.includes("data-reuse-step="), `${file} declares its reuse step`);
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
      this.children.splice(index === -1 ? 0 : index, 0, child);
      return child;
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function renderNavFor(fileName, reuseStep) {
  const head = createElement("head");
  const body = createElement("body");
  if (reuseStep) {
    body.dataset = { reuseStep };
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
      return flatten(body).find((node) => node.className.split(" ").includes(className)) || null;
    },
  };

  vm.runInNewContext(navScript, {
    document,
    window: { location: { pathname: `/prototype/${fileName}` } },
  });

  return flatten(body);
}

function linkWithText(nodes, text) {
  return nodes.find((node) => node.tagName === "a" && node.textContent === text);
}

const firstNav = renderNavFor("show-segment-system.html", "show-segment-system");
const visualsBackLink = linkWithText(firstNav, "Previous: Sensitive moment review");
assert.ok(visualsBackLink, "first reuse screen renders sensitive moment review as its previous step");
assert.equal(
  visualsBackLink.href,
  "sensitive-moment-review.html",
  "first reuse screen previous link returns to sensitive moment review",
);

const middleNav = renderNavFor("show-template-adaptation.html", "show-template-adaptation");
assert.ok(
  linkWithText(middleNav, "Previous: Show segment system"),
  "middle reuse screen renders the previous reuse step",
);
assert.ok(
  !linkWithText(middleNav, "Previous: Sensitive moment review"),
  "middle reuse screen does not reuse the sensitive moment review back link",
);

console.log("reuse nav: make-it-reusable screens connected into one path");
