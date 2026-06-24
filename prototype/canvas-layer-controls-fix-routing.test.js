"use strict";

// Guards canvas layer control hand-off links (#583): caption overlap reviews open
// layout safe areas, where caption and overlay placement is owned. Also verifies the
// layer lock contract: a locked layer cannot be reordered or displaced.
// Run with: `node prototype/canvas-layer-controls-fix-routing.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "canvas-layer-controls.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const styleNav = fs.readFileSync(path.join(root, "preview", "style-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/canvas-layer-controls.html"),
  "canvas layer controls is reachable from the preview shell",
);
assert.ok(
  styleNav.includes('id: "canvas-layer-controls"'),
  "canvas layer controls is part of the connected visual direction path",
);
assert.ok(
  shell.includes("../prototype/layout-safe-areas.html"),
  "layout safe areas is reachable from the preview shell",
);

assert.ok(html.includes('fixScreen: "layout-safe-areas.html"'), "caption overlap reviews route to layout safe areas");
assert.ok(html.includes('fixLabel: "layout safe areas"'), "caption overlap reviews name the fix screen in creator-facing copy");
assert.ok(
  fs.existsSync(path.join(__dirname, "layout-safe-areas.html")),
  "layout safe areas exists as a real screen",
);

assert.ok(
  shell.includes("../prototype/speaker-framing-safety.html"),
  "speaker framing safety is reachable from the preview shell",
);
assert.ok(
  html.includes('fixScreen: "speaker-framing-safety.html"'),
  "hidden-speaker checks route to speaker framing safety, where speaker visibility is owned",
);
assert.ok(
  html.includes('fixLabel: "speaker framing safety"'),
  "hidden-speaker checks name the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "speaker-framing-safety.html")),
  "speaker framing safety exists as a real screen",
);

assert.ok(html.includes('class: "fix-link"'), "canvas layer controls renders fix links with shared styling");
assert.ok(html.includes("c.fixScreen && c.fixLabel"), "fix link rendering requires target and label");

// Lock contract: locking a layer must keep it "from moving by accident" (the screen's own
// copy and the production-gate check both promise this). Drive the page's pure reorder helper.
const M = loadLayerLogic();
const reorderLayers = M.reorderLayers;
const sample = M.sampleLayers();
const order = (list) => list.map((layer) => layer.id);

const lockedIndex = sample.findIndex((layer) => layer.locked);
assert.ok(lockedIndex >= 0, "the sample ships a locked layer to exercise the contract");

// A locked layer cannot move itself.
assert.deepEqual(
  order(reorderLayers(sample, lockedIndex, -1)),
  order(sample),
  "a locked layer cannot be moved up",
);
assert.deepEqual(
  order(reorderLayers(sample, lockedIndex, 1)),
  order(sample),
  "a locked layer cannot be moved down",
);

// A locked layer cannot be displaced by moving an unlocked neighbor into its slot.
const neighborIntoLock = sample.findIndex((layer, i) => !layer.locked && sample[i + 1] && sample[i + 1].locked);
assert.ok(neighborIntoLock >= 0, "the sample has an unlocked layer directly above the locked one");
assert.deepEqual(
  order(reorderLayers(sample, neighborIntoLock, 1)),
  order(sample),
  "an unlocked neighbor cannot displace a locked layer",
);

// Normal unlocked reorders still work (guard against over-blocking) and don't mutate the input.
const unlockedReorder = reorderLayers(sample, 0, 1);
assert.deepEqual(order(unlockedReorder), [sample[1].id, sample[0].id, sample[2].id, sample[3].id, sample[4].id], "two unlocked layers reorder normally");
assert.deepEqual(order(sample), ["l1", "l2", "l3", "l4", "l5"], "reorderLayers does not mutate its input");

// Out-of-range moves are no-ops.
assert.deepEqual(order(reorderLayers(sample, 0, -1)), order(sample), "moving the top layer up is a no-op");

console.log("canvas layer controls: caption overlap opens layout safe areas; hidden speakers open speaker framing safety; locked layers cannot reorder");

function loadLayerLogic() {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  function makeNode() {
    const node = {
      _children: [], style: {}, dataset: {}, textContent: "", value: "", disabled: false,
      set className(v) { this._cls = v; }, get className() { return this._cls; },
      setAttribute() {}, getAttribute() { return null; }, addEventListener() {},
      appendChild(c) { this._children.push(c); return c; },
      append(...cs) { this._children.push(...cs); },
      replaceChildren(...cs) { this._children = cs; },
      querySelector() { return makeNode(); }, querySelectorAll() { return []; },
    };
    return node;
  }
  const roots = {};
  ["#layers", "#stage", "#status", "#checks", "#reuse", "#saveLayout", "#applied", "#addLayer", "#addType", "#reset"]
    .forEach((sel) => { roots[sel] = makeNode(); });
  const documentStub = { createElement: () => makeNode(), createTextNode: (t) => ({ textContent: t }), querySelector: (sel) => roots[sel] || makeNode() };
  const sandbox = { document: documentStub, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() on the sample — must not throw
  assert.strictEqual(typeof sandbox.module.exports.reorderLayers, "function", "canvas layer controls exports reorderLayers");
  return sandbox.module.exports;
}
