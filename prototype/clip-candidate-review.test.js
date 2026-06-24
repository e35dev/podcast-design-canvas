"use strict";

// Guards connected publish-prep clip review behavior (#583).
// Run with: `node prototype/clip-candidate-review.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "clip-candidate-review.html"), "utf8");
const helper = fs.readFileSync(path.join(__dirname, "clip-candidate-review.js"), "utf8");
const script = html.match(/<script>\n([\s\S]*?)\n    <\/script>/)[1];

new vm.Script(helper);
new vm.Script(script);
assert.ok(html.includes("../preview/publish-nav.js"), "clip review loads publish navigation");
assert.ok(html.includes("clip-candidate-review.js"), "clip review loads its filter helper");
assert.ok(html.includes('data-publish-step="clip-candidate-review"'), "clip review declares its publish step");
assert.ok(!/innerHTML/.test(script), "clip review renders dynamic regions without innerHTML");

const helperContext = {};
vm.runInNewContext(helper, helperContext);
assert.equal(
  helperContext.clipCandidateReview.nextClipFilter("approved", "approved"),
  "all",
  "active non-default filters toggle back to all candidates",
);
const approvedFilter = helperContext.clipCandidateReview
  .clipFilterOptions("approved")
  .find((filter) => filter.id === "approved");
assert.equal(approvedFilter.label, "Show all candidates", "active approved filter exposes clear copy");
assert.equal(approvedFilter.pressed, true, "active approved filter is marked pressed");
assert.equal(approvedFilter.nextFilter, "all", "active approved filter targets all candidates");

function createElement(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    className: "",
    disabled: false,
    href: "",
    id: "",
    style: {},
    textContent: "",
    type: "",
    value: "",
    append(...children) {
      this.children.push(...children);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "id") this.id = value;
    },
    getAttribute(name) {
      return this.attributes[name] || "";
    },
    addEventListener(type, handler) {
      this[`on${type}`] = handler;
    },
    click() {
      if (!this.disabled && this.onclick) {
        this.onclick({ target: this });
      }
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function createScreen() {
  const roots = {
    candidates: createElement("div"),
    readiness: createElement("div"),
    filters: createElement("div"),
    "episode-info": createElement("div"),
  };
  const document = {
    createElement,
    getElementById(id) {
      return roots[id] || null;
    },
  };
  vm.runInNewContext(`${helper}\n${script}`, { document });
  return roots;
}

function buttonWithText(root, text) {
  const button = flatten(root).find((node) => node.tagName === "button" && node.textContent === text);
  assert.ok(button, `Missing button: ${text}`);
  return button;
}

function textIncludes(root, text) {
  return flatten(root).some((node) => typeof node.textContent === "string" && node.textContent.includes(text));
}

const screen = createScreen();
assert.equal(
  buttonWithText(screen.filters, "All candidates").attributes["aria-pressed"],
  "true",
  "default all-candidates filter is marked active",
);
assert.equal(
  buttonWithText(screen.filters, "Show approved").attributes["aria-pressed"],
  "false",
  "inactive approved filter reads as the action it will take",
);
assert.ok(textIncludes(screen.candidates, "When tokens become communication"), "initial all view shows candidates");

buttonWithText(screen.filters, "Show approved").click();
assert.equal(
  buttonWithText(screen.filters, "Show all candidates").attributes["aria-pressed"],
  "true",
  "active approved filter exposes an exit action instead of repeating the filter command",
);
assert.ok(textIncludes(screen.candidates, "No clips match this filter."), "empty filtered state is visible");

buttonWithText(screen.filters, "Show all candidates").click();
assert.equal(
  buttonWithText(screen.filters, "All candidates").attributes["aria-pressed"],
  "true",
  "clicking the active filter returns to all candidates",
);

buttonWithText(screen.candidates, "Approve").click();
assert.ok(textIncludes(screen.readiness, "1 ready for clip export"), "approving a clip updates readiness");

buttonWithText(screen.filters, "Show approved").click();
assert.ok(textIncludes(screen.candidates, "When tokens become communication"), "approved filter shows approved clips");
assert.equal(
  buttonWithText(screen.filters, "Show all candidates").attributes["aria-pressed"],
  "true",
  "approved filtered view keeps the visible clear action after results appear",
);

console.log("clip candidate review: active filters expose clear actions and approvals update readiness");
