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
  { id: "on-screen-correction-note", file: "on-screen-correction-note.html", label: "On-screen correction note" },
];

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

function renderCleanupNav() {
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

      .cleanup-nav a:hover,
      .cleanup-nav a:focus-visible {
        text-decoration: underline;
        outline: none;
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
  home.textContent = "← Preview shell";
  wrap.appendChild(home);

  const guided = document.createElement("a");
  guided.href = "../preview/episode-flow.html";
  guided.textContent = "Guided episode flow";
  wrap.appendChild(guided);

  if (previous) {
    const prevLink = document.createElement("a");
    prevLink.href = previous.file;
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  }

  if (next) {
    const nextLink = document.createElement("a");
    nextLink.href = next.file;
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const start = document.createElement("a");
    start.href = "contextual-broll-moments.html";
    start.textContent = "Continue: Contextual b-roll moments";
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.textContent = `Cleanup step ${index + 1} of ${CLEANUP_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderCleanupNav);
} else {
  renderCleanupNav();
}
