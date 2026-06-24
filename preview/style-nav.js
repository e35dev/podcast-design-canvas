"use strict";

// Connects the visual direction prototype screens into a short style path (#583).
// Include from style prototypes with:
//   <body data-style-step="preset-style-picker">
//   <script src="../preview/style-nav.js" defer></script>

const STYLE_FLOW = [
  { id: "preset-style-picker", file: "preset-style-picker.html", label: "Preset style picker" },
  { id: "preset-comparison-preview", file: "preset-comparison-preview.html", label: "Preset comparison" },
  { id: "layout-safe-areas", file: "layout-safe-areas.html", label: "Layout safe areas" },
  { id: "speaker-framing-safety", file: "speaker-framing-safety.html", label: "Speaker framing safety" },
];

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

      .style-nav a:hover,
      .style-nav a:focus-visible {
        text-decoration: underline;
        outline: none;
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
    start.href = "source-media-health.html";
    start.textContent = "Continue: Source media health";
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
