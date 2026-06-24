"use strict";

// Connects music cue prototype screens into a short audio path (#583).
// Include from music prototypes with:
//   <body data-music-step="music-cue-setup">
//   <script src="../preview/music-nav.js" defer></script>

const MUSIC_FLOW = [
  { id: "music-cue-setup", file: "music-cue-setup.html", label: "Music cue setup" },
  { id: "music-ducking-under-speech", file: "music-ducking-under-speech.html", label: "Music ducking under speech" },
];

const MUSIC_ENTRY = { file: "audio-cleanup-controls.html", label: "Audio cleanup" };
const MUSIC_HANDOFF = { file: "pause-crosstalk-cleanup.html", label: "Pause & cross-talk cleanup" };

const PREVIEW_APP_MUSIC_TARGETS = new Set([
  screenIdFromFile(MUSIC_ENTRY.file),
  screenIdFromFile(MUSIC_HANDOFF.file),
  ...MUSIC_FLOW.map((step) => step.id),
]);

function currentMusicIndex() {
  const fromBody = document.body.dataset.musicStep;
  if (fromBody) {
    const byId = MUSIC_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return MUSIC_FLOW.findIndex((step) => step.file === name);
}

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppMusicTarget(file) {
  return PREVIEW_APP_MUSIC_TARGETS.has(screenIdFromFile(file));
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

function currentPreviewAppHref(step) {
  return previewAppHref(step.file);
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setMusicScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppMusicTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = file;
}

function renderMusicNav() {
  if (document.querySelector(".music-nav")) {
    return;
  }

  const index = currentMusicIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("music-nav-styles")) {
    const style = document.createElement("style");
    style.id = "music-nav-styles";
    style.textContent = `
      .music-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .music-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .music-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .music-nav a:hover {
        text-decoration: underline;
      }

      .music-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .music-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .music-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = MUSIC_FLOW[index];
  const previous = index > 0 ? MUSIC_FLOW[index - 1] : null;
  const next = index < MUSIC_FLOW.length - 1 ? MUSIC_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "music-nav";
  nav.setAttribute("aria-label", "Music cue path");

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
  app.href = currentPreviewAppHref(step);
  setTopTargetWhenEmbedded(app);
  app.textContent = "Preview app";
  wrap.appendChild(app);

  if (previous) {
    const prevLink = document.createElement("a");
    setMusicScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  } else {
    const entry = document.createElement("a");
    setMusicScreenLink(entry, MUSIC_ENTRY.file);
    entry.textContent = `Previous: ${MUSIC_ENTRY.label}`;
    wrap.appendChild(entry);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setMusicScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const handoff = document.createElement("a");
    setMusicScreenLink(handoff, MUSIC_HANDOFF.file);
    handoff.textContent = `Continue: ${MUSIC_HANDOFF.label}`;
    wrap.appendChild(handoff);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Music step ${index + 1} of ${MUSIC_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderMusicNav);
} else {
  renderMusicNav();
}
