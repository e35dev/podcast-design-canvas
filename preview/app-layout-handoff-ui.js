"use strict";

function createLayoutPlacementSummary(options) {
  const summaryEl = options.summaryElement;
  const handoff = options.handoff || (typeof window !== "undefined" ? window.PodcastLayoutHandoff : null);
  const storage = options.storage || (typeof sessionStorage !== "undefined" ? sessionStorage : null);
  const readHash = options.readHash || (() => (typeof window !== "undefined" ? window.location.hash : ""));

  function rawSearchFromHash() {
    const hash = String(readHash() || "");
    return hash.includes("?") ? hash.slice(hash.indexOf("?")) : "";
  }

  function screenFromHash() {
    const hash = String(readHash() || "").replace(/^#/, "");
    return hash.split("?")[0];
  }

  function update(screen) {
    if (!summaryEl) {
      return;
    }
    const activeScreen = screen || screenFromHash();
    if (!handoff || activeScreen !== "speaker-role-mapping") {
      summaryEl.hidden = true;
      summaryEl.textContent = "";
      return;
    }
    const state = handoff.load(storage, rawSearchFromHash().replace(/^\?/, ""));
    const placements = handoff.placementList(state);
    if (placements) {
      summaryEl.textContent = `Layout placements: ${placements}`;
      summaryEl.hidden = false;
      return;
    }
    summaryEl.hidden = true;
    summaryEl.textContent = "";
  }

  return { update, rawSearchFromHash, screenFromHash };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { createLayoutPlacementSummary };
}
