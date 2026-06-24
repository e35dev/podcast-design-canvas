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
  { id: "off-camera-speaker-presence", file: "off-camera-speaker-presence.html", label: "Off-camera speaker presence" },
];

const SPEAKER_SETUP_ENTRY = { file: "speaker-role-mapping.html?path=episode", label: "Speaker roles" };
const SPEAKER_SETUP_HANDOFF = { file: "preset-style-picker.html" };

const PREVIEW_APP_SETUP_TARGETS = new Set([
  screenIdFromFile(SPEAKER_SETUP_ENTRY.file),
  screenIdFromFile(SPEAKER_SETUP_HANDOFF.file),
  ...SPEAKER_SETUP_FLOW.map((step) => step.id),
]);
const SETUP_IN_PAGE_TARGETS = new Set([
  screenIdFromFile(SPEAKER_SETUP_ENTRY.file),
  ...SPEAKER_SETUP_FLOW.map((step) => step.id),
]);

// Core episode flow screens that speaker setup prototypes hand off to when
// attribution review finds sync timing problems or guest/off-camera reviews
// need social context or preset comparison fixes.
const PREVIEW_APP_SETUP_HANDOFFS = new Map([
  ["speaker-sync-repair", "?path=episode"],
  ["social-context-intake", "?path=ingest"],
  ["preset-comparison-preview", "?path=episode"],
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
  return new URLSearchParams((query || "").replace(/^\?/, "")).get("path") || "";
}

function pathQuerySuffix() {
  const path = new URLSearchParams(window.location.search).get("path");
  return path === "episode" ? "?path=episode" : "";
}

function queryWithoutHash(file) {
  return ((file || "").split("#")[0].split("?")[1] || "");
}

function mergeRouteSearch(file, overrides = {}) {
  const raw = file || "";
  const hashIndex = raw.indexOf("#");
  const pathPart = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : raw.slice(hashIndex);
  const qIndex = pathPart.indexOf("?");
  const base = qIndex === -1 ? pathPart : pathPart.slice(0, qIndex);
  const params = new URLSearchParams(qIndex === -1 ? "" : pathPart.slice(qIndex + 1));

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const search = params.toString();
  return `${base}${search ? `?${search}` : ""}${hash}`;
}

function routeSearchFromFile(file) {
  const filePath = pathFromQuery(queryWithoutHash(file));
  const shellPath = pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  const path = filePath || shellPath;
  return path === "episode" ? "?path=episode" : "";
}

function setupHandoffSearch(file) {
  const screen = screenIdFromFile(file);
  return PREVIEW_APP_SETUP_HANDOFFS.has(screen) ? PREVIEW_APP_SETUP_HANDOFFS.get(screen) : null;
}

function isPreviewAppSetupRoute(file) {
  return isPreviewAppSetupTarget(file) || setupHandoffSearch(file) !== null;
}

function previewAppHref(file) {
  const screen = screenIdFromFile(file);
  const handoffSearch = setupHandoffSearch(file);
  if (handoffSearch !== null) {
    return `../preview/app.html#${screen}${handoffSearch}`;
  }
  return `../preview/app.html#${screen}${routeSearchFromFile(file)}`;
}

function currentPreviewAppHref(step) {
  return previewAppHref(`${step.file}${pathQuerySuffix()}`);
}

function hrefWithPath(file) {
  const shellPath = new URLSearchParams(window.location.search).get("path");
  if (shellPath !== "episode") {
    return file;
  }
  if (pathFromQuery(queryWithoutHash(file)) === "episode") {
    return file;
  }
  return mergeRouteSearch(file, { path: "episode" });
}

function resolveSetupLink(file) {
  const screen = screenIdFromFile(file);
  if (PREVIEW_APP_SETUP_HANDOFFS.has(screen)) {
    const handoffSearch = PREVIEW_APP_SETUP_HANDOFFS.get(screen);
    const path = new URLSearchParams(handoffSearch.replace(/^\?/, "")).get("path");
    return mergeRouteSearch(file, { path });
  }
  return hrefWithPath(file);
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setSetupScreenLink(link, file) {
  const resolved = resolveSetupLink(file);
  if (isEmbeddedInPreviewApp() && isPreviewAppSetupRoute(resolved)) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function isLocalScreenHref(href) {
  return Boolean(href) && !href.startsWith("#") && !href.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

function shouldNormalizeSetupHref(href) {
  if (!isLocalScreenHref(href)) {
    return false;
  }
  const screen = screenIdFromFile(href);
  if (SETUP_IN_PAGE_TARGETS.has(screen)) {
    return true;
  }
  if (PREVIEW_APP_SETUP_HANDOFFS.has(screen)) {
    return isEmbeddedInPreviewApp() || new URLSearchParams(window.location.search).get("path") === "episode";
  }
  return false;
}

function normalizeSetupScreenLink(link) {
  const href = link.getAttribute("href") || "";
  if (shouldNormalizeSetupHref(href)) {
    setSetupScreenLink(link, href);
  }
}

function normalizeSetupScreenLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a[href]").forEach((link) => {
    normalizeSetupScreenLink(link);
  });
}

function normalizeSetupLinkClick(event) {
  const link = event.target && typeof event.target.closest === "function"
    ? event.target.closest("a[href]")
    : null;
  if (link) {
    normalizeSetupScreenLink(link);
  }
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
  app.href = currentPreviewAppHref(step);
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
  normalizeSetupScreenLinks(document);
  document.addEventListener("click", normalizeSetupLinkClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderSpeakerSetupNav);
} else {
  renderSpeakerSetupNav();
}
