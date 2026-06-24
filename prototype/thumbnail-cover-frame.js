"use strict";

const surfaces = {
  large: {
    title: "Large header preview",
    detail: "Judge expression, guest presence, and title balance at the watch-page size.",
    className: "variants preview-large",
  },
  small: {
    title: "Small grid preview",
    detail: "Check whether the title still reads when the frame appears beside other recommended episodes.",
    className: "variants preview-small",
  },
  mobile: {
    title: "Mobile feed preview",
    detail: "Confirm the crop keeps both speakers and the title legible at phone-feed scale.",
    className: "variants preview-mobile",
  },
  dark: {
    title: "Dark surface preview",
    detail: "Review whether the cover still separates from a dark destination background.",
    className: "variants preview-dark",
  },
};

const frameTemplates = [
  {
    id: "reaction",
    name: "Host + guest reaction frame",
    detail: "Balanced expression and readable text make this the current publishing cover.",
    title: "Guest explains the launch story",
    shortTitle: "Launch story",
    layout: "duo",
    packageCopy: "balanced host and guest reaction",
    concerns: [
      {
        id: "small-confidence",
        surfaces: ["small"],
        title: "Check smallest preview",
        detail: "The title is readable, but it is close enough to the edge that the creator should confirm the grid crop.",
        required: false,
        action: "mark-reviewed",
        actionLabel: "Mark checked",
      },
    ],
  },
  {
    id: "guest-closeup",
    name: "Guest close-up with stronger expression",
    detail: "The expression is compelling, but the overlaid text feels tighter in small-grid preview.",
    title: "How the team fixed the launch",
    shortTitle: "Launch fix",
    layout: "guest",
    packageCopy: "guest close-up",
    concerns: [
      {
        id: "small-title",
        surfaces: ["small", "mobile"],
        title: "Title text is tight",
        detail: "Shorten the title before this frame can be sent to destinations with small recommendation cards.",
        required: true,
        action: "shorten-title",
        actionLabel: "Shorten title",
      },
    ],
  },
  {
    id: "host-solo",
    name: "Host solo frame",
    detail: "The crop stays clean, but it underplays the guest and feels less distinctive for the episode topic.",
    title: "Behind the redesign",
    shortTitle: "Redesign",
    layout: "host",
    packageCopy: "host solo alternate",
    concerns: [
      {
        id: "brand-kit",
        surfaces: ["large", "dark"],
        title: "Brand kit variant available",
        detail: "Apply the show-color treatment if the creator wants this alternate to feel more ownable.",
        required: false,
        action: "brand-kit",
        actionLabel: "Apply brand kit",
      },
    ],
  },
];

function cloneFrame(frame) {
  return {
    id: frame.id,
    name: frame.name,
    detail: frame.detail,
    title: frame.title,
    shortTitle: frame.shortTitle,
    layout: frame.layout,
    packageCopy: frame.packageCopy,
    concerns: frame.concerns.map((concern) => ({ ...concern, surfaces: concern.surfaces.slice() })),
    resolved: {},
    branded: false,
  };
}

function createInitialState() {
  return {
    selectedSurface: "large",
    activeFrameId: "reaction",
    savedFrameId: null,
    savedSignature: null,
    packageNote: "Save the active cover once the selected frame is ready for every publish surface.",
    frames: frameTemplates.map(cloneFrame),
  };
}

function frameById(state, id) {
  return state.frames.find((frame) => frame.id === id) || null;
}

function activeFrame(state) {
  return frameById(state, state.activeFrameId);
}

function concernAppliesToSurface(concern, surfaceKey) {
  return concern.surfaces.includes(surfaceKey);
}

function isConcernResolved(frame, concern) {
  return frame.resolved[concern.id] === true;
}

function unresolvedConcerns(frame, surfaceKey) {
  return frame.concerns.filter((concern) => {
    if (surfaceKey && !concernAppliesToSurface(concern, surfaceKey)) {
      return false;
    }
    return !isConcernResolved(frame, concern);
  });
}

function allSurfaceConcerns(frame) {
  return unresolvedConcerns(frame).slice().sort((a, b) => Number(b.required) - Number(a.required));
}

function requiredConcernCount(frame) {
  return allSurfaceConcerns(frame).filter((concern) => concern.required).length;
}

