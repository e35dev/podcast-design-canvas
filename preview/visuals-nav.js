"use strict";

// Connects the contextual-visuals prototype screens into a short path (#583).
// Include from visuals prototypes with:
//   <body data-visuals-step="contextual-broll-moments">
//   <script src="../preview/visuals-nav.js" defer></script>

const VISUALS_FLOW = [
  { id: "contextual-broll-moments", file: "contextual-broll-moments.html", label: "Contextual b-roll moments" },
  { id: "contextual-title-cards", file: "contextual-title-cards.html", label: "Contextual title cards" },
  { id: "screen-share-moment-review", file: "screen-share-moment-review.html", label: "Screen share moment review" },
  { id: "sensitive-moment-review", file: "sensitive-moment-review.html", label: "Sensitive moment review" },
];

const VISUALS_SCREEN_IDS = new Set(VISUALS_FLOW.map((step) => step.id));
const VISUALS_ENTRY_BACKLINKS = {
  cleanup: { href: "on-screen-correction-note.html?from=cleanup", label: "On-screen correction note" },
  style: { href: "canvas-layer-controls.html", label: "Canvas layer controls" },
};

const PREVIEW_APP_VISUALS_TARGETS = new Set([
  screenIdFromFile(VISUALS_ENTRY_BACKLINKS.cleanup.href),
  screenIdFromFile(VISUALS_ENTRY_BACKLINKS.style.href),
  ...VISUALS_FLOW.map((step) => step.id),
  "show-segment-system",
]);

function currentVisualsIndex() {
  const fromBody = document.body.dataset.visualsStep;
  if (fromBody) {
    const byId = VISUALS_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return VISUALS_FLOW.findIndex((step) => step.file === name);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppVisualsTarget(file) {
  return PREVIEW_APP_VISUALS_TARGETS.has(screenIdFromFile(file));
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

function pathQuerySuffix() {
  const path = new URLSearchParams(window.location.search).get("path");
  if (path === "episode" || path === "reuse") {
    return `?path=${path}`;
  }
  return "";
}

function routeSearchFromFile(file) {
  const params = new URLSearchParams(queryWithoutHash(file));
  const from = params.get("from");
  const filePath = params.get("path");
  const shellPath = pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  const path = filePath || shellPath;

  const out = new URLSearchParams();
  if (from === "style" || from === "cleanup") {
    out.set("from", from);
  }
  if (path === "episode" || path === "reuse") {
    out.set("path", path);
  }
  const search = out.toString();
  return search ? `?${search}` : "";
}

function currentPreviewAppHref(step) {
  return previewAppHref(withVisualsContext(step.file));
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

function resolveVisualsLink(file) {
  const base = screenIdFromFile(file);
  if (VISUALS_SCREEN_IDS.has(base)) {
    return withVisualsContext((file || "").split("?")[0].split("#")[0]);
  }
  return hrefWithPath(file);
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setVisualsScreenLink(link, file) {
  const resolved = resolveVisualsLink(file);
  if (isEmbeddedInPreviewApp() && isPreviewAppVisualsTarget(resolved)) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function isLocalScreenHref(href) {
  return Boolean(href) && !href.startsWith("#") && !href.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

function shouldNormalizeVisualsHref(href) {
  return isLocalScreenHref(href) && isPreviewAppVisualsTarget(href);
}

function normalizeVisualsScreenLink(link) {
  const href = link.getAttribute("href") || "";
  if (shouldNormalizeVisualsHref(href)) {
    setVisualsScreenLink(link, href);
  }
}

function normalizeVisualsScreenLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a[href]").forEach(normalizeVisualsScreenLink);
}

function normalizeVisualsLinkClick(event) {
  const link = event.target && typeof event.target.closest === "function"
    ? event.target.closest("a[href]")
    : null;
  if (link) {
    normalizeVisualsScreenLink(link);
  }
}

function visualsEntryContext() {
  const from = new URLSearchParams((window.location.search || "").replace(/^\?/, "")).get("from");
  if (from === "style") {
    return "style";
  }
  if (from === "cleanup") {
    return "cleanup";
  }
  return "cleanup";
}

function entryBacklink() {
  return VISUALS_ENTRY_BACKLINKS[visualsEntryContext()] || VISUALS_ENTRY_BACKLINKS.cleanup;
}

function withVisualsContext(file) {
  const base = (file || "").split("?")[0].split("#")[0];
  const context = visualsEntryContext();
  const shellPath = new URLSearchParams(window.location.search).get("path");
  const overrides = { from: context };
  if (
    (shellPath === "episode" || shellPath === "reuse") &&
    pathFromQuery(queryWithoutHash(base)) !== shellPath
  ) {
    overrides.path = shellPath;
  }
  return mergeRouteSearch(base, overrides);
}

function renderVisualsNav() {
  if (document.querySelector(".visuals-nav")) {
    return;
  }

  const index = currentVisualsIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("visuals-nav-styles")) {
    const style = document.createElement("style");
    style.id = "visuals-nav-styles";
    style.textContent = `
      .visuals-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .visuals-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .visuals-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .visuals-nav a:hover {
        text-decoration: underline;
      }

      .visuals-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .visuals-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .visuals-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = VISUALS_FLOW[index];
  const previous = index > 0 ? VISUALS_FLOW[index - 1] : null;
  const next = index < VISUALS_FLOW.length - 1 ? VISUALS_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "visuals-nav";
  nav.setAttribute("aria-label", "Contextual visuals path");

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
    setVisualsScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  } else {
    const entry = entryBacklink();
    const cleanup = document.createElement("a");
    setVisualsScreenLink(cleanup, entry.href);
    cleanup.textContent = `Previous: ${entry.label}`;
    wrap.appendChild(cleanup);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setVisualsScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const start = document.createElement("a");
    setVisualsScreenLink(start, "show-segment-system.html");
    start.textContent = "Continue: Show segment system";
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Visuals step ${index + 1} of ${VISUALS_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
  normalizeVisualsScreenLinks(document);
  document.addEventListener("click", normalizeVisualsLinkClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderVisualsNav);
} else {
  renderVisualsNav();
}
