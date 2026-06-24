"use strict";

(function (root) {
  var FILTERS = [
    { id: "all", label: "All candidates", activeLabel: "All candidates" },
    { id: "active", label: "Show active", activeLabel: "Show all candidates" },
    { id: "approved", label: "Show approved", activeLabel: "Show all candidates" },
    { id: "adjusted", label: "Show adjusted", activeLabel: "Show all candidates" },
    { id: "dismissed", label: "Show dismissed", activeLabel: "Show all candidates" },
  ];

  function nextClipFilter(currentFilter, selectedFilter) {
    return currentFilter === selectedFilter && selectedFilter !== "all" ? "all" : selectedFilter;
  }

  function clipFilterOptions(activeFilter) {
    return FILTERS.map(function (filter) {
      var active = activeFilter === filter.id;
      return {
        id: filter.id,
        label: active ? filter.activeLabel : filter.label,
        pressed: active,
        nextFilter: nextClipFilter(activeFilter, filter.id),
      };
    });
  }

  root.clipCandidateReview = {
    clipFilterOptions: clipFilterOptions,
    nextClipFilter: nextClipFilter,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.clipCandidateReview;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