function coverSignature(frame) {
  if (!frame) {
    return "";
  }
  return JSON.stringify({
    id: frame.id,
    title: frame.title,
    branded: frame.branded,
    resolved: frame.resolved,
  });
}

function isSavedFrame(state, frame) {
  return state.savedFrameId === frame.id && state.savedSignature === coverSignature(frame);
}

function evaluateFrame(state, frame) {
  const surfaceConcerns = unresolvedConcerns(frame, state.selectedSurface);
  const requiredCount = requiredConcernCount(frame);
  const isActive = frame.id === state.activeFrameId;
  const isSaved = isSavedFrame(state, frame);

  if (isActive && requiredCount > 0) {
    return { badgeClass: "review", badgeText: "active review", surfaceConcerns, requiredCount, isActive, isSaved };
  }
  if (isActive) {
    return { badgeClass: "ready", badgeText: isSaved ? "saved cover" : "selected", surfaceConcerns, requiredCount, isActive, isSaved };
  }
  if (surfaceConcerns.some((concern) => concern.required)) {
    return { badgeClass: "review", badgeText: "needs edit", surfaceConcerns, requiredCount, isActive, isSaved };
  }
  return { badgeClass: "optional", badgeText: isSaved ? "saved alternate" : "alternate", surfaceConcerns, requiredCount, isActive, isSaved };
}

function exportReadiness(state) {
  const frame = activeFrame(state);
  if (!frame) {
    return {
      status: "blocked",
      title: "No active cover selected",
      detail: "Choose one frame before export readiness can clear the thumbnail item.",
      concerns: [],
    };
  }

  const concerns = allSurfaceConcerns(frame);
  const required = concerns.filter((concern) => concern.required);
  if (required.length > 0) {
    return {
      status: "blocked",
      title: "Review before export",
      detail: `${required.length} required cover concern${required.length === 1 ? "" : "s"} must be resolved before saving.`,
      frame,
      concerns,
    };
  }
  if (concerns.length > 0) {
    return {
      status: "review",
      title: "Cover ready with notes",
      detail: "The active cover can be saved, with optional checks still visible for the creator.",
      frame,
      concerns,
    };
  }
  return {
    status: "ready",
    title: "Cover ready for export",
    detail: "The active cover is clear across large, grid, mobile, and dark publish surfaces.",
    frame,
    concerns,
  };
}

function promoteFrame(state, id) {
  const frame = frameById(state, id);
  if (!frame) {
    return false;
  }
  state.activeFrameId = id;
  state.packageNote = `${frame.name} is now the active cover.`;
  return true;
}

function resolveFrameConcern(state, id, action) {
  const frame = frameById(state, id);
  if (!frame) {
    return false;
  }

  if (action === "shorten-title") {
    frame.title = frame.shortTitle;
    frame.resolved["small-title"] = true;
    state.packageNote = `${frame.name} now uses shorter title text for small previews.`;
    return true;
  }

  if (action === "brand-kit") {
    frame.branded = true;
    frame.resolved["brand-kit"] = true;
    state.packageNote = `${frame.name} now uses the show brand kit treatment. Save again to update export.`;
    return true;
  }

  if (action === "mark-reviewed") {
    frame.resolved["small-confidence"] = true;
    state.packageNote = `${frame.name} passed the smallest preview check.`;
    return true;
  }

  return false;
}

function saveActiveCover(state) {
  const readiness = exportReadiness(state);
  if (readiness.status === "blocked" || !readiness.frame) {
    state.packageNote = "Resolve required cover concerns before saving to the export package.";
    return false;
  }

  state.savedFrameId = readiness.frame.id;
  state.savedSignature = coverSignature(readiness.frame);
  state.packageNote = `${readiness.frame.name} saved as the export cover using ${readiness.frame.packageCopy}.`;
  return true;
}

function createNode(documentRef, tagName, props, children) {
  const node = documentRef.createElement(tagName);
  const settings = props || {};
  Object.keys(settings).forEach((key) => {
    const value = settings[key];
    if (key === "class") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = value;
    } else if (key === "disabled") {
      node.disabled = Boolean(value);
    } else {
      node.setAttribute(key, value);
    }
  });
  (children || []).forEach((child) => node.appendChild(child));
  return node;
}

