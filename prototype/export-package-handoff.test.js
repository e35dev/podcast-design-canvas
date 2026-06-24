const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.disabled = false;
    this.href = "";
    this.type = "";
    this._text = "";
    this.className = "";
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
  }

  get textContent() {
    return [this._text, ...this.children.map((child) => child.textContent)].join("");
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
    this._text = "";
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === "href") {
      this.href = "";
    }
  }

  addEventListener(type, handler) {
    this.listeners[type] = handler;
  }

  click() {
    if (!this.disabled && this.listeners.click) {
      this.listeners.click({ target: this });
    }
  }
}

const ids = [
  "destinations",
  "title",
  "subtitle",
  "status",
  "meta",
  "packages",
  "warnings",
  "handoffNote",
  "downloadPackage",
  "copyMetadata",
  "createReviewCopy",
  "startNextEpisode",
];

const elements = Object.fromEntries(ids.map((id) => [id, new Element("div")]));
["downloadPackage", "copyMetadata", "createReviewCopy", "startNextEpisode"].forEach((id) => {
  elements[id].tagName = "button";
});
elements.startNextEpisode.tagName = "a";

const document = {
  querySelector(selector) {
    const id = selector.replace("#", "");
    assert(elements[id], `Unexpected selector: ${selector}`);
    return elements[id];
  },
  createElement(tagName) {
    return new Element(tagName);
  },
};

const html = fs.readFileSync("prototype/export-package-handoff.html", "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const sandbox = { document, module: { exports: {} } };
const nextEpisodeSurface = "start-from-previous-episode.html";

vm.runInNewContext(script, sandbox);

function destinationButton(label) {
  const button = elements.destinations.children.find((child) => child.textContent === label);
  assert(button, `Missing destination button: ${label}`);
  return button;
}

function noteText() {
  return elements.handoffNote.textContent;
}

assert.strictEqual(sandbox.module.exports.destinationHasRequiredBlock(sandbox.module.exports.destinations.youtube), false);
assert.strictEqual(sandbox.module.exports.destinationHasRequiredBlock(sandbox.module.exports.destinations.review), true);
assert.strictEqual(sandbox.module.exports.completePackageCount(sandbox.module.exports.destinations.youtube), 4);
assert.strictEqual(sandbox.module.exports.ignoredWarningCount(sandbox.module.exports.destinations.youtube), 1);
assert.strictEqual(
  sandbox.module.exports.destinationTitle({ title: "" }, "review"),
  "Client review copy package",
);
assert.strictEqual(
  sandbox.module.exports.destinationButtonLabel({ title: "" }, "archive"),
  "Archive master",
);
assert.strictEqual(sandbox.module.exports.destinationTemplate(sandbox.module.exports.destinations.youtube), "Interview split-screen");
assert.strictEqual(sandbox.module.exports.destinationTemplate({ meta: [["Duration", "3 min"]] }), "Selected template");
assert.strictEqual(sandbox.module.exports.packageStatusText("blocked"), "missing required item");
assert.ok(fs.existsSync(`prototype/${nextEpisodeSurface}`), "next episode starter exists as a real screen");
assert.ok(
  html.includes(`const nextEpisodeSurface = "${nextEpisodeSurface}"`),
  "export package handoff declares the next episode handoff target",
);
assert.ok(
  html.includes('<a class="handoff-link" id="startNextEpisode"'),
  "start next episode uses a handoff link instead of a dead button",
);
assert.ok(
  html.includes("function updateNextEpisodeHandoff(destination)"),
  "export package handoff updates the next episode link from package state",
);
assert.ok(
  html.includes("nextEpisodeLink.href = nextEpisodeSurface"),
  "ready next episode action links to the starter screen",
);
assert.ok(
  html.includes('nextEpisodeLink.removeAttribute("href")'),
  "blocked next episode action removes navigation",
);
assert.ok(
  html.includes('nextEpisodeLink.setAttribute("aria-disabled", String(blocked))'),
  "blocked next episode action is exposed as disabled",
);
assert.ok(!html.includes('action === "next"'), "next episode handoff no longer relies on a local-only action");

assert.match(noteText(), /Package ready/);
assert.strictEqual(elements.createReviewCopy.disabled, false);
assert.strictEqual(elements.startNextEpisode.attributes["aria-disabled"], "false");
assert.strictEqual(elements.startNextEpisode.href, nextEpisodeSurface);

elements.downloadPackage.click();
assert.match(noteText(), /Package download prepared/);
assert.match(noteText(), /4 completed items/);
assert.match(noteText(), /1 visible warning report/);

elements.copyMetadata.click();
assert.match(noteText(), /Metadata copied/);
assert.match(noteText(), /Interview split-screen metadata/);

elements.createReviewCopy.click();
assert.match(noteText(), /Review copy created/);

assert.match(
  sandbox.module.exports.actionMessage("download", {
    title: "",
    packages: [["Final video file", "Included", "ready"]],
  }).detail,
  /YouTube full episode package is ready with 1 completed item/,
);

destinationButton("Client review copy").click();
assert.match(elements.status.textContent, /missing required item/);
assert.strictEqual(elements.downloadPackage.disabled, true);
assert.strictEqual(elements.createReviewCopy.disabled, true);
assert.strictEqual(elements.startNextEpisode.attributes["aria-disabled"], "true");
assert.strictEqual(elements.startNextEpisode.href, "");
assert.match(noteText(), /Resolve required item first/);

elements.downloadPackage.click();
assert.match(noteText(), /Resolve required item first/);

elements.createReviewCopy.click();
assert.match(noteText(), /Resolve required item first/);

elements.copyMetadata.click();
assert.match(noteText(), /Metadata copied/);
assert.match(noteText(), /Interview split-screen metadata/);

destinationButton("Archive master").click();
assert.strictEqual(elements.downloadPackage.disabled, false);
assert.strictEqual(elements.createReviewCopy.disabled, false);
assert.strictEqual(elements.startNextEpisode.attributes["aria-disabled"], "false");
assert.strictEqual(elements.startNextEpisode.href, nextEpisodeSurface);
assert.match(noteText(), /Package ready/);
