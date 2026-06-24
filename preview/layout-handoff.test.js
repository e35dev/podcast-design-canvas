"use strict";

// Guards the layout-first handoff state shared by the start page and role mapping.
// Run with: `node preview/layout-handoff.test.js`

const assert = require("assert");

const handoff = require("./layout-handoff.js");

function zone(slot, name, filled = true) {
  return {
    dataset: { slot, fileName: name },
    classList: {
      contains(className) {
        return className === "filled" && filled;
      },
    },
  };
}

const interview = handoff.stateFromZones("interview", [
  zone("host", "host-cam.mp4"),
  zone("guest", "guest-cam.mp4"),
  zone("broll", "intro-card.mp4"),
]);

assert.deepEqual(
  interview.slots.map((slot) => [slot.slot, slot.name, slot.role]),
  [
    ["host", "host-cam.mp4", "host"],
    ["guest", "guest-cam.mp4", "guest"],
  ],
  "interview handoff keeps required speaker slots and ignores optional b-roll",
);
assert.equal(
  handoff.hrefWithState("./app.html#speaker-role-mapping?path=episode", interview),
  "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest",
  "handoff href carries the chosen layout and required slots through the app hash",
);
assert.equal(
  handoff.completeSlotQueryForLayout("interview", "host,guest,broll"),
  "host,guest",
  "shared route validation keeps required slots and excludes optional b-roll",
);
assert.equal(
  handoff.completeSlotQueryForLayout("panel", "host,guest"),
  "",
  "shared route validation rejects incomplete layout-start handoffs",
);

const stored = {};
const storage = {
  setItem(key, value) {
    stored[key] = value;
  },
  getItem(key) {
    return stored[key] || null;
  },
};
handoff.save(storage, interview);
assert.equal(
  handoff.load(storage, "?path=episode&layout=interview&slots=host,guest").slots[0].name,
  "host-cam.mp4",
  "matching stored handoff restores the placed file names for the current layout-start URL",
);
assert.equal(
  handoff.load(storage, "?path=episode&layout=solo&slots=host").layout,
  "solo",
  "fresh query handoff wins when stored state is for another layout",
);
assert.equal(
  handoff.load(storage, "?path=episode"),
  null,
  "stored handoff is not reused for a generic episode-flow role mapping URL",
);
assert.equal(
  handoff.load(storage, "?path=episode&layout=panel&slots=host,guest"),
  null,
  "invalid query slots are rejected instead of falling back to stale stored state",
);

const panelTracks = handoff.tracksFromState(
  handoff.stateFromSlots("panel", [{ slot: "host" }, { slot: "guest" }, { slot: "guest-b" }]),
  [],
);
assert.deepEqual(
  panelTracks.map((track) => [track.name, track.role]),
  [
    ["Host video", "host"],
    ["Guest video", "guest"],
    ["Guest 2 video", "guest"],
  ],
  "role mapping can seed tracks from the selected layout slots",
);

assert.equal(handoff.stateFromSlots("panel", [{ slot: "host" }, { slot: "guest" }]), null);
assert.equal(handoff.stateFromSlots("unknown", [{ slot: "host" }]), null);

assert.equal(
  handoff.placementList(interview),
  "Host (host-cam.mp4), Guest (guest-cam.mp4)",
  "placement list shows the carried file name next to each placed slot",
);
assert.equal(
  handoff.placementList(handoff.stateFromSlots("panel", [{ slot: "host" }, { slot: "guest" }, { slot: "guest-b" }])),
  "Host, Guest, Guest 2",
  "placement list falls back to slot labels when no real file name carried over",
);
assert.equal(handoff.placementList(null), "", "placement list is empty without handoff state");

console.log("layout handoff: state, URL, storage, and role-track mapping verified");