function renderSurfaceNote(documentRef, surfaceNoteElement, surface) {
  const title = createNode(documentRef, "strong", { text: surface.title }, []);
  const detail = createNode(documentRef, "span", { text: surface.detail }, []);
  surfaceNoteElement.replaceChildren(title, detail);
}

function frameClass(frame) {
  const parts = ["frame"];
  if (frame.layout === "guest") {
    parts.push("focus-guest");
  }
  if (frame.layout === "host") {
    parts.push("focus-host");
  }
  if (frame.branded) {
    parts.push("branded");
  }
  return parts.join(" ");
}

function renderFrameArt(documentRef, state, frame) {
  const tag = createNode(documentRef, "span", {
    class: "tag",
    text: frame.id === state.activeFrameId ? "active cover" : "alternate",
  }, []);
  const host = createNode(documentRef, "div", { class: "speaker host" }, []);
  const guest = createNode(documentRef, "div", { class: "speaker guest" }, []);
  const title = createNode(documentRef, "div", { class: "title", text: frame.title }, []);
  const children = [tag, host, guest];
  if (frame.layout === "guest") {
    children.push(createNode(documentRef, "div", { class: "grid" }, []));
  }
  children.push(title);
  return createNode(documentRef, "div", { class: frameClass(frame) }, children);
}

function renderBadge(documentRef, evaluation) {
  return createNode(documentRef, "span", {
    class: `badge ${evaluation.badgeClass}`,
    text: evaluation.badgeText,
  }, []);
}

function renderFrameAction(documentRef, state, frame, concern, rerender) {
  const copy = createNode(documentRef, "div", {}, [
    createNode(documentRef, "strong", { text: concern.title }, []),
    createNode(documentRef, "span", { text: concern.detail }, []),
  ]);
  const button = createNode(documentRef, "button", {
    type: "button",
    text: concern.actionLabel,
  }, []);
  button.addEventListener("click", () => {
    resolveFrameConcern(state, frame.id, concern.action);
    rerender();
  });
  return createNode(documentRef, "div", { class: "action-row" }, [copy, button]);
}

function renderPromoteAction(documentRef, state, frame, rerender) {
  const button = createNode(documentRef, "button", {
    type: "button",
    text: "Promote to active cover",
  }, []);
  button.addEventListener("click", () => {
    promoteFrame(state, frame.id);
    rerender();
  });
  return button;
}

function renderVariant(documentRef, state, frame, rerender) {
  const evaluation = evaluateFrame(state, frame);
  const title = createNode(documentRef, "strong", { text: frame.name }, []);
  const detail = createNode(documentRef, "span", { text: frame.detail }, []);
  const headCopy = createNode(documentRef, "div", {}, [title, detail]);
  const head = createNode(documentRef, "div", { class: "head" }, [headCopy, renderBadge(documentRef, evaluation)]);

  const visibleConcerns = evaluation.isActive ? allSurfaceConcerns(frame) : evaluation.surfaceConcerns;
  const actionRows = visibleConcerns.map((concern) => renderFrameAction(documentRef, state, frame, concern, rerender));
  if (actionRows.length === 0) {
    actionRows.push(createNode(documentRef, "div", { class: "action-row" }, [
      createNode(documentRef, "div", {}, [
        createNode(documentRef, "strong", { text: evaluation.isActive ? "Keep as active cover" : "Keep as saved alternate" }, []),
        createNode(documentRef, "span", { text: evaluation.isActive ? "This frame carries into export package, metadata, and checklist surfaces." : "Retain it one tap away without replacing the active publishing cover." }, []),
      ]),
      createNode(documentRef, "span", { class: `badge ${evaluation.isActive ? "ready" : "optional"}`, text: evaluation.isActive ? "publishes" : "saved" }, []),
    ]));
  }

  const buttonRow = createNode(documentRef, "div", { class: "button-row" }, []);
  if (!evaluation.isActive) {
    buttonRow.appendChild(renderPromoteAction(documentRef, state, frame, rerender));
  }

  const bodyChildren = [head, createNode(documentRef, "div", { class: "actions" }, actionRows)];
  if (buttonRow.children.length > 0) {
    bodyChildren.push(buttonRow);
  }

  const className = evaluation.isActive ? "variant selected" : "variant";
  return createNode(documentRef, "article", { class: className }, [
    renderFrameArt(documentRef, state, frame),
    createNode(documentRef, "div", {}, bodyChildren),
  ]);
}

