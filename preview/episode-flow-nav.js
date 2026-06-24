"use strict";

// Connects core episode prototype screens back to the preview shell (#583).
// Include from prototype/*.html with:
//   <script src="../preview/episode-flow-nav.js" defer></script>

const EPISODE_FLOW = [
  { file: "source-media-health.html", label: "Source media health" },
  { file: "speaker-sync-repair.html", label: "Speaker sync repair" },
  { file: "audio-cleanup-controls.html", label: "Audio cleanup" },
  { file: "audio-caption-quality-review.html", label: "Caption quality review" },
  { file: "export-readiness-review.html", label: "Export readiness" },
];

const EPISODE_SHELL_PREFIX = 2;
const EPISODE_PREAMBLE = { file: "speaker-role-mapping.html", label: "Speaker roles" };
const EPISODE_HANDOFF = { file: "episode-watch-through-preview.html", label: "Watch-through preview" };
const PREVIEW_APP_EPISODE_TARGETS = new Set([
  screenIdFromFile(EPISODE_PREAMBLE.file),
  ...EPISODE_FLOW.map((step) => screenIdFromFile(step.file)),
  screenIdFromFile(EPISODE_HANDOFF.file),
]);

// Export readiness routes each blocked or needs-review area to the screen that owns
// the fix. Thumbnail work lives on the publish path; the rest stay on episode context.
const EXPORT_READINESS_FIX_PATHS = {
  "speaker-framing-safety.html": "episode",
  "audio-caption-quality-review.html": "episode",
  "audio-cleanup-controls.html": "episode",
  "contextual-broll-moments.html": "episode",
  "layout-safe-areas.html": "episode",
  "episode-chapter-markers.html": "episode",
  "music-cue-setup.html": "episode",
  "thumbnail-cover-frame.html": "publish",
};

const PREVIEW_APP_FIX_TARGETS = new Set(
  Object.keys(EXPORT_READINESS_FIX_PATHS).map((file) => screenIdFromFile(file)),
);

const EPISODE_FLOW_IN_PAGE_TARGETS = new Set([
  screenIdFromFile(EPISODE_PREAMBLE.file),
  ...EPISODE_FLOW.map((step) => screenIdFromFile(step.file)),
]);

// Speaker setup screens that episode flow prototypes hand off to when sync work
// needs attribution review.
const PREVIEW_APP_EPISODE_HANDOFFS = new Map([
  ["speaker-attribution-review", "?path=episode"],
]);

