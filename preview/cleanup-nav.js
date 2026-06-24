"use strict";

// Connects the "clean up audio & captions" prototype screens into a short path (#583).
// These are the secondary cleanup tools — the core audio-cleanup and caption-quality
// steps live in the guided episode flow. Include from cleanup prototypes with:
//   <body data-cleanup-step="pause-crosstalk-cleanup">
//   <script src="../preview/cleanup-nav.js" defer></script>

const CLEANUP_FLOW = [
  { id: "pause-crosstalk-cleanup", file: "pause-crosstalk-cleanup.html", label: "Pause & cross-talk cleanup" },
  { id: "transcript-glossary", file: "transcript-glossary.html", label: "Transcript glossary" },
  { id: "transcript-search-navigation", file: "transcript-search-navigation.html", label: "Transcript search" },
  { id: "accessibility-readability-checks", file: "accessibility-readability-checks.html", label: "Accessibility & readability" },
  { id: "line-pickup-insert", file: "line-pickup-insert.html", label: "Line pickup insert" },
  { id: "pronunciation-name-review", file: "pronunciation-name-review.html", label: "Pronunciation & name review" },
  { id: "on-screen-correction-note", file: "on-screen-correction-note.html", label: "On-screen correction note" },
];

const PREVIEW_APP_CLEANUP_TARGETS = new Set([
  "publish-checklist",
  ...CLEANUP_FLOW.map((step) => step.id),
  "contextual-broll-moments",
]);
const CLEANUP_ENTRY_BACKLINK = { file: "publish-checklist.html?path=publish", label: "Publish checklist" };
const CLEANUP_ENTRY_CONTEXTS = new Set(["cleanup", "style"]);
const CLEANUP_RETURN_PATHS = new Set(["publish"]);

function currentCleanupIndex() {
  const fromBody = document.body.dataset.cleanupStep;
  if (fromBody) {
    const byId = CLEANUP_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return CLEANUP_FLOW.findIndex((step) => step.file === name);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppCleanupTarget(file) {
  return PREVIEW_APP_CLEANUP_TARGETS.has(screenIdFromFile(file));
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

function currentPreviewAppHref(step) {
  return previewAppHref(hrefWithCleanupContext(step.file));
}

function cleanupEntrySearchFromWindow() {
  const from = new URLSearchParams(window.location.search).get("from");
  return CLEANUP_ENTRY_CONTEXTS.has(from) ? `?from=${from}` : "";
}

function cleanupEntryContextFromWindow() {
  const from = new URLSearchParams(window.location.search).get("from");
  return CLEANUP_ENTRY_CONTEXTS.has(from) ? from : "";
}

function isCleanupFlowFile(file) {
  const base = (file || "").split("?")[0].split("#")[0];
  return CLEANUP_FLOW.some((step) => step.file === base);
}

function routeSearchFromFile(file, fallbackSearch = cleanupEntrySearchFromWindow()) {
  const params = new URLSearchParams(queryWithoutHash(file));
  const from = params.get("from");
  const filePath = params.get("path");
  const shellPath = new URLSearchParams(window.location.search).get("path");
  const fallbackFrom = new URLSearchParams((fallbackSearch || "").replace(/^\?/, "")).get("from");

  const out = new URLSearchParams();
  if (CLEANUP_ENTRY_CONTEXTS.has(from)) {
    out.set("from", from);
  } else if (CLEANUP_ENTRY_CONTEXTS.has(fallbackFrom)) {
    out.set("from", fallbackFrom);
  }
  if (CLEANUP_RETURN_PATHS.has(filePath)) {
    out.set("path", filePath);
  } else if (CLEANUP_RETURN_PATHS.has(shellPath)) {
    out.set("path", shellPath);
  }
  const search = out.toString();
  return search ? `?${search}` : "";
}

function hrefWithPath(file) {
  const shellPath = new URLSearchParams(window.location.search).get("path");
  if (shellPath !== "publish") {
    return file;
  }
  if (pathFromQuery(queryWithoutHash(file)) === shellPath) {
    return file;
  }
  return mergeRouteSearch(file, { path: shellPath });
}

function withCleanupFlowContext(file) {
  const context = cleanupEntryContextFromWindow();
  const shellPath = new URLSearchParams(window.location.search).get("path");
  const overrides = {};
  if (context) {
    overrides.from = context;
  }
  if (shellPath === "publish" && pathFromQuery(queryWithoutHash(file)) !== shellPath) {
    overrides.path = shellPath;
  }
  if (Object.keys(overrides).length === 0) {
    return file;
  }
  return mergeRouteSearch(file, overrides);
}

function hrefWithCleanupContext(file) {
  if (isCleanupFlowFile(file)) {
    return withCleanupFlowContext(file);
  }
  return hrefWithPath(file);
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setCleanupScreenLink(link, file) {
  const resolved = hrefWithCleanupContext(file);
  if (isEmbeddedInPreviewApp() && isPreviewAppCleanupTarget(resolved)) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function isLocalScreenHref(href) {
  return Boolean(href) && !href.startsWith("#") && !href.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

function shouldNormalizeCleanupHref(href) {
  return isLocalScreenHref(href) && isPreviewAppCleanupTarget(href);
}

function normalizeCleanupScreenLink(link) {
  const href = link.getAttribute("href") || "";
  if (shouldNormalizeCleanupHref(href)) {
    setCleanupScreenLink(link, href);
  }
}

function normalizeCleanupScreenLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a[href]").forEach(normalizeCleanupScreenLink);
}

function normalizeCleanupLinkClick(event) {
  const link = event.target && typeof event.target.closest === "function"
    ? event.target.closest("a[href]")
    : null;
  if (link) {
    normalizeCleanupScreenLink(link);
  }
}

function renderCleanupNav() {
  if (document.querySelector(".cleanup-nav")) {
    return;
  }

  const index = currentCleanupIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("cleanup-nav-styles")) {
    const style = document.createElement("style");
    style.id = "cleanup-nav-styles";
    style.textContent = `
      .cleanup-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .cleanup-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .cleanup-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .cleanup-nav a:hover {
        text-decoration: underline;
      }

      .cleanup-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .cleanup-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .cleanup-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = CLEANUP_FLOW[index];
  const previous = index > 0 ? CLEANUP_FLOW[index - 1] : null;
  const next = index < CLEANUP_FLOW.length - 1 ? CLEANUP_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "cleanup-nav";
  nav.setAttribute("aria-label", "Audio & caption cleanup path");

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

  const previewApp = document.createElement("a");
  previewApp.href = currentPreviewAppHref(step);
  setTopTargetWhenEmbedded(previewApp);
  previewApp.textContent = "Preview app";
  wrap.appendChild(previewApp);

  if (previous) {
    const prevLink = document.createElement("a");
    prevLink.href = previous.file;
    setCleanupScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  } else {
    const prep = document.createElement("a");
    setCleanupScreenLink(prep, CLEANUP_ENTRY_BACKLINK.file);
    prep.textContent = "Previous: Publish checklist";
    wrap.appendChild(prep);
  }

  if (next) {
    const nextLink = document.createElement("a");
    nextLink.href = next.file;
    setCleanupScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const start = document.createElement("a");
    start.href = "contextual-broll-moments.html?from=cleanup";
    setCleanupScreenLink(start, "contextual-broll-moments.html?from=cleanup");
    start.textContent = "Continue: Contextual b-roll moments";
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Cleanup step ${index + 1} of ${CLEANUP_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
  normalizeCleanupScreenLinks(document);
  document.addEventListener("click", normalizeCleanupLinkClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderCleanupNav);
} else {
  renderCleanupNav();
}
