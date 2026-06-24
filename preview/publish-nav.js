"use strict";

// Connects the publish prep prototype screens into a short handoff path (#583).
// Include from publish prototypes with:
//   <body data-publish-step="export-package-handoff">
//   <script src="../preview/publish-nav.js" defer></script>

const PUBLISH_FLOW = [
  {
    id: "episode-watch-through-preview",
    file: "episode-watch-through-preview.html",
    label: "Watch-through preview",
    previous: { file: "export-readiness-review.html", label: "Export readiness" },
  },
  { id: "destination-crop-preview", file: "destination-crop-preview.html", label: "Destination crop preview" },
  { id: "thumbnail-cover-frame", file: "thumbnail-cover-frame.html", label: "Thumbnail cover frame" },
  { id: "show-notes-assembly", file: "show-notes-assembly.html", label: "Show notes assembly" },
  { id: "episode-metadata-publishing", file: "episode-metadata-publishing.html", label: "Episode metadata publishing" },
  { id: "export-package-handoff", file: "export-package-handoff.html", label: "Export package handoff" },
  { id: "client-review-copy-flow", file: "client-review-copy-flow.html", label: "Client review copy" },
  { id: "publish-checklist", file: "publish-checklist.html", label: "Publish checklist" },
];

const PREVIEW_APP_PUBLISH_TARGETS = new Set([
  "export-readiness-review",
  ...PUBLISH_FLOW.map((step) => step.id),
]);

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

function previousPublishStep(index) {
  const step = PUBLISH_FLOW[index];
  return step.previous || (index > 0 ? PUBLISH_FLOW[index - 1] : null);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppPublishTarget(file) {
  return PREVIEW_APP_PUBLISH_TARGETS.has(screenIdFromFile(file));
}

function isEmbeddedInPreviewApp() {
  try {
    return window.self !== window.top && /\/preview\/app\.html$/.test(window.top.location.pathname);
  } catch (_) {
    return false;
  }
}

function pathFromQuery(query) {
  const part = (query || "").split("&").find((item) => item.startsWith("path="));
  return part ? part.split("=")[1] : "";
}

function pathQuerySuffix() {
  const path = new URLSearchParams(window.location.search).get("path");
  return path === "publish" ? "?path=publish" : "";
}

function routeSearchFromFile(file) {
  const query = (file || "").split("?")[1] || "";
  const path = pathFromQuery(query) || pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  return path === "publish" ? "?path=publish" : "";
}

function previewAppHref(file) {
  return `../preview/app.html#${screenIdFromFile(file)}${routeSearchFromFile(file)}`;
}

function hrefWithPath(file) {
  const base = (file || "").split("?")[0];
  if (pathFromQuery((file || "").split("?")[1] || "") === "publish") {
    return file;
  }
  const suffix = pathQuerySuffix();
  return suffix ? `${base}${suffix}` : file;
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setPublishScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppPublishTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = hrefWithPath(file);
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

      .publish-nav a:hover {
        text-decoration: underline;
      }

      .publish-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
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
  const previous = previousPublishStep(index);
  const next = index < PUBLISH_FLOW.length - 1 ? PUBLISH_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "publish-nav";
  nav.setAttribute("aria-label", "Publish prep path");

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
    setPublishScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setPublishScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const finish = document.createElement("a");
    finish.href = "../preview/";
    setTopTargetWhenEmbedded(finish);
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
