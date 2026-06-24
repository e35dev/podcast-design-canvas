"use strict";

function createPreviewAppRouting(order) {
  const contextualVisuals = new Set([
    "contextual-broll-moments",
    "contextual-title-cards",
    "screen-share-moment-review",
    "sensitive-moment-review",
  ]);
  const visualsEntryContexts = new Set(["cleanup", "style"]);
  const speakerSetupScreens = [
    "speaker-attribution-review",
    "guest-profile-reuse",
    "speaker-visual-match",
    "speaker-eye-line-coherence",
    "off-camera-speaker-presence",
  ];
  const episodeFlowScreens = [
    "source-media-health",
    "speaker-sync-repair",
    "audio-cleanup-controls",
    "audio-caption-quality-review",
    "export-readiness-review",
  ];
  const styleScreens = [
    "preset-style-picker",
    "preset-comparison-preview",
    "preset-pacing-controls",
    "layout-safe-areas",
    "speaker-framing-safety",
    "canvas-layer-controls",
  ];
  const reuseScreens = [
    "show-segment-system",
    "show-template-adaptation",
    "start-from-previous-episode",
    "episode-chapter-markers",
    "intro-outro-builder",
    "episode-runtime-shaping",
  ];
  const musicScreens = [
    "music-cue-setup",
    "music-ducking-under-speech",
  ];
  const cleanupScreens = [
    "pause-crosstalk-cleanup",
    "transcript-glossary",
    "transcript-search-navigation",
    "accessibility-readability-checks",
    "line-pickup-insert",
    "pronunciation-name-review",
    "on-screen-correction-note",
  ];
  const pathedEpisodeScreens = new Set([
    "episode-readiness",
    "speaker-role-mapping",
    ...speakerSetupScreens,
    ...episodeFlowScreens,
    ...styleScreens,
    ...contextualVisuals,
    ...reuseScreens,
    ...musicScreens,
    ...cleanupScreens,
    "destination-crop-preview",
  ]);
  const pathedStyleScreens = new Set([
    ...styleScreens,
    ...contextualVisuals,
  ]);
  const pathedReuseScreens = new Set(reuseScreens);
  const fromContextScreens = new Set([
    ...contextualVisuals,
    ...cleanupScreens,
  ]);
  const pathedIngestScreens = new Set([
    "episode-readiness",
    "speaker-role-mapping",
    "social-context-intake",
    "source-media-health",
  ]);
  const ingestPathContexts = new Set(["episode", "ingest"]);
  const pathedPublishScreens = new Set([
    "episode-watch-through-preview",
    "destination-crop-preview",
    "thumbnail-cover-frame",
    "show-notes-assembly",
    "episode-metadata-publishing",
    "export-package-handoff",
    "clip-candidate-review",
    "client-review-copy-flow",
    "publish-checklist",
  ]);
  const layoutHandoff = typeof globalThis !== "undefined" && globalThis.PodcastLayoutHandoff
    ? globalThis.PodcastLayoutHandoff
    : typeof window !== "undefined" ? window.PodcastLayoutHandoff : null;

  function normalizedLayoutSlots(layout, value) {
    if (!layoutHandoff || typeof layoutHandoff.completeSlotQueryForLayout !== "function") {
      return "";
    }
    return layoutHandoff.completeSlotQueryForLayout(layout, value);
  }

  function routeSearchFor(screen, rawSearch) {
    const params = new URLSearchParams(rawSearch || "");
    const out = new URLSearchParams();
    const from = params.get("from");
    const path = params.get("path");
    const layout = params.get("layout");
    const layoutSlots = normalizedLayoutSlots(layout, params.get("slots"));
    if (fromContextScreens.has(screen) && visualsEntryContexts.has(from)) {
      out.set("from", from);
    }
    if (pathedIngestScreens.has(screen)) {
      if (path === "episode" && screen !== "social-context-intake") {
        out.set("path", "episode");
      }
      if (path === "ingest" && screen !== "source-media-health") {
        out.set("path", "ingest");
      }
    }
    if (path === "episode" && pathedEpisodeScreens.has(screen)) {
      out.set("path", "episode");
    }
    if (path === "style" && pathedStyleScreens.has(screen)) {
      out.set("path", "style");
    }
    if (path === "reuse" && pathedReuseScreens.has(screen)) {
      out.set("path", "reuse");
    }
    if (path === "publish" && pathedPublishScreens.has(screen)) {
      out.set("path", "publish");
    }
    if (screen === "speaker-role-mapping" && path === "episode" && layoutSlots) {
      out.set("layout", layout);
      out.set("slots", layoutSlots);
    }
    const search = out.toString();
    return search ? `?${search}` : "";
  }

  function visualsEntryContext(search) {
    const from = new URLSearchParams((search || "").replace(/^\?/, "")).get("from");
    return visualsEntryContexts.has(from) ? from : "";
  }

  function ingestPathContext(search) {
    const path = new URLSearchParams((search || "").replace(/^\?/, "")).get("path");
    return ingestPathContexts.has(path) ? path : "";
  }

  function routePathContext(search) {
    return new URLSearchParams((search || "").replace(/^\?/, "")).get("path") || "";
  }

  function publishPathContext(search) {
    const path = new URLSearchParams((search || "").replace(/^\?/, "")).get("path");
    return path === "publish" ? path : "";
  }

  function stepWithin(screenOrder, screen, offset, search) {
    const index = screenOrder.indexOf(screen);
    if (index < 0) {
      return null;
    }
    const target = screenOrder[index + offset];
    if (!target) {
      return null;
    }
    return { screen: target, search };
  }

  function stepTarget(screen, index, offset, search) {
    const context = visualsEntryContext(search);
    const pathContext = ingestPathContext(search);
    const routePath = routePathContext(search);
    const publishContext = publishPathContext(search);
    const orderedTarget = order[index + offset];
    if (pathContext === "episode") {
      if (screen === "episode-readiness" && offset < 0) {
        return {};
      }
      if (screen === "episode-readiness" && offset > 0) {
        return { screen: "speaker-role-mapping", search };
      }
      if (screen === "speaker-role-mapping" && offset < 0) {
        return { screen: "episode-readiness", search };
      }
      if (screen === "speaker-role-mapping" && offset > 0) {
        return { screen: "source-media-health", search: "?path=episode" };
      }
      if (screen === "source-media-health" && offset < 0) {
        return { screen: "speaker-role-mapping", search: "?path=episode" };
      }
      if (screen === "source-media-health" && offset > 0) {
        return { screen: "speaker-sync-repair", search };
      }
      const episodeFlowTarget = stepWithin(episodeFlowScreens, screen, offset, search);
      if (episodeFlowTarget) {
        return episodeFlowTarget;
      }
      if (screen === "export-readiness-review" && offset > 0) {
        return { screen: "episode-watch-through-preview", search: "?path=publish" };
      }
    }
    if (pathContext === "ingest") {
      if (screen === "episode-readiness" && offset < 0) {
        return {};
      }
      if (screen === "episode-readiness" && offset > 0) {
        return { screen: "speaker-role-mapping", search };
      }
      if (screen === "speaker-role-mapping" && offset < 0) {
        return { screen: "episode-readiness", search };
      }
      if (screen === "speaker-role-mapping" && offset > 0) {
        return { screen: "social-context-intake", search };
      }
      if (screen === "social-context-intake" && offset < 0) {
        return { screen: "speaker-role-mapping", search };
      }
      if (screen === "social-context-intake" && offset > 0) {
        return { screen: "source-media-health", search: "?path=episode" };
      }
    }
    if (routePath === "episode") {
      const setupTarget = stepWithin(speakerSetupScreens, screen, offset, search);
      if (setupTarget) {
        return setupTarget;
      }
      if (screen === "speaker-attribution-review" && offset < 0) {
        return { screen: "speaker-role-mapping", search };
      }
      if (screen === "off-camera-speaker-presence" && offset > 0) {
        return { screen: "preset-style-picker", search };
      }
      if (screen === "canvas-layer-controls" && offset > 0) {
        return { screen: "contextual-broll-moments", search: "?from=style&path=episode" };
      }
      if (screen === "contextual-broll-moments" && offset < 0 && context === "style") {
        return { screen: "canvas-layer-controls", search };
      }
      if (screen === "sensitive-moment-review" && offset > 0) {
        return { screen: "show-segment-system", search };
      }
      const cleanupTarget = stepWithin(cleanupScreens, screen, offset, search);
      if (cleanupTarget) {
        return cleanupTarget;
      }
      if (screen === "on-screen-correction-note" && offset > 0) {
        return { screen: "contextual-broll-moments", search: `?from=${context || "cleanup"}&path=episode` };
      }
    }
    if (publishContext === "publish" && pathedPublishScreens.has(screen) && pathedPublishScreens.has(orderedTarget)) {
      return { screen: orderedTarget, search };
    }
    if (offset < 0 && screen === "contextual-broll-moments") {
      if (context === "cleanup") {
        return { screen: "on-screen-correction-note", search: routeSearchFor("on-screen-correction-note", search) };
      }
      if (context === "style") {
        return { screen: "canvas-layer-controls", search: routeSearchFor("canvas-layer-controls", search) };
      }
    }
    const targetSearch = routeSearchFor(orderedTarget, search) ? search : "";
    return { screen: orderedTarget, search: targetSearch };
  }

  return { routeSearchFor, stepTarget };
}

if (typeof module !== "undefined") {
  module.exports = { createPreviewAppRouting };
}
