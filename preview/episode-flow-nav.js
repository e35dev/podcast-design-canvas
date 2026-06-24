"use strict";

// Connects core episode prototype screens back to the preview shell (#583).
// Include from prototype/*.html with:
//   <script src="../preview/episode-flow-nav.js" defer></script>

const EPISODE_FLOW = [
  { file: "source-media-health.html", label: "Source media health" },
  { file: "speaker-sync-repair.html", label: "Speaker sync repair" },
  { file: "audio-cleanup-controls.html", label: "Audio cleanup" },
  { file: "audio-caption-quality-review.html", label: "Caption quality review" },
  { file: "export-readiness-review.html", label: "Export readiness" },
];

const EPISODE_SHELL_PREFIX = 2;
const EPISODE_PREAMBLE = { file: "speaker-role-mapping.html", label: "Speaker roles" };
const EPISODE_HANDOFF = { file: "episode-watch-through-preview.html", label: "Watch-through preview" };
const PREVIEW_APP_EPISODE_TARGETS = new Set([
  screenIdFromFile(EPISODE_PREAMBLE.file),
  ...EPISODE_FLOW.map((step) => screenIdFromFile(step.file)),
  screenIdFromFile(EPISODE_HANDOFF.file),
]);

function currentStepIndex() {
  const name = window.location.pathname.split("/").pop() || "";
  return EPISODE_FLOW.findIndex((step) => step.file === name);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppEpisodeTarget(file) {
  return PREVIEW_APP_EPISODE_TARGETS.has(screenIdFromFile(file));
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

function setEpisodeScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppEpisodeTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = file;
}

function renderEpisodeFlowNav() {
  const index = currentStepIndex();
  if (index < 0) {
    return;
  }

  if (document.querySelector(".episode-flow-nav")) {
    return;
  }

  const step = EPISODE_FLOW[index];
  const total = EPISODE_FLOW.length + EPISODE_SHELL_PREFIX;
  const previous = index > 0 ? EPISODE_FLOW[index - 1] : EPISODE_PREAMBLE;
  const next = index < EPISODE_FLOW.length - 1 ? EPISODE_FLOW[index + 1] : null;

  if (!document.getElementById("episode-flow-nav-styles")) {
    const style = document.createElement("style");
    style.id = "episode-flow-nav-styles";
    style.textContent = `
      .episode-flow-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .episode-flow-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px 16px;
        align-items: center;
      }

      .episode-flow-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .episode-flow-nav a:hover {
        text-decoration: underline;
      }

      .episode-flow-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .episode-flow-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .episode-flow-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const nav = document.createElement("nav");
  nav.className = "episode-flow-nav";
  nav.setAttribute("aria-label", "Episode production flow");

  const wrap = document.createElement("div");
  wrap.className = "wrap";

  const home = document.createElement("a");
  home.href = "../preview/index.html";
  setTopTargetWhenEmbedded(home);
  home.textContent = "Episode flow home";

  const guided = document.createElement("a");
  guided.href = "../preview/episode-flow.html";
  setTopTargetWhenEmbedded(guided);
  guided.textContent = "Guided episode flow";

  wrap.appendChild(home);
  wrap.appendChild(guided);

  const app = document.createElement("a");
  app.href = "../preview/app.html";
  setTopTargetWhenEmbedded(app);
  app.textContent = "Preview app";
  wrap.appendChild(app);

  if (previous) {
    const prevLink = document.createElement("a");
    setEpisodeScreenLink(prevLink, index === 0 ? `${EPISODE_PREAMBLE.file}?path=episode` : previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setEpisodeScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const handoff = document.createElement("a");
    setEpisodeScreenLink(handoff, EPISODE_HANDOFF.file);
    handoff.textContent = `Continue: ${EPISODE_HANDOFF.label}`;
    wrap.appendChild(handoff);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Current step: ${index + 1 + EPISODE_SHELL_PREFIX} of ${total} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderEpisodeFlowNav);
} else {
  renderEpisodeFlowNav();
}
