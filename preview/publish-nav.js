"use strict";

// Connects the publish prep prototype screens into a short handoff path (#583).
// Include from publish prototypes with:
//   <body data-publish-step="export-package-handoff">
//   <script src="../preview/publish-nav.js" defer></script>

const PUBLISH_FLOW = [
  {
    id: "episode-watch-through-preview",
    file: "episode-watch-through-preview.html",
    label: "Watch-through preview",
    previous: { file: "export-readiness-review.html", label: "Export readiness" },
  },
  { id: "destination-crop-preview", file: "destination-crop-preview.html", label: "Destination crop preview" },
  { id: "thumbnail-cover-frame", file: "thumbnail-cover-frame.html", label: "Thumbnail cover frame" },
  { id: "show-notes-assembly", file: "show-notes-assembly.html", label: "Show notes assembly" },
  { id: "episode-metadata-publishing", file: "episode-metadata-publishing.html", label: "Episode metadata publishing" },
  { id: "export-package-handoff", file: "export-package-handoff.html", label: "Export package handoff" },
  { id: "clip-candidate-review", file: "clip-candidate-review.html", label: "Clip candidate review" },
  { id: "client-review-copy-flow", file: "client-review-copy-flow.html", label: "Client review copy" },
  { id: "publish-checklist", file: "publish-checklist.html", label: "Publish checklist" },
];

const PREVIEW_APP_PUBLISH_TARGETS = new Set([
  "export-readiness-review",
  ...PUBLISH_FLOW.map((step) => step.id),
]);

// Cross-stage fix screens that publish-prep prototypes hand off to. These screens are
// owned by other stages, so when opened from the assembled preview app they route
// through it carrying the publish path context (matching the clip-review transcript
// hand-off), instead of loading nested inside the iframe.
const PUBLISH_FIX_PATHS = {
  "transcript-search-navigation.html": { path: "publish", from: "cleanup" },
  // Publish checklist -> the screens that own each unresolved readiness fix.
  "audio-caption-quality-review.html": { path: "publish" },
  "source-media-health.html": { path: "publish" },
  "episode-chapter-markers.html": { path: "publish" },
  // Export package handoff / destination crop -> framing & layout owners.
  "speaker-attribution-review.html": { path: "publish" },
  "speaker-framing-safety.html": { path: "publish" },
  "layout-safe-areas.html": { path: "publish" },
  // Episode metadata publishing -> guest links owner.
  "social-context-intake.html": { path: "publish" },
};

const PREVIEW_APP_PUBLISH_CROSS_PATH_TARGETS = new Set(
  Object.keys(PUBLISH_FIX_PATHS).map((file) => screenIdFromFile(file)),
);

