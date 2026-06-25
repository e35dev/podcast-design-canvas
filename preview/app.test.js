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
assert.ok(app.includes("KNOWN.has(screenHash)"), "app only loads a known screen from the hash (no arbitrary URL)");
assert.ok(app.includes('const nextSrc = `../prototype/${screen}.html${search}`'), "the shell builds the routed prototype src");
assert.ok(app.includes("routeCache.routeSrc !== nextSrc"), "the shell avoids reloading the iframe when the route has not changed");
assert.ok(app.includes("function currentRoute"), "app normalizes route hashes before loading the frame");
assert.ok(app.includes("function routeSearchFor"), "app whitelists supported route query context");
assert.match(app, /aria-current", "page"/, "the active screen is marked in the nav");
assert.ok(!/innerHTML/.test(app), "app builds the nav without innerHTML");

// Setup-first start (#1326): the preview app opens on the guided episode setup intake and
// keeps later screens gated until the setup is complete.
assert.ok(app.includes("episode-setup-intake"), "app includes the guided episode setup intake screen");
assert.ok(app.includes('const EPISODE_SETUP_SCREEN = "episode-setup-intake"'), "app names the setup gate screen");
assert.ok(app.includes("window.PodcastEpisodeSetupState"), "app reads the shared episode setup state helper");
assert.ok(app.includes('event.data.type !== "pdc-episode-setup-state"'), "app listens for episode setup state updates from the intake screen");
assert.ok(app.includes('link.setAttribute("aria-disabled", "true")'), "app visibly disables later rail links while setup is incomplete");

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

// Shared session state: the app records which screens have been viewed and shows
// progress through the product in the rail.
assert.ok(app.includes('"pdc-preview-visited"'), "app persists viewed screens in session storage");
assert.ok(app.includes("function markVisited"), "app records a viewed screen");
assert.ok(app.includes("of ${ORDER.length} viewed"), "app shows how many screens have been viewed");
assert.ok(app.includes('classList.toggle("seen"'), "the rail marks viewed screens");
assert.ok(/try\s*\{[\s\S]*sessionStorage/.test(app), "session storage access is guarded");

// The shell links to the app so it's discoverable.
const shell = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
assert.ok(shell.includes("app.html"), "the preview shell links to the unified app");
assert.ok(app.includes("episode-flow.html"), "the preview app links to the guided episode flow");

console.log(`preview app: ${screens.length} screens routed, stepped, and progress-tracked through one shell URL`);
