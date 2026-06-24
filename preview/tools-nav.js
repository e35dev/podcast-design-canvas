"use strict";

// Connects the secondary tool screens back to the preview shell (#583).
// The five core episode-flow screens use episode-flow-nav.js (with prev/next);
// every other prototype includes this lighter bar so it is never a dead end:
//   <script src="../preview/tools-nav.js" defer></script>
// Each screen also shows its role in the episode workflow, matching the shell's
// "More tools" grouping, so a connected screen tells the creator where it fits.

const TOOL_STAGE = {
  "episode-readiness.html": "Bring in the recording",
  "speaker-role-mapping.html": "Bring in the recording",
};

function currentToolStage() {
  const name = window.location.pathname.split("/").pop() || "";
  return TOOL_STAGE[name] || "Secondary tool";
}

function renderToolsNav() {
  // Don't double up if a page already shows the core episode-flow nav.
  if (document.querySelector(".episode-flow-nav")) {
    return;
  }
  if (document.querySelector(".tools-nav")) {
    return;
  }

  if (!document.getElementById("tools-nav-styles")) {
    const style = document.createElement("style");
    style.id = "tools-nav-styles";
    style.textContent = `
      .tools-nav {
        border-bottom: 1px solid #d9e0dd;
        background: #f7faf8;
        color: #16211f;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .tools-nav .wrap {
        max-width: 1180px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
      }

      .tools-nav a {
        color: #075246;
        font-size: 13px;
        font-weight: 700;
        text-decoration: none;
      }

      .tools-nav a:hover,
      .tools-nav a:focus-visible {
        text-decoration: underline;
        outline: none;
      }

      .tools-nav .role {
        margin-left: auto;
        color: #5e6b67;
        font-size: 13px;
        font-weight: 700;
      }

      @media (max-width: 640px) {
        .tools-nav .role {
          margin-left: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const nav = document.createElement("nav");
  nav.className = "tools-nav";
  nav.setAttribute("aria-label", "Preview navigation");

  const wrap = document.createElement("div");
  wrap.className = "wrap";

  const home = document.createElement("a");
  home.href = "../preview/";
  home.textContent = "← Back to preview";
  wrap.appendChild(home);

  const guided = document.createElement("a");
  guided.href = "../preview/episode-flow.html";
  guided.textContent = "Guided episode flow";
  wrap.appendChild(guided);

  const role = document.createElement("span");
  role.className = "role";
  role.textContent = `Tools · ${currentToolStage()}`;
  wrap.appendChild(role);

  nav.appendChild(wrap);
  document.body.insertBefore(nav, document.body.firstChild);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderToolsNav);
} else {
  renderToolsNav();
}
