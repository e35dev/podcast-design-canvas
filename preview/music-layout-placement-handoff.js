"use strict";

// Builds layout-first placement entry links from the music cue path (#583).
// Loaded before music-nav.js on music prototype screens.

function createMusicLayoutPlacementHandoff(options) {
  const readSearch = options.readSearch || (() => (typeof window !== "undefined" ? window.location.search : ""));
  const setTopTarget = options.setTopTarget || (() => {});

  function shellPath() {
    return new URLSearchParams(readSearch()).get("path") || "";
  }

  function layoutFirstPlacementSearch() {
    const params = new URLSearchParams();
    const path = shellPath();
    if (path === "episode") {
      params.set("path", path);
    }
    params.set("from", "music");
    const search = params.toString();
    return search ? `?${search}` : "";
  }

  function layoutFirstPlacementHref() {
    return `../preview/layout-first.html${layoutFirstPlacementSearch()}`;
  }

  function shouldOfferOnStep(stepId) {
    return stepId === "music-cue-setup";
  }

  function applyPlacementLink(link) {
    if (!link) {
      return;
    }
    link.href = layoutFirstPlacementHref();
    setTopTarget(link);
  }

  return {
    shellPath,
    layoutFirstPlacementSearch,
    layoutFirstPlacementHref,
    shouldOfferOnStep,
    applyPlacementLink,
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createMusicLayoutPlacementHandoff };
}

if (typeof globalThis !== "undefined") {
  globalThis.createMusicLayoutPlacementHandoff = createMusicLayoutPlacementHandoff;
}
