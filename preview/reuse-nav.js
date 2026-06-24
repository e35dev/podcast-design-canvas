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
];

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

      .reuse-nav a:hover,
      .reuse-nav a:focus-visible {
        text-decoration: underline;
        outline: none;
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
    start.href = "episode-watch-through-preview.html";
    start.textContent = "Continue: Episode watch-through";
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
