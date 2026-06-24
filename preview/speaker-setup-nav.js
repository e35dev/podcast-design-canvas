"use strict";

// Connects the speaker-setup prototype screens into a short setup path (#582 / #583).
// These screens confirm and prepare each speaker after roles are assigned, before
// the core episode path. Include from speaker-setup prototypes with:
//   <body data-setup-step="speaker-attribution-review">
//   <script src="../preview/speaker-setup-nav.js" defer></script>

const SPEAKER_SETUP_FLOW = [
  { id: "speaker-attribution-review", file: "speaker-attribution-review.html", label: "Speaker attribution review" },
  { id: "guest-profile-reuse", file: "guest-profile-reuse.html", label: "Guest profile reuse" },
  { id: "speaker-visual-match", file: "speaker-visual-match.html", label: "Speaker visual match" },
  { id: "speaker-eye-line-coherence", file: "speaker-eye-line-coherence.html", label: "Speaker eye-line coherence" },
];

function currentSetupIndex() {
  const fromBody = document.body.dataset.setupStep;
  if (fromBody) {
    const byId = SPEAKER_SETUP_FLOW.findIndex((step) => step.id === fromBody);
    if (byId >= 0) {
      return byId;
    }
  }

  const name = window.location.pathname.split("/").pop() || "";
  return SPEAKER_SETUP_FLOW.findIndex((step) => step.file === name);
}

function renderSpeakerSetupNav() {
  if (document.querySelector(".speaker-setup-nav")) {
    return;
  }

  const index = currentSetupIndex();
  if (index < 0) {
    return;
  }

  if (!document.getElementById("speaker-setup-nav-styles")) {
    const style = document.createElement("style");
    style.id = "speaker-setup-nav-styles";
    style.textContent = `
      .speaker-setup-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .speaker-setup-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .speaker-setup-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .speaker-setup-nav a:hover {
        text-decoration: underline;
      }

      .speaker-setup-nav a:focus-visible {
        text-decoration: underline;
        outline: 2px solid #136f63;
        outline-offset: 2px;
      }

      .speaker-setup-nav .step {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .speaker-setup-nav .step {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const step = SPEAKER_SETUP_FLOW[index];
  const previous = index > 0 ? SPEAKER_SETUP_FLOW[index - 1] : null;
  const next = index < SPEAKER_SETUP_FLOW.length - 1 ? SPEAKER_SETUP_FLOW[index + 1] : null;

  const nav = document.createElement("nav");
  nav.className = "speaker-setup-nav";
  nav.setAttribute("aria-label", "Speaker setup path");

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
  } else {
    const roles = document.createElement("a");
    roles.href = "speaker-role-mapping.html?path=episode";
    roles.textContent = "Previous: Speaker roles";
    wrap.appendChild(roles);
  }

  if (next) {
    const nextLink = document.createElement("a");
    nextLink.href = next.file;
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const start = document.createElement("a");
    start.href = "preset-style-picker.html";
    start.textContent = "Continue: Pick a preset style";
    wrap.appendChild(start);
  }

  const stepLabel = document.createElement("span");
  stepLabel.className = "step";
  stepLabel.setAttribute("aria-current", "step");
  stepLabel.textContent = `Speaker setup step ${index + 1} of ${SPEAKER_SETUP_FLOW.length} · ${step.label}`;
  wrap.appendChild(stepLabel);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderSpeakerSetupNav);
} else {
  renderSpeakerSetupNav();
}
