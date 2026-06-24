"use strict";

// Smoke tests for the browser preview shell and connected episode flow (#581 / #583 / #584).
// Run with: `node preview/preview.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const shellPath = path.join(__dirname, "index.html");
const navPath = path.join(__dirname, "episode-flow-nav.js");
const html = fs.readFileSync(shellPath, "utf8");
const navSource = fs.readFileSync(navPath, "utf8");

const flowSteps = [
  "prototype/source-media-health.html",
  "prototype/speaker-sync-repair.html",
  "prototype/audio-cleanup-controls.html",
  "prototype/audio-caption-quality-review.html",
  "prototype/export-readiness-review.html",
];

assert.match(html, /<title>Podcast Design Canvas — Preview<\/title>/, "preview shell has product title");
assert.match(html, /aria-label="Podcast Design Canvas preview shell"/, "preview shell exposes landmark label");
assert.match(html, /Example podcast layout canvas/, "preview shell leads with an example podcast layout canvas");
assert.match(html, /Host video slot/, "preview shell shows a host video drop zone");
assert.match(html, /Guest video slot/, "preview shell shows a guest video drop zone");
assert.match(html, /Caption area/, "preview shell reserves a caption area on the example canvas");
assert.match(html, /B-roll drop zone/, "preview shell shows a contextual visuals drop zone");
assert.match(html, /Drag speaker tracks onto the layout/, "preview shell exposes draggable speaker tracks for the example canvas");
assert.match(html, /draggable="true"/, "preview shell marks example canvas tracks as draggable");
assert.match(html, /data-slot="host"/, "preview shell labels the host video slot for drag-in placement");
assert.match(html, /data-slot="guest"/, "preview shell labels the guest video slot for drag-in placement");
assert.match(html, /data-slot="broll"/, "preview shell labels the b-roll slot for drag-in placement");
assert.match(html, /Reset layout/, "preview shell lets creators reset the example canvas layout");
assert.match(html, /canvas-slot-status/, "preview shell shows live slot fill status on the example canvas");
assert.match(html, /id="canvas-continue"/, "preview shell exposes a continue handoff from the example canvas");
assert.match(html, /speaker-role-mapping\?path=episode/, "example canvas continue handoff targets speaker roles in the preview app");
assert.ok(html.includes("dragover"), "preview shell handles drag-over on example canvas slots");
assert.ok(
  html.includes("./app.html#canvas-layer-controls?path=episode"),
  "preview shell links the example canvas to canvas layer controls",
);
assert.ok(
  html.includes("./app.html#layout-safe-areas?path=episode"),
  "preview shell links the example canvas to layout safe areas",
);
assert.ok(
  html.includes("Fill required speaker slots to continue"),
  "preview shell keeps the continue handoff gated until required speaker slots are placed",
);
assert.ok(
  html.includes("Optional b-roll can be added later"),
  "preview shell treats b-roll as optional in the layout-first handoff",
);

for (const step of flowSteps) {
  assert.ok(html.includes(step), `preview shell links to ${step}`);
  assert.ok(fs.existsSync(path.join(root, step)), `${step} exists for preview routing`);

  const prototypeHtml = fs.readFileSync(path.join(root, step), "utf8");
  assert.ok(
    prototypeHtml.includes("../preview/episode-flow-nav.js"),
    `${step} loads episode flow navigation`,
  );
}

for (const step of flowSteps) {
  const fileName = path.basename(step);
  assert.ok(navSource.includes(`"${fileName}"`), `episode flow nav lists ${fileName}`);
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
      return (
        [...flatten(head), ...flatten(body)].find((node) =>
          node.className.split(" ").includes(className)
        ) || null
      );
    },
  };

  vm.runInNewContext(navSource, {
    document,
    window: makeWindow(fileName, embedded),
    URLSearchParams,
  });

  return { head, body, nodes: [...flatten(head), ...flatten(body)] };
}

function linkWithText(nodes, text) {
  return nodes.find((node) => node.tagName === "a" && node.textContent === text);
}

