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
  "interview handoff keeps required speaker slots in slots; b-roll is carried separately",
);
assert.equal(interview.optionalBroll.name, "intro-card.mp4", "placed b-roll is carried in optionalBroll with its file name");
assert.equal(
  handoff.hrefWithState("./app.html#speaker-role-mapping?path=episode", interview),
  "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest&broll=placed",
  "handoff href carries the chosen layout, required slots, and placed b-roll flag through the app hash",
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
  removeItem(key) {
    delete stored[key];
  },
};
handoff.save(storage, interview);
assert.equal(
  handoff.load(storage, "?path=episode&layout=interview&slots=host,guest").slots[0].name,
  "host-cam.mp4",
  "matching stored handoff restores the placed file names for the current layout-start URL",
);
handoff.clear(storage);
assert.equal(
  handoff.load(storage, "?path=episode&layout=interview&slots=host,guest").slots[0].name,
  "Host video",
  "cleared storage no longer restores stale file names for the same layout-start URL",
);
assert.equal(storage.getItem(handoff.STORAGE_KEY), null, "clear removes the stored layout handoff");
handoff.save(storage, interview);
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
  "Host (host-cam.mp4), Guest (guest-cam.mp4), B-roll (intro-card.mp4)",
  "placement list shows the carried file name for each placed slot including optional b-roll",
);
assert.equal(
  handoff.placementList(handoff.stateFromSlots("panel", [{ slot: "host" }, { slot: "guest" }, { slot: "guest-b" }])),
  "Host, Guest, Guest 2",
  "placement list falls back to slot labels when no real file name carried over",
);
assert.equal(handoff.placementList(null), "", "placement list is empty without handoff state");

// b-roll storage and URL round-trip: save the interview state (with b-roll) and load it back.
const brollStorage = {};
const brollStore = {
  setItem(k, v) { brollStorage[k] = v; },
  getItem(k) { return brollStorage[k] || null; },
  removeItem(k) { delete brollStorage[k]; },
};
handoff.save(brollStore, interview);
const restoredWithBroll = handoff.load(brollStore, "?layout=interview&slots=host,guest&broll=placed");
assert.equal(restoredWithBroll.optionalBroll.name, "intro-card.mp4", "storage round-trip restores b-roll file name");

const restoredNoBroll = handoff.load(brollStore, "?layout=interview&slots=host,guest");
assert.ok(!restoredNoBroll.optionalBroll, "b-roll is not restored when URL does not carry broll=placed");

const urlOnlyBroll = handoff.load(null, "?layout=interview&slots=host,guest&broll=placed");
assert.ok(urlOnlyBroll.optionalBroll, "broll=placed URL param marks b-roll as placed even without storage");

console.log("layout handoff: state, URL, storage, and role-track mapping verified");
