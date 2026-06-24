"use strict";

// Connects the visual direction prototype screens into a short style path (#583).
// Include from style prototypes with:
//   <body data-style-step="preset-style-picker">
//   <script src="../preview/style-nav.js" defer></script>

const STYLE_FLOW = [
  { id: "preset-style-picker", file: "preset-style-picker.html", label: "Preset style picker" },
  { id: "preset-comparison-preview", file: "preset-comparison-preview.html", label: "Preset comparison" },
  { id: "preset-pacing-controls", file: "preset-pacing-controls.html", label: "Preset pacing" },
  { id: "layout-safe-areas", file: "layout-safe-areas.html", label: "Layout safe areas" },
  { id: "speaker-framing-safety", file: "speaker-framing-safety.html", label: "Speaker framing safety" },
  { id: "canvas-layer-controls", file: "canvas-layer-controls.html", label: "Canvas layer controls" },
];

const STYLE_ENTRY = { file: "speaker-eye-line-coherence.html", label: "Speaker eye-line coherence" };
const STYLE_HANDOFF = { file: "contextual-broll-moments.html?from=style", label: "Contextual b-roll moments" };

const PREVIEW_APP_STYLE_TARGETS = new Set([
  screenIdFromFile(STYLE_ENTRY.file),
  screenIdFromFile(STYLE_HANDOFF.file),
  ...STYLE_FLOW.map((step) => step.id),
]);

function currentStyleIndex() {
  const fromBody = document.body.dataset.styleStep;
  if (fromBody) {
    const byId = STYLE_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return STYLE_FLOW.findIndex((step) => step.file === name);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppStyleTarget(file) {
  return PREVIEW_APP_STYLE_TARGETS.has(screenIdFromFile(file));
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
  return previewAppHref(`${step.file}${pathQuerySuffix()}`);
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
  const params = new URLSearchParams(queryWithoutHash(file));
  const from = params.get("from");
  const filePath = params.get("path");
  const shellPath = pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  const path = filePath || shellPath;

  const out = new URLSearchParams();
  if (from === "style" || from === "cleanup") {
    out.set("from", from);
  }
  if (path === "episode" || path === "style") {
    out.set("path", path);
  }
  const search = out.toString();
  return search ? `?${search}` : "";
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

// Keep the episode workflow path (?path=...) on visual-direction links so a creator
// who entered the style steps from the guided episode path stays in that context,
// matching the other flow navs (ingest, speaker setup, reuse, episode flow).
function pathQuerySuffix() {
  const path = new URLSearchParams(window.location.search).get("path");
  if (path === "episode") {
    return "?path=episode";
  }
  if (path === "style") {
    return "?path=style";
  }
  return "";
}

function hrefWithPath(file) {
  const shellPath = new URLSearchParams(window.location.search).get("path");
  if (shellPath !== "episode" && shellPath !== "style") {
    return file;
  }
  if (pathFromQuery(queryWithoutHash(file)) === shellPath) {
    return file;
  }
  return mergeRouteSearch(file, { path: shellPath });
}

function setStyleScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppStyleTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = hrefWithPath(file);
}

function renderStyleNav() {
  if (document.querySelector(".style-nav")) {
    return;
  }

  const index = currentStyleIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("style-nav-styles")) {
    const style = document.createElement("style");
    style.id = "style-nav-styles";
    style.textContent = `
      .style-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .style-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .style-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .style-nav a:hover {
        text-decoration: underline;
      }

      .style-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .style-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .style-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = STYLE_FLOW[index];
  const previous = index > 0 ? STYLE_FLOW[index - 1] : null;
  const next = index < STYLE_FLOW.length - 1 ? STYLE_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "style-nav";
  nav.setAttribute("aria-label", "Visual direction path");

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
    setStyleScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  } else {
    const setup = document.createElement("a");
    setStyleScreenLink(setup, STYLE_ENTRY.file);
    setup.textContent = `Previous: ${STYLE_ENTRY.label}`;
    wrap.appendChild(setup);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setStyleScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const start = document.createElement("a");
    setStyleScreenLink(start, STYLE_HANDOFF.file);
    start.textContent = `Continue: ${STYLE_HANDOFF.label}`;
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Style step ${index + 1} of ${STYLE_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderStyleNav);
} else {
  renderStyleNav();
}
