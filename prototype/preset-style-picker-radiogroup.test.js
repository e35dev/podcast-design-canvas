"use strict";

// Guards that the preset style picker is an accessible radio group: single-select options
// expose role="radio" + aria-checked, a roving tabindex makes it one tab stop, and the arrow
// keys move between presets and apply the one focus lands on. Run with:
//   `node prototype/preset-style-picker-radiogroup.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "preset-style-picker.html"), "utf8");

// Markup: the picker container is a radio group and no longer uses toggle-button aria-pressed.
assert.match(
  html,
  /id="presets"[^>]*role="radiogroup"/,
  "the preset picker container is a radio group, matching its single-select behavior",
);
assert.ok(
  html.includes('button.setAttribute("role", "radio")'),
  "each preset option is rendered as a radio",
);
assert.ok(
  html.includes('button.setAttribute("aria-checked"'),
  "preset selection is expressed with aria-checked",
);
assert.ok(
  html.includes("aria-keyshortcuts"),
  "preset options advertise their arrow-key shortcuts",
);
assert.doesNotMatch(
  html,
  /aria-pressed/,
  "the preset picker no longer uses toggle-button aria-pressed semantics",
);

// Behavioral: render the picker and confirm arrow-key navigation moves the checked option.
function makeNode(tag) {
  const attrs = {};
  const node = {
    tagName: tag, _children: [], dataset: {}, style: {},
    className: "", textContent: "", value: "", hidden: false, type: "",
    innerHTML: "", listeners: {},
    setAttribute(name, value) { attrs[name] = String(value); },
    getAttribute(name) { return name in attrs ? attrs[name] : null; },
    removeAttribute(name) { delete attrs[name]; },
    addEventListener(type, handler) { node.listeners[type] = handler; },
    append(...children) { node._children.push(...children); },
    appendChild(child) { node._children.push(child); return child; },
    replaceChildren(...children) { node._children = children; },
    get children() { return node._children; },
    querySelector() { return makeNode("div"); },
    querySelectorAll() { return []; },
    focus() { node._focused = true; },
  };
  return node;
}

const roots = {};
["#presets", "#controls", "#preview", "#direction", "#applied", "#apply", "#reset"].forEach((selector) => {
  roots[selector] = makeNode("div");
});
const documentStub = {
  createElement: (tag) => makeNode(tag),
  querySelector: (selector) => roots[selector] || makeNode("div"),
};
const sandbox = {
  document: documentStub,
  window: { location: { search: "" } },
  structuredClone: globalThis.structuredClone,
  console,
};
vm.createContext(sandbox);
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], sandbox);

const presets = roots["#presets"];
const buttons = presets._children;
assert.ok(buttons.length >= 2, "the picker renders the preset options");
assert.ok(buttons.every((b) => b.getAttribute("role") === "radio"), "every preset option is a radio");

const checked = buttons.map((b) => b.getAttribute("aria-checked") === "true");
assert.strictEqual(checked.filter(Boolean).length, 1, "exactly one preset is checked at a time");
const activeIndex = checked.indexOf(true);
assert.strictEqual(buttons[activeIndex].getAttribute("tabindex"), "0", "the checked preset is the picker's tab stop");
assert.ok(
  buttons.every((b, i) => i === activeIndex || b.getAttribute("tabindex") === "-1"),
  "unchecked presets are removed from the tab order (roving tabindex)",
);

// ArrowRight on the active option moves selection to the next preset and re-renders.
buttons[activeIndex].listeners.keydown({ key: "ArrowRight", preventDefault() {} });
const after = presets._children;
const nextIndex = (activeIndex + 1) % after.length;
assert.strictEqual(
  after[nextIndex].getAttribute("aria-checked"),
  "true",
  "ArrowRight applies the next preset",
);
assert.strictEqual(
  after.filter((b) => b.getAttribute("aria-checked") === "true").length,
  1,
  "still exactly one preset is checked after arrow navigation",
);

console.log("preset style picker: radio-group semantics + arrow-key navigation verified");
