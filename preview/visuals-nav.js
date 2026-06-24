"use strict";

// Connects the contextual-visuals prototype screens into a short path (#583).
// Include from visuals prototypes with:
//   <body data-visuals-step="contextual-broll-moments">
//   <script src="../preview/visuals-nav.js" defer></script>

const VISUALS_FLOW = [
  { id: "contextual-broll-moments", file: "contextual-broll-moments.html", label: "Contextual b-roll moments" },
  { id: "contextual-title-cards", file: "contextual-title-cards.html", label: "Contextual title cards" },
  { id: "sensitive-moment-review", file: "sensitive-moment-review.html", label: "Sensitive moment review" },
];

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

      .visuals-nav a:hover,
      .visuals-nav a:focus-visible {
        text-decoration: underline;
        outline: none;
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
    start.href = "show-segment-system.html";
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
