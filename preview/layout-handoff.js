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
        };
      });

    const required = requiredSlotsFor(normalizedLayout);
    if (!required.every((slot) => slots.some((entry) => entry.slot === slot))) {
      return null;
    }

    return {
      layout: normalizedLayout,
      layoutLabel: layouts[normalizedLayout].label,
      slots,
    };
  }

  function stateFromZones(layout, zones) {
    const entries = Array.prototype.slice.call(zones || [])
      .filter((zone) => zone && zone.classList && zone.classList.contains("filled"))
      .map((zone) => ({
        slot: zone.dataset && zone.dataset.slot,
        name: zone.dataset && zone.dataset.fileName,
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

  function load(storage, rawSearch) {
    const params = new URLSearchParams(String(rawSearch || "").replace(/^\?/, ""));
    const queryState = stateFromSlots(params.get("layout"), slotsFromQuery(params.get("slots")).map((slot) => ({ slot })));
    if (!queryState) {
      return null;
    }
    if (!storage) {
      return queryState;
    }
    try {
      const stored = JSON.parse(storage.getItem(STORAGE_KEY) || "null");
      const storedState = stateFromSlots(stored && stored.layout, stored && stored.slots);
      const storedSlots = storedState ? storedState.slots.map((slot) => slot.slot).join(",") : "";
      const querySlots = queryState.slots.map((slot) => slot.slot).join(",");
      return storedState && storedState.layout === queryState.layout && storedSlots === querySlots
        ? storedState
        : queryState;
    } catch (error) {
      return queryState;
    }
  }

  function tracksFromState(state, fallbackTracks) {
    if (!state) {
      return clone(fallbackTracks || []);
    }
    return state.slots.map((slot, index) => ({
      id: `layout-${slot.slot}-${index + 1}`,
      name: slot.name || `${slot.label} video`,
      role: slot.role,
      signal: "file-name",
      decision: slot.role === "host" ? "confirmed" : "suggested",
    }));
  }

  // A creator-facing list of placed slots for the role-mapping summary. When a real
  // file name carried over, show it next to the slot ("Host (host-cam.mp4)") so the
  // creator can confirm the right upload landed; otherwise fall back to the slot label.
  function placementList(state) {
    if (!state || !state.slots || !state.slots.length) {
      return "";
    }
    return state.slots
      .map((slot) => {
        const generic = `${slot.label} video`;
        return slot.name && slot.name !== generic ? `${slot.label} (${slot.name})` : slot.label;
      })
      .join(", ");
  }

  const api = {
    STORAGE_KEY,
    completeSlotQueryForLayout,
    hrefWithState,
    load,
    normalizeLayout,
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
