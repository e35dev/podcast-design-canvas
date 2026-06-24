"use strict";

// Connects audio cleanup helper screens into a short review path (#583).
// Include from audio prototypes with:
//   <body data-audio-step="pause-crosstalk-cleanup">
//   <script src="../preview/audio-nav.js" defer></script>

const AUDIO_FLOW = [
  { id: "pause-crosstalk-cleanup", file: "pause-crosstalk-cleanup.html", label: "Pause & cross-talk cleanup" },
  { id: "transcript-glossary", file: "transcript-glossary.html", label: "Transcript glossary" },
];

function currentAudioIndex() {
  const fromBody = document.body.dataset.audioStep;
  if (fromBody) {
    const byId = AUDIO_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return AUDIO_FLOW.findIndex((step) => step.file === name);
}

function renderAudioNav() {
  const index = currentAudioIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("audio-nav-styles")) {
    const style = document.createElement("style");
    style.id = "audio-nav-styles";
    style.textContent = `
      .audio-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .audio-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .audio-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .audio-nav a:hover,
      .audio-nav a:focus-visible {
        text-decoration: underline;
        outline: none;
      }

      .audio-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .audio-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = AUDIO_FLOW[index];
  const previous = index > 0 ? AUDIO_FLOW[index - 1] : null;
  const next = index < AUDIO_FLOW.length - 1 ? AUDIO_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "audio-nav";
  nav.setAttribute("aria-label", "Audio cleanup helpers");

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
    start.href = "audio-caption-quality-review.html";
    start.textContent = "Continue: Caption quality review";
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.textContent = `Audio step ${index + 1} of ${AUDIO_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderAudioNav);
} else {
  renderAudioNav();
}
