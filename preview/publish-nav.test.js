"use strict";

// Guards publish prep prototype navigation (#583 / #584).
// Run with: `node preview/publish-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "publish-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "publish nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "publish nav links to the guided episode flow");
assert.ok(navScript.includes("show-notes-assembly.html"), "publish nav includes show notes assembly");
assert.ok(navScript.includes('document.querySelector(".publish-nav")'), "publish nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "publish nav builds the DOM without innerHTML");

const publishScreens = [
  "episode-watch-through-preview.html",
  "destination-crop-preview.html",
  "thumbnail-cover-frame.html",
  "show-notes-assembly.html",
  "export-package-handoff.html",
  "client-review-copy-flow.html",
  "publish-checklist.html",
];

for (const file of publishScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/publish-nav.js"), `${file} loads publish navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses publish nav instead of tools nav`);
  assert.ok(html.includes("data-publish-step="), `${file} declares its publish step`);
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

function renderNavFor(fileName) {
  const head = createElement("head");
  const body = createElement("body");
  body.dataset = {};
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

const firstNav = renderNavFor("episode-watch-through-preview.html");
const exportBackLink = linkWithText(firstNav, "Previous: Export readiness");
assert.ok(exportBackLink, "first publish screen renders export readiness as its previous step");
assert.equal(
  exportBackLink.href,
  "export-readiness-review.html",
  "first publish screen previous link returns to export readiness",
);

const middleNav = renderNavFor("destination-crop-preview.html");
assert.ok(
  linkWithText(middleNav, "Previous: Watch-through preview"),
  "middle publish screen renders the previous publish step",
);
assert.ok(
  !linkWithText(middleNav, "Previous: Export readiness"),
  "middle publish screen does not reuse the export readiness back link",
);

// VM-render the forward path the same way ingest-nav does (#676): prev AND next,
// the finish handoff, and the visible step label — not just the previous link.
assert.ok(
  linkWithText(firstNav, "Next: Destination crop preview"),
  "first publish screen renders the next publish step",
);
const firstStep = firstNav.find(
  (node) => node.textContent === "Publish step 1 of 7 · Watch-through preview",
);
assert.ok(firstStep, "first publish screen renders its visible step label");
assert.equal(firstStep.attributes["aria-current"], "step", "current publish step exposes aria-current");

assert.ok(
  linkWithText(middleNav, "Next: Thumbnail cover frame"),
  "middle publish screen renders the next publish step",
);

const lastNav = renderNavFor("publish-checklist.html");
assert.ok(
  linkWithText(lastNav, "Previous: Client review copy"),
  "last publish screen renders the previous publish step",
);
const finish = linkWithText(lastNav, "Finish: back to the preview shell");
assert.ok(finish, "last publish screen renders the finish handoff");
assert.equal(finish.href, "../preview/", "finish handoff returns to the preview shell");
assert.ok(
  !lastNav.some((node) => node.textContent && node.textContent.startsWith("Next:")),
  "last publish screen does not render a next link",
);

// Rendering twice must still leave a single nav (matches the script's guard).
const head = createElement("head");
const body = createElement("body");
body.dataset = {};
const ctx = {
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
const win = { location: { pathname: "/prototype/destination-crop-preview.html" } };
vm.runInNewContext(navScript, { document: ctx, window: win });
vm.runInNewContext(navScript, { document: ctx, window: win });
assert.equal(
  flatten(body).filter((node) => node.className === "publish-nav").length,
  1,
  "publish nav renders once if the script runs twice",
);

console.log("publish nav: publish prep screens connected with prev/next, finish, and step labels");
