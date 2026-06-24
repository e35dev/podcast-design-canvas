"use strict";

// Connects ingest prototype screens into a short setup path (#582 / #583).
// Include from ingest prototypes with:
//   <body data-ingest-step="episode-readiness">
//   <script src="../preview/ingest-nav.js" defer></script>

const INGEST_FLOW = [
  { id: "episode-readiness", file: "episode-readiness.html", label: "Episode readiness" },
  { id: "speaker-role-mapping", file: "speaker-role-mapping.html", label: "Speaker roles" },
  { id: "social-context-intake", file: "social-context-intake.html", label: "Social links" },
];

const PREVIEW_APP_INGEST_TARGETS = new Set([
  ...INGEST_FLOW.map((step) => step.id),
  "source-media-health",
]);

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppIngestTarget(file) {
  return PREVIEW_APP_INGEST_TARGETS.has(screenIdFromFile(file));
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

function routeSearchFromFile(file) {
  const filePath = pathFromQuery(queryWithoutHash(file));
  const shellPath = pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  const path = filePath || shellPath;
  return path === "episode" || path === "ingest" ? `?path=${path}` : "";
}

function queryWithoutHash(file) {
  return ((file || "").split("#")[0].split("?")[1] || "");
}

function pathFromQuery(query) {
  return new URLSearchParams((query || "").replace(/^\?/, "")).get("path") || "";
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

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setIngestScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppIngestTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = hrefWithPath(file);
}

function setIngestHandoffLink(link) {
  const file = shouldHandoffToEpisodePath() ? "source-media-health.html?path=episode" : "source-media-health.html";
  if (isEmbeddedInPreviewApp()) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = file;
}

function pathQuerySuffix() {
  const path = new URLSearchParams(window.location.search).get("path");
  if (path === "episode") {
    return "?path=episode";
  }
  if (path === "ingest") {
    return "?path=ingest";
  }
  return "";
}

function isEpisodeShellPath() {
  return new URLSearchParams(window.location.search).get("path") === "episode";
}

function shouldHandoffToEpisodePath() {
  const path = new URLSearchParams(window.location.search).get("path");
  return path === "episode" || path === "ingest";
}

function hrefWithPath(file) {
  const shellPath = new URLSearchParams(window.location.search).get("path");
  if (shellPath !== "episode" && shellPath !== "ingest") {
    return file;
  }
  if (pathFromQuery(queryWithoutHash(file)) === shellPath) {
    return file;
  }
  return mergeRouteSearch(file, { path: shellPath });
}

function currentIngestIndex() {
  const fromBody = document.body.dataset.ingestStep;
  if (fromBody) {
    const byId = INGEST_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return INGEST_FLOW.findIndex((step) => step.file === name);
}

function renderIngestNav() {
  if (document.querySelector(".ingest-nav")) {
    return;
  }

  const index = currentIngestIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("ingest-nav-styles")) {
    const style = document.createElement("style");
    style.id = "ingest-nav-styles";
    style.textContent = `
      .ingest-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .ingest-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .ingest-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .ingest-nav a:hover {
        text-decoration: underline;
      }

      .ingest-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .ingest-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .ingest-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = INGEST_FLOW[index];
  const previous = index > 0 ? INGEST_FLOW[index - 1] : null;
  const next = index < INGEST_FLOW.length - 1 ? INGEST_FLOW[index + 1] : null;
  const episodeHandoff = isEpisodeShellPath() && step.id === "speaker-role-mapping";

  const nav = document.createElement("nav");
  nav.className = "ingest-nav";
  nav.setAttribute("aria-label", "Episode ingest setup");

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
  app.href = "../preview/app.html";
  setTopTargetWhenEmbedded(app);
  app.textContent = "Preview app";
  wrap.appendChild(app);

  if (previous) {
    const prevLink = document.createElement("a");
    setIngestScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  }

  if (next && !episodeHandoff) {
    const nextLink = document.createElement("a");
    setIngestScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else if (episodeHandoff || !next) {
    const start = document.createElement("a");
    setIngestHandoffLink(start);
    start.textContent = "Continue: Source media health";
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Setup step ${index + 1} of ${INGEST_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderIngestNav);
} else {
  renderIngestNav();
}
