"use strict";

// Guards that the preview app carries the publish path context for long-form episode navigation,
// the first step of the publish-prep flow (publish-nav PUBLISH_FLOW[0]). The other nine publish
// screens already keep `path=publish`; long-form alone dropped it, so the app opened the publish
// path's first screen without its context. Behaviour-only: drives the routing module and inspects
// the route search it produces. Kept in its own file so it does not collide with the shared
// app-route-context.test.js. Run with: `node preview/app-route-publish-context.test.js`

const assert = require("assert");
const { createPreviewAppRouting } = require("./app-route-context.js");

// routeSearchFor closes over its screen sets, not the ORDER array, so an empty order suffices.
const routing = createPreviewAppRouting([]);

// The publish path's opening screen now keeps its publish context, like the rest of the flow.
assert.equal(
  routing.routeSearchFor("long-form-navigation", "?path=publish"),
  "?path=publish",
  "long-form navigation keeps the publish path context in the app",
);

// Regression: the screens that already carried it still do.
for (const screen of [
  "episode-watch-through-preview",
  "destination-crop-preview",
  "publish-checklist",
]) {
  assert.equal(
    routing.routeSearchFor(screen, "?path=publish"),
    "?path=publish",
    `${screen} still keeps the publish path context`,
  );
}

// The context is only carried when the creator is actually on the publish path — a different
// path (or none) does not get spuriously tagged onto long-form navigation.
assert.equal(
  routing.routeSearchFor("long-form-navigation", "?path=episode"),
  "",
  "long-form navigation is not tagged with a path it does not belong to",
);
assert.equal(
  routing.routeSearchFor("long-form-navigation", ""),
  "",
  "no incoming path means no path context",
);

console.log("app route publish context: long-form navigation keeps path=publish like the rest of the publish flow");
