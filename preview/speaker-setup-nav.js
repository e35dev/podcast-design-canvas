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

const SPEAKER_SETUP_ENTRY = { file: "speaker-role-mapping.html?path=episode", label: "Speaker roles" };
const SPEAKER_SETUP_HANDOFF = { file: "preset-style-picker.html" };

const PREVIEW_APP_SETUP_TARGETS = new Set([
  screenIdFromFile(SPEAKER_SETUP_ENTRY.file),
  screenIdFromFile(SPEAKER_SETUP_HANDOFF.file),
  ...SPEAKER_SETUP_FLOW.map((step) => step.id),
]);

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

function screenIdFromFile(file) {
  const clean = (file || "").split("#")[0].split("?")[0];
  const name = clean.split("/").pop() || "";
  return name.replace(/\.html$/, "");
}

function isPreviewAppSetupTarget(file) {
  return PREVIEW_APP_SETUP_TARGETS.has(screenIdFromFile(file));
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
  return path === "episode" ? "?path=episode" : "";
}

function routeSearchFromFile(file) {
  const query = (file || "").split("?")[1] || "";
  const path = pathFromQuery(query) || pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  return path === "episode" ? "?path=episode" : "";
}

function previewAppHref(file) {
  return `../preview/app.html#${screenIdFromFile(file)}${routeSearchFromFile(file)}`;
}

function hrefWithPath(file) {
  const base = (file || "").split("?")[0];
  if (pathFromQuery((file || "").split("?")[1] || "") === "episode") {
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

function setSetupScreenLink(link, file) {
  if (isEmbeddedInPreviewApp() && isPreviewAppSetupTarget(file)) {
    link.href = previewAppHref(file);
    link.target = "_top";
    return;
  }

  link.href = hrefWithPath(file);
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
    setSetupScreenLink(prevLink, previous.file);
    prevLink.textContent = `Previous: ${previous.label}`;
    wrap.appendChild(prevLink);
  } else {
    const roles = document.createElement("a");
    setSetupScreenLink(roles, SPEAKER_SETUP_ENTRY.file);
    roles.textContent = `Previous: ${SPEAKER_SETUP_ENTRY.label}`;
    wrap.appendChild(roles);
  }

  if (next) {
    const nextLink = document.createElement("a");
    setSetupScreenLink(nextLink, next.file);
    nextLink.textContent = `Next: ${next.label}`;
    wrap.appendChild(nextLink);
  } else {
    const start = document.createElement("a");
    setSetupScreenLink(start, SPEAKER_SETUP_HANDOFF.file);
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
