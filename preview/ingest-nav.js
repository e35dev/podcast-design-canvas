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

function hrefWithPath(file) {
  const suffix = pathQuerySuffix();
  return suffix ? `${file}${suffix}` : file;
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
  home.textContent = "← Preview shell";
  wrap.appendChild(home);

  const guided = document.createElement("a");
  guided.href = "../preview/episode-flow.html";
  guided.textContent = "Guided episode flow";
  wrap.appendChild(guided);

  if (previous) {
    const prevLink = document.createElement("a");
    prevLink.href = hrefWithPath(previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  }

  if (next && !episodeHandoff) {
    const nextLink = document.createElement("a");
    nextLink.href = hrefWithPath(next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else if (episodeHandoff || !next) {
    const start = document.createElement("a");
    start.href = "source-media-health.html";
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
