"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "episode-asset-library.html"), "utf8");

assert.ok(html.includes("../preview/reuse-nav.js"), "asset library loads reuse path navigation");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "asset issues render open-fix-screen links");

const assetBlock = html.match(/const assets = \[([\s\S]*?)\n\s*\];/);
assert.ok(assetBlock, "asset library declares reusable assets");
const fixScreens = [...assetBlock[1].matchAll(/fixScreen:\s*"([a-z0-9-?.=]+\.html(?:\?[a-z0-9=&-]+)?)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 5, "sample assets declare owning fix screens");
for (const file of fixScreens) {
  const localFile = file.split("?")[0];
  assert.ok(fs.existsSync(path.join(dir, localFile)), `fix screen exists: ${localFile}`);
}

assert.ok(fixScreens.includes("guest-profile-reuse.html"), "guest assets route to guest profile reuse");
assert.ok(fixScreens.includes("contextual-broll-moments.html"), "b-roll assets route to contextual b-roll moments");
assert.ok(fixScreens.includes("layout-safe-areas.html"), "sponsor assets route to layout safe areas");
assert.ok(fixScreens.includes("show-template-adaptation.html"), "template assets route to show template adaptation");
assert.ok(fixScreens.includes("thumbnail-cover-frame.html"), "thumbnail assets route to cover frame review");

console.log(`episode asset library: ${fixScreens.length} assets open their owning fix screen`);
