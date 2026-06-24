"use strict";

// Surfaces workflow entry context on the layout-first placement canvas (#1026 / #1131).
// Loaded from layout-first.html before layout-first.js.

const LAYOUT_ENTRY_SOURCES = {
  ingest: {
    label: "Episode ingest setup",
    detail: "Place host and guest videos in the named slots below before continuing production.",
    returnHref: "../prototype/speaker-role-mapping.html?path=ingest",
    returnText: "← Back to speaker roles",
  },
  style: {
    label: "Visual direction path",
    detail: "Place speaker videos in the layout slots before returning to contextual visuals.",
    returnHref: "../prototype/canvas-layer-controls.html?from=style",
    returnText: "← Back to canvas layer controls",
  },
  music: {
    label: "Music cue setup",
    detail: "Place required speaker videos in the layout before setting music cues.",
    returnHref: "../prototype/music-cue-setup.html",
    returnText: "← Back to music cue setup",
  },
};

function readEntryContext(search) {
  const params = new URLSearchParams((search || "").replace(/^\?/, ""));
  const from = params.get("from") || "";
  const source = LAYOUT_ENTRY_SOURCES[from];
  if (!source) {
    return null;
  }
  const path = params.get("path");
  return {
    from,
    path: path || "",
    ...source,
  };
}

function mergeReturnHref(context) {
  if (!context || !context.returnHref) {
    return "";
  }
  if (!context.path) {
    return context.returnHref;
  }
  const raw = context.returnHref;
  const qIndex = raw.indexOf("?");
  const base = qIndex === -1 ? raw : raw.slice(0, qIndex);
  const params = new URLSearchParams(qIndex === -1 ? "" : raw.slice(qIndex + 1));
  params.set("path", context.path);
  const search = params.toString();
  return search ? `${base}?${search}` : base;
}

function applyLayoutEntryContext(options) {
  const readSearch = options.readSearch || (() => (typeof window !== "undefined" ? window.location.search : ""));
  const bannerEl = options.bannerElement;
  const titleEl = options.titleElement;
  const detailEl = options.detailElement;
  const backEl = options.backLinkElement;

  const context = readEntryContext(readSearch());
  if (!context) {
    if (bannerEl) {
      bannerEl.hidden = true;
    }
    return null;
  }

  if (titleEl) {
    titleEl.textContent = context.label;
  }
  if (detailEl) {
    detailEl.textContent = context.detail;
  }
  if (bannerEl) {
    bannerEl.hidden = false;
  }
  if (backEl) {
    backEl.href = mergeReturnHref(context);
    backEl.textContent = context.returnText;
  }
  return context;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    LAYOUT_ENTRY_SOURCES,
    readEntryContext,
    mergeReturnHref,
    applyLayoutEntryContext,
  };
}

if (typeof globalThis !== "undefined") {
  globalThis.applyLayoutEntryContext = applyLayoutEntryContext;
  globalThis.readEntryContext = readEntryContext;
}
