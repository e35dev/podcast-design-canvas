"use strict";

// Connects the "make it reusable" prototype screens into a short path (#583).
// Include from reuse prototypes with:
//   <body data-reuse-step="show-segment-system">
//   <script src="../preview/reuse-nav.js" defer></script>

const REUSE_FLOW = [
  { id: "show-segment-system", file: "show-segment-system.html", label: "Show segment system" },
  { id: "show-template-adaptation", file: "show-template-adaptation.html", label: "Show template adaptation" },
  { id: "start-from-previous-episode", file: "start-from-previous-episode.html", label: "Start from previous episode" },
  { id: "episode-chapter-markers", file: "episode-chapter-markers.html", label: "Episode chapter markers" },
  { id: "intro-outro-builder", file: "intro-outro-builder.html", label: "Intro & outro builder" },
  { id: "episode-runtime-shaping", file: "episode-runtime-shaping.html", label: "Episode runtime shaping" },
];

const REUSE_ENTRY = { file: "sensitive-moment-review.html", label: "Sensitive moment review" };
const REUSE_HANDOFF = { file: "episode-watch-through-preview.html", label: "Episode watch-through" };

// Reuse screens hand off to these owning screens when a review item needs a fix.
const REUSE_FIX_PATHS = {
  "music-cue-setup.html": "episode",
  "social-context-intake.html": "episode",
  "pause-crosstalk-cleanup.html": "episode",
  "transcript-search-navigation.html": "episode",
};

const PREVIEW_APP_REUSE_TARGETS = new Set([
  screenIdFromFile(REUSE_ENTRY.file),
  screenIdFromFile(REUSE_HANDOFF.file),
  ...REUSE_FLOW.map((step) => step.id),
]);

const PREVIEW_APP_CROSS_PATH_TARGETS = new Set(
  Object.keys(REUSE_FIX_PATHS).map((file) => screenIdFromFile(file)),
);

