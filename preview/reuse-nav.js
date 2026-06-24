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
];

const REUSE_ENTRY = { file: "sensitive-moment-review.html", label: "Sensitive moment review" };
const REUSE_HANDOFF = { file: "episode-watch-through-preview.html", label: "Episode watch-through" };

const PREVIEW_APP_REUSE_TARGETS = new Set([
  screenIdFromFile(REUSE_ENTRY.file),
  screenIdFromFile(REUSE_HANDOFF.file),
  ...REUSE_FLOW.map((step) => step.id),
]);

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
  return `../preview/app.html#${screenIdFromFile(file)}`;
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setReuseScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppReuseTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = file;
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
  app.href = "../preview/app.html";
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderReuseNav);
} else {
  renderReuseNav();
}
