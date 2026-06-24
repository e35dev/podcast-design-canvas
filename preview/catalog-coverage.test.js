"use strict";

// Coverage guard for the full screen catalog at the repo root (#581 / #583): every
// prototype screen must be reachable from the catalog, and every screen the catalog
// lists must resolve to a real file. The catalog builds its links from a `stages` data
// array, so this checks that array stays complete as screens are added.
// Run with: `node preview/catalog-coverage.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const catalog = fs.readFileSync(path.join(root, "index.html"), "utf8");

// Slugs listed in the catalog's stages array (first item of each ["slug", "Label", "desc"]).
const stagesBlock = catalog.match(/const stages = \[([\s\S]*?)\];/);
assert.ok(stagesBlock, "catalog declares a stages data array");
const listed = new Set(
  [...stagesBlock[1].matchAll(/\["([a-z0-9-]+)",/g)].map((m) => m[1]),
);

const prototypes = fs
  .readdirSync(path.join(root, "prototype"))
  .filter((name) => name.endsWith(".html"))
  .map((name) => name.replace(".html", ""));

// 1) Every prototype is reachable from the catalog.
for (const proto of prototypes) {
  assert.ok(listed.has(proto), `catalog lists prototype: ${proto}`);
}

// 2) Every screen the catalog lists resolves to a real prototype file.
for (const slug of listed) {
  assert.ok(
    fs.existsSync(path.join(root, "prototype", `${slug}.html`)),
    `catalog screen resolves to a real file: ${slug}`,
  );
}

console.log(`catalog coverage: all ${prototypes.length} prototypes reachable from the full screen catalog`);