function currentPublishIndex() {
  const fromBody = document.body.dataset.publishStep;
  if (fromBody) {
    const byId = PUBLISH_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return PUBLISH_FLOW.findIndex((step) => step.file === name);
}

function previousPublishStep(index) {
  const step = PUBLISH_FLOW[index];
  return step.previous || (index > 0 ? PUBLISH_FLOW[index - 1] : null);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppPublishTarget(file) {
  return PREVIEW_APP_PUBLISH_TARGETS.has(screenIdFromFile(file));
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

function pathQuerySuffix() {
  return pathSearch(pathFromQuery(window.location.search));
}

function pathSearch(path) {
  return path === "publish" ? "?path=publish" : "";
}

function queryWithoutHash(file) {
  return ((file || "").split("#")[0].split("?")[1] || "");
}

function routeSearchFromFile(file) {
  const params = new URLSearchParams(queryWithoutHash(file));
  const from = params.get("from");
  const filePath = params.get("path");
  const shellPath = pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  const path = filePath || shellPath;

  const out = new URLSearchParams();
  if (from === "cleanup") {
    out.set("from", from);
  }
  if (path === "publish") {
    out.set("path", "publish");
  }
  const search = out.toString();
  return search ? `?${search}` : "";
}

function hrefHasPublishPath(file) {
  return pathFromQuery(queryWithoutHash(file)) === "publish";
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

function previewAppHref(file) {
  return `../preview/app.html#${screenIdFromFile(file)}${routeSearchFromFile(file)}`;
}

function currentPreviewAppHref(step) {
  return previewAppHref(`${step.file}${pathQuerySuffix()}`);
}

function hrefWithPath(file) {
  const shellPath = new URLSearchParams(window.location.search).get("path");
  if (shellPath !== "publish") {
    return file;
  }
  if (hrefHasPublishPath(file)) {
    return file;
  }
  return mergeRouteSearch(file, { path: "publish" });
}

function linkBase(href) {
  return (href || "").split("#")[0].split("?")[0];
}

function resolvePublishLink(file) {
  const base = linkBase(file);
  if (Object.prototype.hasOwnProperty.call(PUBLISH_FIX_PATHS, base)) {
    return mergeRouteSearch(file, PUBLISH_FIX_PATHS[base]);
  }
  return hrefWithPath(file);
}

function routesThroughPreviewApp(file) {
  return isPreviewAppPublishTarget(file) || PREVIEW_APP_PUBLISH_CROSS_PATH_TARGETS.has(screenIdFromFile(file));
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setPublishScreenLink(link, file) {
  const resolved = resolvePublishLink(file);
  if (isEmbeddedInPreviewApp() && routesThroughPreviewApp(file)) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function isLocalScreenHref(href) {
  return Boolean(href) && !href.startsWith("#") && !href.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

function shouldNormalizePublishHref(href) {
  return isLocalScreenHref(href) && (
    isPreviewAppPublishTarget(href) ||
    Object.prototype.hasOwnProperty.call(PUBLISH_FIX_PATHS, linkBase(href))
  );
}

function normalizePublishScreenLink(link) {
  const href = link.getAttribute("href") || "";
  if (shouldNormalizePublishHref(href)) {
    setPublishScreenLink(link, href);
  }
}

function normalizePublishScreenLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a[href]").forEach((link) => {
    normalizePublishScreenLink(link);
  });
}

function normalizePublishLinkClick(event) {
  const link = event.target && typeof event.target.closest === "function"
    ? event.target.closest("a[href]")
    : null;
  if (link) {
    normalizePublishScreenLink(link);
  }
}

const PUBLISH_CHECKLIST_FIX_PATHS = {
  "audio-caption-quality-review.html": "publish",
  "episode-chapter-markers.html": "publish",
  "source-media-health.html": "publish",
};

function checklistFixBase(href) {
  return ((href || "").split("#")[0].split("?")[0].split("/").pop() || "");
}

// Cross-flow checklist fixes (caption review, chapters, source media) are not publish-flow
// screens. Route them through the same publish-link resolver so embedded hand-offs keep
// the preview app target instead of being overwritten with a bare prototype href.
function setPublishChecklistFixLink(link) {
  const href = link.getAttribute("href") || "";
  const base = checklistFixBase(href);
  if (!Object.prototype.hasOwnProperty.call(PUBLISH_CHECKLIST_FIX_PATHS, base)) {
    return;
  }
  setPublishScreenLink(link, href);
}

function renderPublishNav() {
  if (document.querySelector(".publish-nav")) {
    return;
  }

  const index = currentPublishIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("publish-nav-styles")) {
    const style = document.createElement("style");
    style.id = "publish-nav-styles";
    style.textContent = `
      .publish-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .publish-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .publish-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .publish-nav a:hover {
        text-decoration: underline;
      }

      .publish-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .publish-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .publish-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = PUBLISH_FLOW[index];
  const previous = previousPublishStep(index);
  const next = index < PUBLISH_FLOW.length - 1 ? PUBLISH_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "publish-nav";
  nav.setAttribute("aria-label", "Publish prep path");

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
    setPublishScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setPublishScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const finish = document.createElement("a");
    finish.href = "../preview/";
    setTopTargetWhenEmbedded(finish);
    finish.textContent = "Finish: back to the preview shell";
    wrap.appendChild(finish);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Publish step ${index + 1} of ${PUBLISH_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
  normalizePublishScreenLinks(document);
  document.addEventListener("click", normalizePublishLinkClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderPublishNav);
} else {
  renderPublishNav();
}