function currentStepIndex() {
  const name = window.location.pathname.split("/").pop() || "";
  return EPISODE_FLOW.findIndex((step) => step.file === name);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppEpisodeTarget(file) {
  return PREVIEW_APP_EPISODE_TARGETS.has(screenIdFromFile(file));
}

function isEmbeddedInPreviewApp() {
  try {
    return window.self !== window.top && /\/preview\/app\.html$/.test(window.top.location.pathname);
  } catch (_) {
    return false;
  }
}

function pathFromQuery(query) {
  return new URLSearchParams((query || "").replace(/^\?/, "")).get("path") || "";
}

function queryWithoutHash(file) {
  return ((file || "").split("#")[0].split("?")[1] || "");
}

function shellPath() {
  const path = new URLSearchParams(window.location.search).get("path");
  if (path === "episode" || path === "publish") {
    return path;
  }
  return "";
}

function pathQuerySuffix() {
  const path = shellPath();
  return path ? `?path=${path}` : "";
}

function routeSearchFromFile(file) {
  const filePath = pathFromQuery(queryWithoutHash(file));
  const path = filePath || shellPath();
  if (path === "episode" || path === "publish") {
    return `?path=${path}`;
  }
  return "";
}

function mergeRouteSearch(file, overrides = {}) {
  const raw = file || "";
  const hashIndex = raw.indexOf("#");
  const pathPart = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : raw.slice(hashIndex);
  const qIndex = pathPart.indexOf("?");
  const base = qIndex === -1 ? pathPart : pathPart.slice(0, qIndex);
  const params = new URLSearchParams(qIndex === -1 ? "" : pathPart.slice(qIndex + 1));

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const search = params.toString();
  return `${base}${search ? `?${search}` : ""}${hash}`;
}

function episodeHandoffSearch(file) {
  const screen = screenIdFromFile(file);
  return PREVIEW_APP_EPISODE_HANDOFFS.has(screen) ? PREVIEW_APP_EPISODE_HANDOFFS.get(screen) : null;
}

function isPreviewAppEpisodeRoute(file) {
  return isPreviewAppEpisodeTarget(file) || episodeHandoffSearch(file) !== null;
}

function previewAppHref(file) {
  const screen = screenIdFromFile(file);
  const handoffSearch = episodeHandoffSearch(file);
  if (handoffSearch !== null) {
    return `../preview/app.html#${screen}${handoffSearch}`;
  }
  return `../preview/app.html#${screen}${routeSearchFromFile(file)}`;
}

function currentPreviewAppHref(step) {
  return previewAppHref(mergeRouteSearch(step.file, shellPath() ? { path: shellPath() } : {}));
}

function hrefWithPath(file) {
  const path = shellPath();
  if (!path) {
    return file;
  }
  if (pathFromQuery(queryWithoutHash(file)) === path) {
    return file;
  }
  return mergeRouteSearch(file, { path });
}

function isLocalScreenHref(href) {
  return Boolean(href) && !href.startsWith("#") && !href.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

function exportReadinessFixBase(href) {
  return (href || "").split("#")[0].split("?")[0];
}

function isExportReadinessFixHref(href) {
  return isLocalScreenHref(href) && Object.prototype.hasOwnProperty.call(
    EXPORT_READINESS_FIX_PATHS,
    exportReadinessFixBase(href),
  );
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setEpisodeScreenLink(link, file) {
  const resolved = hrefWithPath(file);
  if (isEmbeddedInPreviewApp() && isPreviewAppEpisodeRoute(resolved)) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function shouldNormalizeEpisodeHref(href) {
  if (!isLocalScreenHref(href)) {
    return false;
  }
  const screen = screenIdFromFile(href);
  if (EPISODE_FLOW_IN_PAGE_TARGETS.has(screen)) {
    return true;
  }
  if (PREVIEW_APP_EPISODE_HANDOFFS.has(screen)) {
    return isEmbeddedInPreviewApp() || shellPath() === "episode";
  }
  return false;
}

function normalizeEpisodeScreenLink(link) {
  const href = link.getAttribute("href") || "";
  if (!shouldNormalizeEpisodeHref(href)) {
    return;
  }
  setEpisodeScreenLink(link, href);
}

function normalizeEpisodeScreenLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a[href]").forEach(normalizeEpisodeScreenLink);
}

function normalizeEpisodeLinkClick(event) {
  const link = event.target && typeof event.target.closest === "function"
    ? event.target.closest("a[href]")
    : null;
  if (link) {
    normalizeEpisodeScreenLink(link);
  }
}

function setExportReadinessFixLink(link) {
  const href = link.getAttribute("href") || "";
  if (!isExportReadinessFixHref(href)) {
    return;
  }

  const path = EXPORT_READINESS_FIX_PATHS[exportReadinessFixBase(href)];
  const resolved = mergeRouteSearch(href, { path });
  if (isEmbeddedInPreviewApp() && PREVIEW_APP_FIX_TARGETS.has(screenIdFromFile(href))) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function normalizeExportReadinessFixLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a.fix-link[href]").forEach(setExportReadinessFixLink);
}

function renderEpisodeFlowNav() {
  const index = currentStepIndex();
  if (index < 0) {
    return;
  }

  if (document.querySelector(".episode-flow-nav")) {
    return;
  }

  const step = EPISODE_FLOW[index];
  const total = EPISODE_FLOW.length + EPISODE_SHELL_PREFIX;
  const previous = index > 0 ? EPISODE_FLOW[index - 1] : EPISODE_PREAMBLE;
  const next = index < EPISODE_FLOW.length - 1 ? EPISODE_FLOW[index + 1] : null;

  if (!document.getElementById("episode-flow-nav-styles")) {
    const style = document.createElement("style");
    style.id = "episode-flow-nav-styles";
    style.textContent = `
      .episode-flow-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .episode-flow-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px 16px;
        align-items: center;
      }

      .episode-flow-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .episode-flow-nav a:hover {
        text-decoration: underline;
      }

      .episode-flow-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .episode-flow-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .episode-flow-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const nav = document.createElement("nav");
  nav.className = "episode-flow-nav";
  nav.setAttribute("aria-label", "Episode production flow");

  const wrap = document.createElement("div");
  wrap.className = "wrap";

  const home = document.createElement("a");
  home.href = "../preview/index.html";
  setTopTargetWhenEmbedded(home);
  home.textContent = "Episode flow home";

  const guided = document.createElement("a");
  guided.href = "../preview/episode-flow.html";
  setTopTargetWhenEmbedded(guided);
  guided.textContent = "Guided episode flow";

  wrap.appendChild(home);
  wrap.appendChild(guided);

  const app = document.createElement("a");
  app.href = currentPreviewAppHref(step);
  setTopTargetWhenEmbedded(app);
  app.textContent = "Preview app";
  wrap.appendChild(app);

  if (previous) {
    const prevLink = document.createElement("a");
    setEpisodeScreenLink(prevLink, index === 0 ? `${EPISODE_PREAMBLE.file}?path=episode` : previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setEpisodeScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const handoff = document.createElement("a");
    setEpisodeScreenLink(handoff, `${EPISODE_HANDOFF.file}?path=publish`);
    handoff.textContent = `Continue: ${EPISODE_HANDOFF.label}`;
    wrap.appendChild(handoff);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Current step: ${index + 1 + EPISODE_SHELL_PREFIX} of ${total} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
  normalizeExportReadinessFixLinks(document);
  normalizeEpisodeScreenLinks(document);
  if (typeof document.addEventListener === "function") {
    document.addEventListener("click", normalizeEpisodeLinkClick);
  }
}

function initEpisodeFlowNav() {
  renderEpisodeFlowNav();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEpisodeFlowNav);
} else {
  initEpisodeFlowNav();
}
