"use strict";

// Connects the publish prep prototype screens into a short handoff path (#583).
// Include from publish prototypes with:
//   <body data-publish-step="export-package-handoff">
//   <script src="../preview/publish-nav.js" defer></script>

const PUBLISH_FLOW = [
  { id: "episode-watch-through-preview", file: "episode-watch-through-preview.html", label: "Watch-through preview" },
  { id: "destination-crop-preview", file: "destination-crop-preview.html", label: "Destination crop preview" },
  { id: "thumbnail-cover-frame", file: "thumbnail-cover-frame.html", label: "Thumbnail cover frame" },
  { id: "show-notes-assembly", file: "show-notes-assembly.html", label: "Show notes assembly" },
  { id: "export-package-handoff", file: "export-package-handoff.html", label: "Export package handoff" },
  { id: "publish-checklist", file: "publish-checklist.html", label: "Publish checklist" },
];

function currentPublishIndex() {
  const fromBody = document.body.dataset.publishStep;
  if (fromBody) {
    const byId = PUBLISH_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return PUBLISH_FLOW.findIndex((step) => step.file === name);
}

function renderPublishNav() {
  if (document.querySelector(".publish-nav")) {
    return;
  }

  const index = currentPublishIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("publish-nav-styles")) {
    const style = document.createElement("style");
    style.id = "publish-nav-styles";
    style.textContent = `
      .publish-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .publish-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .publish-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .publish-nav a:hover,
      .publish-nav a:focus-visible {
        text-decoration: underline;
        outline: none;
      }

      .publish-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .publish-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = PUBLISH_FLOW[index];
  const previous = index > 0 ? PUBLISH_FLOW[index - 1] : null;
  const next = index < PUBLISH_FLOW.length - 1 ? PUBLISH_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "publish-nav";
  nav.setAttribute("aria-label", "Publish prep path");

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
    const finish = document.createElement("a");
    finish.href = "../preview/";
    finish.textContent = "Finish: back to the preview shell";
    wrap.appendChild(finish);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Publish step ${index + 1} of ${PUBLISH_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderPublishNav);
} else {
  renderPublishNav();
}