function renderExportSummary(documentRef, state, summaryElement) {
  const readiness = exportReadiness(state);
  const badgeClass = readiness.status === "blocked" ? "blocked" : readiness.status === "review" ? "review" : "ready";
  const badge = createNode(documentRef, "span", { class: `badge ${badgeClass}`, text: readiness.status }, []);
  const heading = createNode(documentRef, "strong", { text: readiness.title }, []);
  const detail = createNode(documentRef, "span", { text: readiness.detail }, []);
  const frameCopy = readiness.frame
    ? createNode(documentRef, "span", { text: `Active frame: ${readiness.frame.name}.` }, [])
    : createNode(documentRef, "span", { text: "No frame selected." }, []);
  summaryElement.replaceChildren(createNode(documentRef, "div", { class: "head" }, [
    createNode(documentRef, "div", {}, [heading, detail, frameCopy]),
    badge,
  ]));
  return readiness;
}

function renderExportWarnings(documentRef, warningsElement, readiness) {
  if (!readiness.frame) {
    warningsElement.replaceChildren(createNode(documentRef, "div", { class: "warning blocked" }, [
      createNode(documentRef, "strong", { text: "Missing active cover" }, []),
      createNode(documentRef, "span", { text: "Promote one frame before publishing destinations can receive thumbnail metadata." }, []),
    ]));
    return;
  }

  if (readiness.concerns.length === 0) {
    warningsElement.replaceChildren(createNode(documentRef, "div", { class: "warning ready" }, [
      createNode(documentRef, "strong", { text: "All publish surfaces clear" }, []),
      createNode(documentRef, "span", { text: "Large header, grid, mobile, and dark previews are ready for export." }, []),
    ]));
    return;
  }

  warningsElement.replaceChildren(...readiness.concerns.map((concern) => {
    const tone = concern.required ? "warning blocked" : "warning";
    return createNode(documentRef, "div", { class: tone }, [
      createNode(documentRef, "strong", { text: concern.title }, []),
      createNode(documentRef, "span", { text: concern.detail }, []),
    ]);
  }));
}

function initThumbnailCoverFrame(documentRef) {
  const state = createInitialState();
  const toolbarElement = documentRef.querySelector("#surfaceToolbar");
  const variantsElement = documentRef.querySelector("#variants");
  const surfaceNoteElement = documentRef.querySelector("#surfaceNote");
  const exportSummaryElement = documentRef.querySelector("#exportSummary");
  const exportWarningsElement = documentRef.querySelector("#exportWarnings");
  const packageNoteElement = documentRef.querySelector("#packageNote");
  const saveButton = documentRef.querySelector("#saveCover");

  function render() {
    const surface = surfaces[state.selectedSurface];
    variantsElement.className = surface.className;
    renderSurfaceNote(documentRef, surfaceNoteElement, surface);

    Array.from(toolbarElement.querySelectorAll("button")).forEach((button) => {
      const active = button.dataset.surface === state.selectedSurface;
      button.className = active ? "active" : "";
      button.setAttribute("aria-pressed", String(active));
    });

    variantsElement.replaceChildren(...state.frames.map((frame) => renderVariant(documentRef, state, frame, render)));

    const readiness = renderExportSummary(documentRef, state, exportSummaryElement);
    renderExportWarnings(documentRef, exportWarningsElement, readiness);
    saveButton.disabled = readiness.status === "blocked" || (readiness.frame && isSavedFrame(state, readiness.frame));
    packageNoteElement.textContent = state.packageNote;
  }

  Array.from(toolbarElement.querySelectorAll("button")).forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedSurface = button.dataset.surface;
      render();
    });
  });

  saveButton.addEventListener("click", () => {
    saveActiveCover(state);
    render();
  });

  render();
  return { state, render };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    surfaces,
    frameTemplates,
    createInitialState,
    frameById,
    activeFrame,
    unresolvedConcerns,
    coverSignature,
    isSavedFrame,
    evaluateFrame,
    exportReadiness,
    promoteFrame,
    resolveFrameConcern,
    saveActiveCover,
    initThumbnailCoverFrame,
  };
} else {
  initThumbnailCoverFrame(document);
}
