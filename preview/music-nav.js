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

// Music screens hand off to these owning screens when a review item needs a fix.
const MUSIC_FIX_PATHS = {
  "intro-outro-builder.html": "episode",
  "export-readiness-review.html": "episode",
  "show-notes-assembly.html": "publish",
};

const PREVIEW_APP_MUSIC_TARGETS = new Set([
  screenIdFromFile(MUSIC_ENTRY.file),
  screenIdFromFile(MUSIC_HANDOFF.file),
  ...MUSIC_FLOW.map((step) => step.id),
]);

const PREVIEW_APP_CROSS_PATH_TARGETS = new Set(
  Object.keys(MUSIC_FIX_PATHS).map((file) => screenIdFromFile(file)),
);

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

function pathFromQuery(query) {
  return new URLSearchParams((query || "").replace(/^\?/, "")).get("path") || "";
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

function pathQuerySuffix() {
  const path = new URLSearchParams(window.location.search).get("path");
  return path === "episode" ? "?path=episode" : "";
}

function routeSearchFromFile(file) {
  const filePath = pathFromQuery(queryWithoutHash(file));
  const shellPath = pathFromQuery(pathQuerySuffix().replace(/^\?/, ""));
  const path = filePath || shellPath;
  return path === "episode" || path === "publish" ? `?path=${path}` : "";
}

function previewAppHref(file) {
  return `../preview/app.html#${screenIdFromFile(file)}${routeSearchFromFile(file)}`;
}

function currentPreviewAppHref(step) {
  return previewAppHref(hrefWithPath(step.file));
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

function linkBase(href) {
  return (href || "").split("#")[0].split("?")[0];
}

function resolveMusicLink(file) {
  const base = linkBase(file);
  if (Object.prototype.hasOwnProperty.call(MUSIC_FIX_PATHS, base)) {
    return mergeRouteSearch(file, { path: MUSIC_FIX_PATHS[base] });
  }
  return hrefWithPath(file);
}

function routesThroughPreviewApp(file) {
  return isPreviewAppMusicTarget(file) || PREVIEW_APP_CROSS_PATH_TARGETS.has(screenIdFromFile(file));
}

function setTopTargetWhenEmbedded(link) {
  if (isEmbeddedInPreviewApp()) {
    link.target = "_top";
  }
}

function setMusicScreenLink(link, file) {
  const resolved = resolveMusicLink(file);
  if (isEmbeddedInPreviewApp() && routesThroughPreviewApp(file)) {
    link.href = previewAppHref(resolved);
    link.target = "_top";
    return;
  }

  link.href = resolved;
}

function isLocalScreenHref(href) {
  return Boolean(href) && !href.startsWith("#") && !href.startsWith("//") && !/^[a-z][a-z0-9+.-]*:/i.test(href);
}

function shouldNormalizeMusicHref(href) {
  return isLocalScreenHref(href) && (
    isPreviewAppMusicTarget(href) ||
    Object.prototype.hasOwnProperty.call(MUSIC_FIX_PATHS, linkBase(href))
  );
}

function normalizeMusicScreenLink(link) {
  const href = link.getAttribute("href") || "";
  if (shouldNormalizeMusicHref(href)) {
    setMusicScreenLink(link, href);
  }
}

function normalizeMusicScreenLinks(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }

  root.querySelectorAll("a[href]").forEach(normalizeMusicScreenLink);
}

function normalizeMusicLinkClick(event) {
  const link = event.target && typeof event.target.closest === "function"
    ? event.target.closest("a[href]")
    : null;
  if (link) {
    normalizeMusicScreenLink(link);
  }
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
  normalizeMusicScreenLinks(document);
  document.addEventListener("click", normalizeMusicLinkClick);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderMusicNav);
} else {
  renderMusicNav();
}
