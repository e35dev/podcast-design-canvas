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

const reuseFlowMatch = navScript.match(/const REUSE_FLOW = \[([\s\S]*?)\];/);
assert.ok(reuseFlowMatch, "reuse nav declares REUSE_FLOW");
const flowFiles = [...reuseFlowMatch[1].matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
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

function renderNavFor(fileName, reuseStep, embedded = false) {
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
    window: makeWindow(fileName, embedded),
  });

  return flatten(body);
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
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
  !middleNav.some((node) => node.tagName === "a" && node.textContent === "Previous: Sensitive moment review"),
  "middle reuse screen does not reuse the sensitive moment review back link",
);

const lastNav = renderNavFor("episode-chapter-markers.html", "episode-chapter-markers");
const publishHandoff = linkWithText(lastNav, "Continue: Episode watch-through");
assert.equal(
  publishHandoff.href,
  "episode-watch-through-preview.html",
  "last reuse screen hands off to episode watch-through",
);

const embeddedFirstNav = renderNavFor("show-segment-system.html", "show-segment-system", true);
const embeddedHome = linkWithText(embeddedFirstNav, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded reuse nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedVisualsBack = linkWithText(embeddedFirstNav, "Previous: Sensitive moment review");
assert.equal(
  embeddedVisualsBack.href,
  "../preview/app.html#sensitive-moment-review",
  "embedded reuse nav routes the contextual-visuals back-link through the preview app hash",
);
assert.equal(embeddedVisualsBack.target, "_top", "embedded contextual-visuals back-link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav, "Next: Show template adaptation");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#show-template-adaptation",
  "embedded reuse nav routes next reuse steps through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded reuse next link targets the parent app");

const embeddedMiddleNav = renderNavFor("start-from-previous-episode.html", "start-from-previous-episode", true);
assert.equal(
  linkWithText(embeddedMiddleNav, "Previous: Show template adaptation").href,
  "../preview/app.html#show-template-adaptation",
  "embedded reuse nav routes previous reuse steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav, "Next: Episode chapter markers").href,
  "../preview/app.html#episode-chapter-markers",
  "embedded reuse nav routes middle next steps through the preview app hash",
);

const embeddedLastNav = renderNavFor("episode-chapter-markers.html", "episode-chapter-markers", true);
const embeddedHandoff = linkWithText(embeddedLastNav, "Continue: Episode watch-through");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#episode-watch-through-preview",
  "embedded reuse nav routes the publish handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded reuse handoff targets the parent app");

console.log("reuse nav: make-it-reusable screens connected into one path");
