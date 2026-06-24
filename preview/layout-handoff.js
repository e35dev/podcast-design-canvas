"use strict";

(function (global) {
  const layouts = {
    interview: {
      label: "Interview layout",
      roles: {
        host: "host",
        guest: "guest",
      },
    },
    solo: {
      label: "Solo layout",
      roles: {
        host: "host",
      },
    },
    panel: {
      label: "Panel layout",
      roles: {
        host: "host",
        guest: "guest",
        "guest-b": "guest",
      },
    },
  };

  const slotLabels = {
    host: "Host",
    guest: "Guest",
    "guest-b": "Guest 2",
    broll: "Optional b-roll",
  };

  const STORAGE_KEY = "pdc-layout-first-handoff";
  const validSlots = new Set(Object.keys(slotLabels));

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeLayout(layout) {
    return layouts[layout] ? layout : "";
  }

  function normalizeSlots(slots) {
    const seen = new Set();
    return (slots || [])
      .filter((slot) => {
        if (!validSlots.has(slot) || seen.has(slot)) {
          return false;
        }
        seen.add(slot);
        return true;
      })
      .filter((slot) => slot !== "broll");
  }

  function slotsFromQuery(value) {
    return normalizeSlots(String(value || "").split(",").filter(Boolean));
  }

  function requiredSlotsFor(layout) {
    const normalized = normalizeLayout(layout);
    return normalized ? Object.keys(layouts[normalized].roles) : [];
  }

  function optionalBrollFromEntries(entries) {
    const entry = (entries || []).find((candidate) => candidate.slot === "broll");
    if (!entry || !entry.name) {
      return null;
    }
    return {
      slot: "broll",
      label: slotLabels.broll,
      name: entry.name,
      sig: entry.sig || "",
    };
  }

  function stateFromSlots(layout, slotEntries) {
    const normalizedLayout = normalizeLayout(layout);
    if (!normalizedLayout) {
      return null;
    }

    const entries = slotEntries || [];
    const roles = layouts[normalizedLayout].roles;
    const slots = normalizeSlots(entries.map((entry) => entry.slot))
      .filter((slot) => roles[slot])
      .map((slot) => {
        const entry = entries.find((candidate) => candidate.slot === slot) || {};
        return {
          slot,
          label: slotLabels[slot],
          role: roles[slot],
          name: entry.name || `${slotLabels[slot]} video`,
          // Carry the recording's identity so production can tell whether two speaker
          // slots hold the SAME source recording (a different problem than a name clash).
          sig: entry.sig || "",
        };
      });

    const required = requiredSlotsFor(normalizedLayout);
    if (!required.every((slot) => slots.some((entry) => entry.slot === slot))) {
      return null;
    }

    const optionalBroll = optionalBrollFromEntries(entries);
    const state = {
      layout: normalizedLayout,
      layoutLabel: layouts[normalizedLayout].label,
      slots,
    };
    if (optionalBroll) {
      state.optionalBroll = optionalBroll;
    }
    return state;
  }

  function stateFromZones(layout, zones) {
    const entries = Array.prototype.slice.call(zones || [])
      .filter((zone) => zone && zone.classList && zone.classList.contains("filled"))
      .map((zone) => ({
        slot: zone.dataset && zone.dataset.slot,
        name: zone.dataset && zone.dataset.fileName,
        sig: zone.dataset && zone.dataset.fileSig,
      }));
    return stateFromSlots(layout, entries);
  }

  function queryForState(state) {
    if (!state || !normalizeLayout(state.layout)) {
      return "";
    }
    const slots = normalizeSlots((state.slots || []).map((entry) => entry.slot));
    if (!slots.length) {
      return "";
    }
    const params = new URLSearchParams();
    params.set("layout", state.layout);
    params.set("slots", slots.join(","));
    if (state.optionalBroll) {
      params.set("broll", "placed");
    }
    return params.toString();
  }

  function completeSlotQueryForLayout(layout, value) {
    const normalizedLayout = normalizeLayout(layout);
    if (!normalizedLayout) {
      return "";
    }
    const incoming = new Set(slotsFromQuery(value));
    const required = requiredSlotsFor(normalizedLayout);
    return required.every((slot) => incoming.has(slot)) ? required.join(",") : "";
  }

  function hrefWithState(baseHref, state) {
    const query = queryForState(state);
    if (!baseHref || !query) {
      return baseHref || "";
    }
    const [beforeHash, hash = ""] = baseHref.split("#");
    if (!hash) {
      return `${baseHref}${baseHref.includes("?") ? "&" : "?"}${query}`;
    }
    const [screen, search = ""] = hash.split("?");
    const params = new URLSearchParams(search);
    const handoffParams = new URLSearchParams(query);
    for (const [key, value] of handoffParams.entries()) {
      params.set(key, value);
    }
    return `${beforeHash}#${screen}?${params.toString()}`;
  }

  function save(storage, state) {
    if (!storage || !state) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // The query-string fallback still carries the chosen layout and slots.
    }
  }

  function clear(storage) {
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Clearing is best-effort; the URL handoff still reflects the visible slots.
    }
  }

  function withOptionalBrollFlag(state, placed) {
    if (!state || !placed || state.optionalBroll) {
      return state;
    }
    const flagged = clone(state);
    flagged.optionalBroll = {
      slot: "broll",
      label: slotLabels.broll,
      name: "",
      sig: "",
    };
    return flagged;
  }

  function load(storage, rawSearch) {
    const params = new URLSearchParams(String(rawSearch || "").replace(/^\?/, ""));
    const queryState = stateFromSlots(params.get("layout"), slotsFromQuery(params.get("slots")).map((slot) => ({ slot })));
    if (!queryState) {
      return null;
    }
    const queryHasBroll = params.get("broll") === "placed";
    const queryStateWithBroll = withOptionalBrollFlag(queryState, queryHasBroll);
    if (!storage) {
      return queryStateWithBroll;
    }
    try {
      const stored = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
      const storedState = stored && stored.layout
        ? stateFromSlots(stored.layout, stored.slots || [])
        : null;
      if (storedState && stored.optionalBroll) {
        storedState.optionalBroll = clone(stored.optionalBroll);
      }
      // Compare the slot sets, not their order. The stored state preserves the order the creator
      // placed videos, while the URL slots come back in layout-definition order (via
      // completeSlotQueryForLayout / routeSearchFor). Comparing ordered joins would miss a match
      // for an out-of-order placement and drop the carried file names, so sort before comparing.
      const storedSlots = storedState ? storedState.slots.map((slot) => slot.slot).sort().join(",") : "";
      const querySlots = queryState.slots.map((slot) => slot.slot).sort().join(",");
      const brollMatches = Boolean(storedState && storedState.optionalBroll) === queryHasBroll;
      if (
        storedState
        && storedState.layout === queryState.layout
        && storedSlots === querySlots
        && brollMatches
      ) {
        return storedState;
      }
      return queryStateWithBroll;
    } catch (error) {
      return queryStateWithBroll;
    }
  }

  function tracksFromState(state, fallbackTracks) {
    if (!state) {
      return clone(fallbackTracks || []);
    }
    // Carried tracks always start "suggested", never "confirmed" — including the host. The role
    // came from the layout slot→role table, not from anything the creator reviewed, and the
    // role-mapping screen promises "a track is never locked into a role you have not seen." Seeding
    // the host as confirmed let a solo handoff (one host slot) reach an overall "ready" gate with
    // zero review; making every carried track suggested keeps the one-tap confirm the screen needs.
    return state.slots.map((slot, index) => ({
      id: `layout-${slot.slot}-${index + 1}`,
      name: slot.name || `${slot.label} video`,
      role: slot.role,
      sig: slot.sig || "",
      signal: "file-name",
      decision: "suggested",
    }));
  }

  function acceptsAssignedTrack(track, predicate) {
    if (!track || !track.sig) {
      return false;
    }
    if (typeof predicate === "function") {
      return Boolean(predicate(track));
    }
    return Boolean(track.role);
  }

  function assignedSourceCounts(tracks, predicate) {
    const counts = {};
    (tracks || []).forEach((track) => {
      if (!acceptsAssignedTrack(track, predicate)) {
        return;
      }
      counts[track.sig] = (counts[track.sig] || 0) + 1;
    });
    return counts;
  }

  function assignedSourceNames(tracks, sig, predicate) {
    return (tracks || [])
      .filter((track) => acceptsAssignedTrack(track, predicate) && track.sig === sig)
      .map((track) => track.name);
  }

  // A creator-facing list of placed slots for the role-mapping summary. When a real
  // file name carried over, show it next to the slot ("Host (host-cam.mp4)") so the
  // creator can confirm the right upload landed; otherwise fall back to the slot label.
  function placementList(state) {
    if (!state || !state.slots || !state.slots.length) {
      return "";
    }
    const parts = state.slots.map((slot) => {
      const generic = `${slot.label} video`;
      return slot.name && slot.name !== generic ? `${slot.label} (${slot.name})` : slot.label;
    });
    if (state.optionalBroll) {
      parts.push(state.optionalBroll.name ? `Optional b-roll (${state.optionalBroll.name})` : "Optional b-roll");
    }
    return parts.join(", ");
  }

  const api = {
    STORAGE_KEY,
    assignedSourceCounts,
    assignedSourceNames,
    completeSlotQueryForLayout,
    clear,
    hrefWithState,
    load,
    normalizeLayout,
    optionalBrollFromEntries,
    placementList,
    queryForState,
    requiredSlotsFor,
    save,
    stateFromSlots,
    stateFromZones,
    tracksFromState,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  global.PodcastLayoutHandoff = api;
}(typeof window !== "undefined" ? window : globalThis));