function currentReuseIndex() {
  const fromBody = document.body.dataset.reuseStep;
  if (fromBody) {
    const byId = REUSE_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return REUSE_FLOW.findIndex((step) => step.file === name);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppReuseTarget(file) {
  return PREVIEW_APP_REUSE_TARGETS.has(screenIdFromFile(file));
}

function isEmbeddedInPreviewApp() {
  try {
    return window.self !== window.top && /\/preview\/app\.html$/.test(window.top.location.pathname);
  } catch (_) {
    return false;
  }
}

function previewAppHref(file) {
  return `../preview/app.html#${screenIdFromFile(file)}${routeSearchFromFile(file)}`;
}

function currentPreviewAppHref(step) {
  return previewAppHref(hrefWithPath(step.file));
}

function pathFromQuery(query) {
  return new URLSearchParams((query || "").replace(/^\?/, "")).get("path") || "";
}

function queryWithoutHash(file) {
  return ((file || "").split("#")[0].split("?")[1] || "");
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

function routeSearchFromFile(file) {
  const filePath = pathFromQuery(queryWithoutHash(file));
  const shellPath = pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  const path = filePath || shellPath;
  return path === "episode" || path === "reuse" ? `?path=${path}` : "";
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

// Keep the episode workflow path (?path=...) on reuse links so a creator who entered
// the reuse step from the guided episode path stays in that context, matching the
// other flow navs (ingest, speaker setup, episode flow).
function pathQuerySuffix() {
  const path = new URLSearchParams(window.location.search).get("path");
  if (path === "episode") {
    return "?path=episode";
  }
  if (path === "reuse") {
    return "?path=reuse";
  }
  return "";
}

function hrefWithPath(file) {
  const shellPath = new URLSearchParams(window.location.search).get("path");
  if (shellPath !== "episode" && shellPath !== "reuse") {
    return file;
  }
  if (pathFromQuery(queryWithoutHash(file)) === shellPath) {
    return file;
  }
  return mergeRouteSearch(file, { path: shellPath });
}

function linkBase(href) {
  return (href || "").split("#")[0].split("?")[0];
}

function resolveReuseLink(file) {
  const base = linkBase(file);
  if (Object.prototype.hasOwnProperty.call(REUSE_FIX_PATHS, base)) {
    return mergeRouteSearch(file, { path: REUSE_FIX_PATHS[base] });
  }
  return hrefWithPath(file);
}

function routesThroughPreviewApp(file) {
  return isPreviewAppReuseTarget(file) || PREVIEW_APP_CROSS_PATH_TARGETS.has(screenIdFromFile(file));
}

function isLocalScreenHref(href) {
  return Boolean(href) && !href.startsWith("#") && !href.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

function shouldNormalizeReuseHref(href) {
  return isLocalScreenHref(href) && (
    isPreviewAppReuseTarget(href) ||
    Object.prototype.hasOwnProperty.call(REUSE_FIX_PATHS, linkBase(href))
  );
}

function setReuseScreenLink(link, file) {
  const resolved = resolveReuseLink(file);
  if (isEmbeddedInPreviewApp() && routesThroughPreviewApp(file)) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function normalizeReuseScreenLink(link) {
  const href = link.getAttribute("href") || "";
  if (shouldNormalizeReuseHref(href)) {
    setReuseScreenLink(link, href);
  }
}

function normalizeReuseScreenLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a[href]").forEach(normalizeReuseScreenLink);
}

function normalizeReuseLinkClick(event) {
  const link = event.target && typeof event.target.closest === "function"
    ? event.target.closest("a[href]")
    : null;
  if (link) {
    normalizeReuseScreenLink(link);
  }
}

function renderReuseNav() {
  if (document.querySelector(".reuse-nav")) {
    return;
  }

  const index = currentReuseIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("reuse-nav-styles")) {
    const style = document.createElement("style");
    style.id = "reuse-nav-styles";
    style.textContent = `
      .reuse-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .reuse-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .reuse-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .reuse-nav a:hover {
        text-decoration: underline;
      }

      .reuse-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .reuse-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .reuse-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = REUSE_FLOW[index];
  const previous = index > 0 ? REUSE_FLOW[index - 1] : null;
  const next = index < REUSE_FLOW.length - 1 ? REUSE_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "reuse-nav";
  nav.setAttribute("aria-label", "Make it reusable path");

  const wrap = document.createElement("div");
  wrap.className = "wrap";

  const home = document.createElement("a");
  home.href = "../preview/";
  setTopTargetWhenEmbedded(home);
  home.textContent = "← Preview shell";
  wrap.appendChild(home);

  const guided = document.createElement("a");
  guided.href = "../preview/episode-flow.html";
  setTopTargetWhenEmbedded(guided);
  guided.textContent = "Guided episode flow";
  wrap.appendChild(guided);

  const app = document.createElement("a");
  app.href = currentPreviewAppHref(step);
  setTopTargetWhenEmbedded(app);
  app.textContent = "Preview app";
  wrap.appendChild(app);

  if (previous) {
    const prevLink = document.createElement("a");
    setReuseScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  } else {
    const review = document.createElement("a");
    setReuseScreenLink(review, REUSE_ENTRY.file);
    review.textContent = `Previous: ${REUSE_ENTRY.label}`;
    wrap.appendChild(review);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setReuseScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const start = document.createElement("a");
    setReuseScreenLink(start, REUSE_HANDOFF.file);
    start.textContent = `Continue: ${REUSE_HANDOFF.label}`;
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Reuse step ${index + 1} of ${REUSE_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

function initReuseNav() {
  renderReuseNav();
  normalizeReuseScreenLinks(document);
  if (typeof document.addEventListener === "function") {
    document.addEventListener("click", normalizeReuseLinkClick);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initReuseNav);
} else {
  initReuseNav();
}
