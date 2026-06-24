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
  cleanup: { href: "on-screen-correction-note.html", label: "On-screen correction note" },
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

function splitHref(file) {
  const [beforeHash, hash = ""] = (file || "").split("#");
  const [base, query = ""] = beforeHash.split("?");
  return { base, query, hash };
}

function visualsContextFromQuery(query) {
  const from = new URLSearchParams(query || "").get("from");
  return from === "style" || from === "cleanup" ? from : "";
}

function routeSearchFromFile(file) {
  const { query } = splitHref(file);
  const from = visualsContextFromQuery(query);
  return from ? `?from=${from}` : "";
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setVisualsScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppVisualsTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = file;
}

function visualsEntryContext() {
  return visualsContextFromQuery((window.location.search || "").replace(/^\?/, "")) || "cleanup";
}

function entryBacklink() {
  return VISUALS_ENTRY_BACKLINKS[visualsEntryContext()] || VISUALS_ENTRY_BACKLINKS.cleanup;
}

function withVisualsContext(file) {
  const context = visualsEntryContext();
  if (!VISUALS_SCREEN_IDS.has(screenIdFromFile(file))) {
    return file;
  }
  const { base, query, hash } = splitHref(file);
  const params = new URLSearchParams(query);
  params.set("from", context);
  const search = params.toString();
  return `${base}${search ? `?${search}` : ""}${hash ? `#${hash}` : ""}`;
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
  previewApp.href = "../preview/app.html";
  setTopTargetWhenEmbedded(previewApp);
  previewApp.textContent = "Preview app";
  wrap.appendChild(previewApp);

  if (previous) {
    const prevLink = document.createElement("a");
    const previousFile = withVisualsContext(previous.file);
    setVisualsScreenLink(prevLink, previousFile);
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
    const nextFile = withVisualsContext(next.file);
    setVisualsScreenLink(nextLink, nextFile);
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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderVisualsNav);
} else {
  renderVisualsNav();
}
