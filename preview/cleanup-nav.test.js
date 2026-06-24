"use strict";

// Guards "clean up audio & captions" prototype navigation (#583).
// Run with: `node preview/cleanup-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "cleanup-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "cleanup nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "cleanup nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "cleanup nav links to the preview app");
assert.ok(navScript.includes("contextual-broll-moments.html"), "cleanup nav hands off to the visuals stage");
assert.ok(navScript.includes('document.querySelector(".cleanup-nav")'), "cleanup nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "cleanup nav builds the DOM without innerHTML");

const cleanupScreens = [
  "pause-crosstalk-cleanup.html",
  "transcript-glossary.html",
  "transcript-search-navigation.html",
  "accessibility-readability-checks.html",
  "line-pickup-insert.html",
  "on-screen-correction-note.html",
];

const flowFiles = [...navScript.matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, cleanupScreens, "cleanup nav path is the six cleanup screens, in order");

for (const file of cleanupScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/cleanup-nav.js"), `${file} loads cleanup navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses cleanup nav instead of tools nav`);
  assert.ok(html.includes("data-cleanup-step="), `${file} declares its cleanup step`);
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

function renderNavFor(fileName, cleanupStep) {
  const head = createElement("head");
  const body = createElement("body");
  if (cleanupStep) {
    body.dataset = { cleanupStep };
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

const firstNav = renderNavFor("pause-crosstalk-cleanup.html", "pause-crosstalk-cleanup");
const publishBackLink = linkWithText(firstNav, "Previous: Publish checklist");
assert.ok(publishBackLink, "first cleanup screen renders publish checklist as its previous step");
assert.equal(
  publishBackLink.href,
  "publish-checklist.html",
  "first cleanup screen previous link returns to publish checklist",
);

const middleNav = renderNavFor("transcript-glossary.html", "transcript-glossary");
assert.ok(
  linkWithText(middleNav, "Previous: Pause & cross-talk cleanup"),
  "middle cleanup screen renders the previous cleanup step",
);
assert.ok(
  !linkWithText(middleNav, "Previous: Publish checklist"),
  "middle cleanup screen does not reuse the publish checklist back link",
);

console.log("cleanup nav: audio & caption cleanup screens connected into one path");
