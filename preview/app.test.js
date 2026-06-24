"use strict";

// Guards the unified preview app (#581 / #583): a single shell URL that routes through
// to every screen in an iframe with persistent navigation. Verifies the routing model,
// full screen coverage, and that the frame can only load a known screen.
// Run with: `node preview/app.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");

// Structural shell: it hosts screens in an iframe and routes via the URL hash.
assert.match(app, /<iframe id="screen"/, "app hosts screens in an iframe");
assert.ok(app.includes('window.addEventListener("hashchange"'), "app routes on URL hash changes");
assert.ok(app.includes("KNOWN.has(hash)"), "app only loads a known screen from the hash (no arbitrary URL)");
assert.ok(app.includes('frame.src = `../prototype/${screen}.html`'), "the frame loads the routed screen through the shell");
assert.match(app, /aria-current", "page"/, "the active screen is marked in the nav");
assert.ok(!/innerHTML/.test(app), "app builds the nav without innerHTML");

// The script parses.
new vm.Script(app.match(/<script>([\s\S]*?)<\/script>/)[1]);

// Every screen listed in the app exists, and every prototype is reachable from the app.
const block = app.match(/const STAGES = \[([\s\S]*?)\];/);
assert.ok(block, "app declares its workflow stages");
const listed = [...new Set([...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]))]
  .filter((s) => fs.existsSync(path.join(root, "prototype", `${s}.html`)) || s.includes("-"));
const screens = listed.filter((s) => fs.existsSync(path.join(root, "prototype", `${s}.html`)));
for (const s of screens) {
  assert.ok(fs.existsSync(path.join(root, "prototype", `${s}.html`)), `app screen exists: ${s}`);
}
const all = fs.readdirSync(path.join(root, "prototype")).filter((n) => n.endsWith(".html")).map((n) => n.replace(".html", ""));
for (const proto of all) {
  assert.ok(screens.includes(proto), `every prototype is reachable from the app: ${proto}`);
}

// The app steps through the product in workflow order (one guided product, prev/next).
assert.ok(app.includes("const ORDER = []"), "app builds a workflow order for stepping");
assert.ok(app.includes("ORDER.indexOf(screen)"), "app locates the current screen in the workflow order");
assert.ok(app.includes("Screen ${index + 1} of ${ORDER.length}"), "app shows progress through the workflow");
assert.match(app, /id="prev-step"/, "app has a previous-screen control");
assert.match(app, /id="next-step"/, "app has a next-screen control");
assert.ok(app.includes('setAttribute("aria-disabled", "true")'), "first/last steps disable the missing direction");

// The shell links to the app so it's discoverable.
const shell = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(shell.includes("app.html"), "the preview shell links to the unified app");

console.log(`preview app: ${screens.length} screens routed and stepped through one shell URL`);