const firstNav = renderNavFor("source-media-health.html");
assert.ok(firstNav.nodes.some((node) => node.id === "episode-flow-nav-styles"), "flow nav injects styles once");
assert.ok(firstNav.nodes.some((node) => node.textContent === "Episode flow home"), "flow nav renders home link");
assert.ok(firstNav.nodes.some((node) => node.textContent === "Guided episode flow"), "flow nav renders guided flow link");
assert.ok(firstNav.nodes.some((node) => node.textContent === "Preview app"), "flow nav renders preview app link");
assert.ok(
  firstNav.nodes.some((node) => node.textContent === "Previous: Speaker roles"),
  "first flow screen links back to speaker roles in the shell path",
);
assert.ok(
  firstNav.nodes.some((node) => node.textContent === "Next: Speaker sync repair"),
  "first flow screen renders next link",
);
const firstStep = firstNav.nodes.find((node) =>
  node.textContent === "Current step: 3 of 7 · Source media health",
);
assert.ok(firstStep, "first flow screen counts shell preamble steps in the step label");

const middleNav = renderNavFor("audio-cleanup-controls.html");
assert.ok(
  middleNav.nodes.some((node) => node.textContent === "Previous: Speaker sync repair"),
  "middle flow screen renders previous link",
);
assert.ok(
  middleNav.nodes.some((node) => node.textContent === "Next: Caption quality review"),
  "middle flow screen renders next link",
);
const currentStep = middleNav.nodes.find((node) =>
  node.textContent === "Current step: 5 of 7 · Audio cleanup"
);
assert.ok(currentStep, "middle flow screen renders visible current-step label");
assert.equal(currentStep.attributes["aria-current"], "step", "current step exposes aria-current");

const lastNav = renderNavFor("export-readiness-review.html");
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Previous: Caption quality review"),
  "last flow screen renders previous link",
);
assert.ok(
  !lastNav.nodes.some((node) => node.textContent.startsWith("Next:")),
  "last flow screen does not render a next link",
);
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Watch-through preview"),
  "last flow screen hands off to the connected publish path",
);
const publishHandoff = lastNav.nodes.find(
  (node) => node.tagName === "a" && node.textContent === "Continue: Watch-through preview",
);
assert.ok(publishHandoff, "last flow screen renders publish prep handoff link");
assert.equal(
  publishHandoff.href,
  "episode-watch-through-preview.html?path=publish",
  "last flow screen publish handoff opens watch-through preview in publish path context",
);
assert.ok(
  fs.existsSync(path.join(root, "prototype", publishHandoff.href.split("?")[0])),
  "publish prep handoff target exists",
);

const embeddedFirstNav = renderNavFor("source-media-health.html", true);
const embeddedHome = linkWithText(embeddedFirstNav.nodes, "Episode flow home");
assert.equal(embeddedHome.target, "_top", "embedded episode nav home opens the preview shell at top level");
const embeddedPrevious = linkWithText(embeddedFirstNav.nodes, "Previous: Speaker roles");
assert.equal(
  embeddedPrevious.href,
  "../preview/app.html#speaker-role-mapping?path=episode",
  "embedded first flow screen routes previous through the preview app hash with episode context",
);
assert.equal(embeddedPrevious.target, "_top", "embedded previous link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav.nodes, "Next: Speaker sync repair");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#speaker-sync-repair",
  "embedded first flow screen routes next through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded next link targets the parent app");

const embeddedLastNav = renderNavFor("export-readiness-review.html", true);
const embeddedHandoff = linkWithText(embeddedLastNav.nodes, "Continue: Watch-through preview");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#episode-watch-through-preview?path=publish",
  "embedded last flow screen routes publish prep handoff through the preview app hash with publish context",
);
assert.equal(embeddedHandoff.target, "_top", "embedded publish prep handoff targets the parent app");

const duplicateNav = renderNavFor("speaker-sync-repair.html");
vm.runInNewContext(navSource, {
  document: {
    readyState: "complete",
    head: duplicateNav.head,
    body: duplicateNav.body,
    createElement,
    getElementById(id) {
      return duplicateNav.nodes.find((node) => node.id === id) || null;
    },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      const className = selector.slice(1);
      return duplicateNav.nodes.find((node) => node.className.split(" ").includes(className)) || null;
    },
  },
  window: { location: { pathname: "/prototype/speaker-sync-repair.html", search: "" } },
  URLSearchParams,
});
assert.equal(
  flatten(duplicateNav.body).filter((node) => node.className === "episode-flow-nav").length,
  1,
  "flow nav renders once if the script runs twice",
);

console.log("preview shell (episode flow smoke): all assertions passed");
