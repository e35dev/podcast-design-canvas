"use strict";

// Behavior test for optional layout-first b-roll routing in preview app (#1131).
// Standalone so it does not inflate the shared app-route-context.test.js.
// Run: `node preview/app-route-broll-handoff.test.js`

const assert = require("assert");
const handoff = require("./layout-handoff.js");
const { createPreviewAppRouting } = require("./app-route-context.js");

globalThis.PodcastLayoutHandoff = handoff;

const ORDER = [
  "episode-readiness",
  "speaker-role-mapping",
  "source-media-health",
];
const routing = createPreviewAppRouting(ORDER);

const roleSearch = routing.routeSearchFor(
  "speaker-role-mapping",
  "?path=episode&layout=interview&slots=host,guest&broll=placed",
);
assert.equal(
  roleSearch,
  "?path=episode&layout=interview&slots=host%2Cguest&broll=placed",
  "routeSearchFor keeps layout slots and optional b-roll on role mapping",
);

const healthSearch = routing.routeSearchFor(
  "source-media-health",
  "?path=episode&layout=interview&slots=host,guest&broll=placed",
);
assert.equal(
  healthSearch,
  "?path=episode",
  "routeSearchFor drops layout and b-roll params before later episode screens",
);

const fromReadiness = routing.stepTarget(
  "episode-readiness",
  0,
  1,
  "?path=episode&layout=solo&slots=host&broll=placed",
);
assert.equal(fromReadiness.screen, "speaker-role-mapping");
assert.equal(
  fromReadiness.search,
  "?path=episode&layout=solo&slots=host&broll=placed",
  "stepping forward from episode readiness preserves optional b-roll on role mapping",
);

const withoutBroll = routing.routeSearchFor(
  "speaker-role-mapping",
  "?path=episode&layout=interview&slots=host,guest",
);
assert.equal(
  withoutBroll,
  "?path=episode&layout=interview&slots=host%2Cguest",
  "role mapping route omits b-roll when the layout-first canvas left it empty",
);

const bogusBroll = routing.routeSearchFor(
  "speaker-role-mapping",
  "?path=episode&layout=interview&slots=host,guest&broll=yes",
);
assert.equal(
  bogusBroll,
  "?path=episode&layout=interview&slots=host%2Cguest",
  "only the canonical broll=placed flag is forwarded from layout-first",
);

const panelHandoff = routing.routeSearchFor(
  "speaker-role-mapping",
  "?path=episode&layout=panel&slots=host,guest,guest-b&broll=placed",
);
assert.match(panelHandoff, /layout=panel/, "panel layout handoff survives with optional b-roll");
assert.match(panelHandoff, /broll=placed/, "panel layout handoff keeps optional b-roll on role mapping");

console.log("app-route broll handoff: optional b-roll flag routes to role mapping only");
