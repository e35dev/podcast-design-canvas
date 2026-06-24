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
assert.ok(navScript.includes("contextual-broll-moments.html"), "cleanup nav hands off to the visuals stage");
assert.ok(navScript.includes("publish-checklist.html"), "cleanup nav links back to the publish prep path");
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

const firstNav = renderNavFor("pause-crosstalk-cleanup.html", "pause-crosstalk-cleanup");
assert.ok(
  firstNav.nodes.some((node) => node.textContent === "Previous: Publish checklist"),
  "first cleanup screen links back to the publish prep path",
);
assert.ok(
  firstNav.nodes.some((node) => node.href === "publish-checklist.html"),
  "first cleanup screen previous link targets publish checklist",
);

const lastNav = renderNavFor("on-screen-correction-note.html", "on-screen-correction-note");
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Contextual b-roll moments"),
  "last cleanup screen hands off to the visuals path",
);

console.log("cleanup nav: audio & caption cleanup screens connected into one path");
