"use strict";

// Shared handoff for the preset visual direction (preset-styles lane). When a creator applies a
// preset style — a layout density, caption presence, visual-moments level, and branding strength —
// this helper carries that applied direction forward so the rest of the visual-direction flow
// (comparison, pacing, safe areas, canvas) can show what was chosen and adapt to it, instead of
// each screen starting from scratch. It mirrors layout-handoff.js: a pure module usable in the
// browser (window.PodcastPresetStyleHandoff) and under Node (module.exports), with a sessionStorage
// save/load plus a query-string fallback.

(function (global) {
  // The presets a creator can apply, and the four plain-language controls each one sets. This is
  // the single source of truth for valid keys and their human labels, kept in step with the preset
  // style picker screen.
  const PRESETS = {
    "calm-interview": "Calm interview",
    "punchy-commentary": "Punchy commentary",
    teaching: "Teaching focused",
    panel: "Panel show",
  };

  const CONTROLS = {
    density: {
      label: "Layout density",
      options: { simple: "Simple", balanced: "Balanced", layered: "Layered" },
    },
    caption: {
      label: "Caption presence",
      options: { minimal: "Minimal", standard: "Standard", high: "High-emphasis" },
    },
    moments: {
      label: "Visual moments",
      options: { restrained: "Restrained", balanced: "Balanced", energetic: "Energetic" },
    },
    brand: {
      label: "Branding strength",
      options: { neutral: "Neutral", "show-branded": "Show-branded", "sponsor-ready": "Sponsor-ready" },
    },
  };
  const CONTROL_ORDER = ["density", "caption", "moments", "brand"];

  const STORAGE_KEY = "pdc-preset-style-handoff";
  const PRESET_QUERY_KEY = "preset";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizePreset(preset) {
    return PRESETS[preset] ? preset : "";
  }

  function normalizeControl(field, value) {
    const def = CONTROLS[field];
    return def && def.options[value] ? value : "";
  }

  // A direction is valid only when the preset and all four controls resolve to known values, so a
  // partial or typo'd direction never travels forward as if it were applied.
  function stateFromRaw(raw) {
    if (!raw) {
      return null;
    }
    const preset = normalizePreset(raw.preset);
    if (!preset) {
      return null;
    }
    const controls = {};
    for (const field of CONTROL_ORDER) {
      const value = normalizeControl(field, raw[field]);
      if (!value) {
        return null;
      }
      controls[field] = value;
    }
    return {
      preset,
      presetLabel: PRESETS[preset],
      density: controls.density,
      caption: controls.caption,
      moments: controls.moments,
      brand: controls.brand,
    };
  }

  function isComplete(raw) {
    return stateFromRaw(raw) !== null;
  }

  function queryForState(raw) {
    const state = stateFromRaw(raw);
    if (!state) {
      return "";
    }
    const params = new URLSearchParams();
    params.set(PRESET_QUERY_KEY, state.preset);
    for (const field of CONTROL_ORDER) {
      params.set(field, state[field]);
    }
    return params.toString();
  }

  function stateFromQuery(rawSearch) {
    const params = new URLSearchParams(String(rawSearch || "").replace(/^\?/, ""));
    return stateFromRaw({
      preset: params.get(PRESET_QUERY_KEY),
      density: params.get("density"),
      caption: params.get("caption"),
      moments: params.get("moments"),
      brand: params.get("brand"),
    });
  }

  function hrefWithState(baseHref, raw) {
    const query = queryForState(raw);
    if (!baseHref || !query) {
      return baseHref || "";
    }
    const [beforeHash, hash = ""] = baseHref.split("#");
    if (!hash) {
      return `${baseHref}${baseHref.includes("?") ? "&" : "?"}${query}`;
    }
    const [screen, search = ""] = hash.split("?");
    const params = new URLSearchParams(search);
    for (const [key, value] of new URLSearchParams(query).entries()) {
      params.set(key, value);
    }
    return `${beforeHash}#${screen}?${params.toString()}`;
  }

  function save(storage, raw) {
    const state = stateFromRaw(raw);
    if (!storage || !state) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // The query-string fallback still carries the applied direction.
    }
  }

  function clear(storage) {
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Clearing is best-effort.
    }
  }

  function stateFromStorage(storage) {
    if (!storage) {
      return null;
    }
    try {
      return stateFromRaw(JSON.parse(storage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  // Prefer the query handoff (the link just followed), then fall back to stored state.
  function load(storage, rawSearch) {
    return stateFromQuery(rawSearch) || stateFromStorage(storage);
  }

  // Creator-facing summary rows for a downstream screen: the applied preset plus each control's
  // human label and value.
  function summaryLines(raw) {
    const state = stateFromRaw(raw);
    if (!state) {
      return [];
    }
    const lines = [`Applied direction: ${state.presetLabel}`];
    for (const field of CONTROL_ORDER) {
      lines.push(`${CONTROLS[field].label}: ${CONTROLS[field].options[state[field]]}`);
    }
    return lines;
  }

  const api = {
    STORAGE_KEY,
    PRESETS,
    CONTROLS,
    CONTROL_ORDER,
    normalizePreset,
    normalizeControl,
    stateFromRaw,
    isComplete,
    queryForState,
    stateFromQuery,
    hrefWithState,
    save,
    clear,
    load,
    summaryLines,
    clone,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  global.PodcastPresetStyleHandoff = api;
}(typeof window !== "undefined" ? window : globalThis));
