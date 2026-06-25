"use strict";

// Guards the episode-runtime-shaping hand-off links (#583 / #961): every tightening
// opportunity routes to the screen that owns that edit, rather than trying to make the
// cut in place. The screen's own copy promises "Each routes to the screen that owns the
// edit", so each opportunity must render an "Open <owner> →" link to a real fix screen,
// and the four documented routes must stay wired to their owning screens.
// Run with: `node prototype/episode-runtime-shaping-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "episode-runtime-shaping.html"), "utf8");

// Each opportunity renders a navigable link to its owning fix screen.
assert.ok(
  html.includes('link.className = "fix-link"') && html.includes("link.href = opp.route"),
  "each tightening opportunity renders a link routed to the screen that owns the edit",
);
assert.ok(
  html.includes('"Open " + opp.routeLabel'),
  "the hand-off link names the owning screen it opens",
);

// The opportunities and their owning fix screens are declared in the OPPORTUNITIES data.
const block = html.match(/(?:const|let|var) OPPORTUNITIES = \[([\s\S]*?)\];/);
assert.ok(block, "episode runtime shaping declares its tightening opportunities");
const routes = [...block[1].matchAll(/route:\s*"([^"]+)"/g)].map((m) => m[1]);
assert.ok(routes.length >= 4, "the screen surfaces several tightening opportunities");

// Every route is a real prototype screen — no dead hand-off links.
for (const route of routes) {
  assert.ok(
    fs.existsSync(path.join(dir, route)),
    `runtime-shaping opportunity routes to a real fix screen: ${route}`,
  );
}

// The four documented opportunities route to the screens that own each edit.
const ownedRoutes = {
  "pause-crosstalk-cleanup.html": "long pauses route to pause & cross-talk cleanup",
  "show-segment-system.html": "an over-long segment routes to the show segment system",
  "intro-outro-builder.html": "a long intro routes to the intro & outro builder",
  "transcript-search-navigation.html": "a repeated point routes to transcript search",
};
for (const [route, why] of Object.entries(ownedRoutes)) {
  assert.ok(routes.includes(route), why);
}

// The target is guidance, not a hard cap — runtime shaping must never gate export.
assert.ok(
  html.includes("does not block export") || html.includes("can export at any length"),
  "runtime shaping stays advisory and never blocks export",
);

console.log("episode runtime shaping: every tightening opportunity opens the screen that owns the edit");
