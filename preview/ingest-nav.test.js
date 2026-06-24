"use strict";

// Smoke tests for ingest prototype navigation (#582 / #584).
// Run with: `node preview/ingest-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navPath = path.join(__dirname, "ingest-nav.js");
const navSource = fs.readFileSync(navPath, "utf8");

new vm.Script(navSource);
assert.ok(navSource.includes('home.href = "../preview/"'), "ingest nav links back to the preview shell");
assert.ok(navSource.includes("episode-flow.html"), "ingest nav links to the guided episode flow");
assert.ok(navSource.includes("app.html"), "ingest nav links to the preview app");
assert.ok(navSource.includes("source-media-health.html"), "ingest nav hands off to source media health");
assert.ok(navSource.includes('document.querySelector(".ingest-nav")'), "ingest nav guards against double render");
assert.ok(!/innerHTML/.test(navSource), "ingest nav builds the DOM without innerHTML");

const ingestScreens = [
  "episode-readiness.html",
  "speaker-role-mapping.html",
  "social-context-intake.html",
];

const forbidden = [
  /which surface owns/i,
  /owning surface/i,
  /opens the surface/i,
  /surface that owns/i,
  /\bpipeline\b/i,
];

for (const file of ingestScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/ingest-nav.js"), `${file} loads ingest navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses ingest nav instead of tools nav`);
  assert.ok(html.includes("data-ingest-step="), `${file} declares its ingest step`);

  for (const pattern of forbidden) {
    const match = html.match(pattern);
    assert.ok(!match, `${file} must not include internal copy: ${match && match[0]}`);
  }
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

function renderNavFor(fileName, ingestStep, search = "") {
  const head = createElement("head");
  const body = createElement("body");
  if (ingestStep) {
    body.dataset = { ingestStep };
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

  vm.runInNewContext(navSource, {
    document,
    window: { location: { pathname: `/prototype/${fileName}`, search } },
    URLSearchParams,
  });

  return { head, body, nodes: [...flatten(head), ...flatten(body)] };
}

const firstNav = renderNavFor("episode-readiness.html", "episode-readiness");
assert.ok(firstNav.nodes.some((node) => node.className === "ingest-nav"), "ingest nav renders on first screen");
assert.ok(
  !firstNav.nodes.some((node) => node.textContent && node.textContent.startsWith("Previous:")),
  "first ingest screen does not render a previous link",
);
assert.ok(
  firstNav.nodes.some((node) => node.textContent === "Next: Speaker roles"),
  "first ingest screen renders next link",
);

const middleNav = renderNavFor("speaker-role-mapping.html", "speaker-role-mapping", "?path=ingest");
assert.ok(
  middleNav.nodes.some((node) => node.textContent === "Previous: Episode readiness"),
  "middle ingest screen renders previous link",
);
assert.ok(
  middleNav.nodes.some((node) => node.textContent === "Next: Social links"),
  "ingest path at speaker roles links forward to social context",
);
const currentStep = middleNav.nodes.find((node) =>
  node.textContent === "Setup step 2 of 3 · Speaker roles",
);
assert.ok(currentStep, "middle ingest screen renders visible step label");
assert.equal(currentStep.attributes["aria-current"], "step", "current ingest step exposes aria-current");

const episodeRoleNav = renderNavFor("speaker-role-mapping.html", "speaker-role-mapping", "?path=episode");
assert.ok(
  episodeRoleNav.nodes.some((node) => node.textContent === "Continue: Source media health"),
  "episode shell path at speaker roles skips social context",
);
assert.ok(
  !episodeRoleNav.nodes.some((node) => node.textContent === "Next: Social links"),
  "episode shell path does not link to social context from speaker roles",
);

const lastNav = renderNavFor("social-context-intake.html", "social-context-intake", "?path=ingest");
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Source media health"),
  "last ingest screen hands off to source media health",
);
assert.ok(
  !lastNav.nodes.some((node) => node.textContent && node.textContent.startsWith("Next:")),
  "last ingest screen does not render a next link",
);

const duplicateNav = renderNavFor("speaker-role-mapping.html", "speaker-role-mapping");
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
  window: { location: { pathname: "/prototype/speaker-role-mapping.html" } },
  URLSearchParams,
});
assert.equal(
  flatten(duplicateNav.body).filter((node) => node.className === "ingest-nav").length,
  1,
  "ingest nav renders once if the script runs twice",
);

console.log("ingest nav: ingest screens connected with creator-facing copy");
