"use strict";

(function (global) {
  const layouts = {
    interview: {
      activeLabel: "Using interview",
      readyLabel: "Use interview",
      scene: "Interview scene",
      runtime: "Host + guest",
      rowClass: "",
      visibleSlots: ["host", "guest", "broll"],
      requiredSlots: ["host", "guest"],
    },
    solo: {
      activeLabel: "Using solo",
      readyLabel: "Use solo",
      scene: "Solo episode",
      runtime: "One speaker",
      rowClass: "layout-solo",
      visibleSlots: ["host", "broll"],
      requiredSlots: ["host"],
    },
    panel: {
      activeLabel: "Using panel",
      readyLabel: "Use panel",
      scene: "Panel discussion",
      runtime: "Host + two guests",
      rowClass: "layout-panel",
      visibleSlots: ["host", "guest", "guest-b", "broll"],
      requiredSlots: ["host", "guest", "guest-b"],
    },
  };

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function isVideoFile(file) {
    return Boolean(file && typeof file.type === "string" && file.type.indexOf("video/") === 0);
  }

  function createLayoutFirstController(doc, options = {}) {
    const urlApi = options.URL || global.URL || {};
    const layoutButtons = toArray(doc.querySelectorAll("[data-layout]"));
    const zones = toArray(doc.querySelectorAll(".drop-zone[data-slot]"));
    const zonesBySlot = {};
    zones.forEach((zone) => {
      zonesBySlot[zone.dataset.slot] = zone;
    });

    const sceneLabel = doc.getElementById("layout-scene-label");
    const runtimeLabel = doc.getElementById("layout-runtime-label");
    const speakerRow = doc.getElementById("speaker-row");
    const slotStatus = doc.getElementById("layout-slot-status");
    const resetButton = doc.getElementById("layout-reset");
    const continueLink = doc.getElementById("layout-continue");
    const errorCard = doc.getElementById("layout-error-card");
    const errorText = doc.getElementById("layout-error");

    let currentLayout = "interview";
    let objectUrls = [];

    function currentDefinition() {
      return layouts[currentLayout] || layouts.interview;
    }

    function visibleSlots() {
      const visible = new Set(currentDefinition().visibleSlots);
      return zones.filter((zone) => visible.has(zone.dataset.slot));
    }

    function requiredSlots() {
      const required = new Set(currentDefinition().requiredSlots);
      return zones.filter((zone) => required.has(zone.dataset.slot));
    }

    function filledRequiredSlots() {
      return requiredSlots().filter((zone) => zone.classList.contains("filled"));
    }

    function setError(message) {
      if (!errorCard || !errorText) return;
      errorText.textContent = message;
      errorCard.hidden = !message;
    }

    function updateContinueState() {
      if (!continueLink) return;
      const required = requiredSlots();
      const ready = required.length > 0 && required.every((zone) => zone.classList.contains("filled"));
      continueLink.classList.toggle("is-disabled", !ready);
      continueLink.setAttribute("aria-disabled", ready ? "false" : "true");
      if (ready && continueLink.dataset.readyHref) {
        continueLink.href = continueLink.dataset.readyHref;
      } else {
        continueLink.removeAttribute("href");
      }
    }

    function updateSlotStatus(message) {
      if (!slotStatus) return;
      if (message) {
        slotStatus.textContent = message;
        updateContinueState();
        return;
      }

      const total = requiredSlots().length;
      const filled = filledRequiredSlots().length;
      if (filled === total) {
        slotStatus.textContent = "Required speaker videos ready. Optional b-roll can be added later.";
      } else {
        slotStatus.textContent = `${filled} of ${total} required speaker videos ready. Optional b-roll can be added later.`;
      }
      updateContinueState();
    }

    function revokeZoneUrl(zone) {
      const url = zone.dataset.objectUrl;
      if (url && typeof urlApi.revokeObjectURL === "function") {
        urlApi.revokeObjectURL(url);
      }
      zone.dataset.objectUrl = "";
      objectUrls = objectUrls.filter((candidate) => candidate !== url);
    }

    function clearZone(zone) {
      revokeZoneUrl(zone);
      zone.classList.remove("filled");
      const placed = zone.querySelector(".placed-video");
      if (placed) placed.remove();
      const input = zone.querySelector("[data-file-input]");
      if (input) input.value = "";
    }

    function clearAllZones() {
      zones.forEach(clearZone);
    }

    function placeVideoFile(zone, file) {
      if (!zone || zone.classList.contains("is-hidden")) {
        return;
      }

      if (!isVideoFile(file)) {
        setError("Drop an MP4, MOV, or WebM video into a visible slot.");
        updateSlotStatus();
        return;
      }

      setError("");
      clearZone(zone);
      zone.classList.add("filled");

      const wrap = doc.createElement("div");
      wrap.className = "placed-video";

      const video = doc.createElement("video");
      video.controls = true;
      video.muted = true;
      if (typeof urlApi.createObjectURL === "function") {
        const url = urlApi.createObjectURL(file);
        objectUrls.push(url);
        zone.dataset.objectUrl = url;
        video.src = url;
      }

      const label = doc.createElement("span");
      label.textContent = file.name || "Video ready";

      const remove = doc.createElement("button");
      remove.type = "button";
      remove.className = "placed-remove";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove the " + (zone.dataset.slot || "video") + " video");
      remove.addEventListener("click", (event) => {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        removeVideo(zone);
      });

      wrap.appendChild(video);
      wrap.appendChild(label);
      wrap.appendChild(remove);
      zone.insertBefore(wrap, zone.firstChild);
      updateSlotStatus();
    }

    // Clear a single placed video without disturbing the other slots, so a creator who
    // picks the wrong file can fix just that slot instead of resetting the whole layout.
    function removeVideo(zone) {
      if (!zone || !zone.classList.contains("filled")) {
        return;
      }
      clearZone(zone);
      setError("");
      updateSlotStatus();
    }

    function applyLayout(name) {
      const layout = layouts[name] || layouts.interview;
      currentLayout = layouts[name] ? name : "interview";
      const visible = new Set(layout.visibleSlots);

      if (sceneLabel) sceneLabel.textContent = layout.scene;
      if (runtimeLabel) runtimeLabel.textContent = layout.runtime;
      if (speakerRow) {
        speakerRow.className = "speaker-row" + (layout.rowClass ? " " + layout.rowClass : "");
      }

      zones.forEach((zone) => {
        const isVisible = visible.has(zone.dataset.slot);
        zone.classList.toggle("is-hidden", !isVisible);
        clearZone(zone);
      });

      layoutButtons.forEach((button) => {
        const buttonLayout = layouts[button.dataset.layout] || layouts.interview;
        const active = button.dataset.layout === currentLayout;
        const label = button.querySelector("[data-layout-label]");
        button.setAttribute("aria-pressed", active ? "true" : "false");
        if (label) label.textContent = active ? buttonLayout.activeLabel : buttonLayout.readyLabel;
      });

      setError("");
      updateSlotStatus();
    }

    layoutButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyLayout(button.dataset.layout);
      });
    });

    zones.forEach((zone) => {
      const input = zone.querySelector("[data-file-input]");
      zone.addEventListener("dragover", (event) => {
        event.preventDefault();
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragleave", () => {
        zone.classList.remove("drag-over");
      });
      zone.addEventListener("drop", (event) => {
        event.preventDefault();
        zone.classList.remove("drag-over");
        const file = event.dataTransfer.files && event.dataTransfer.files[0];
        placeVideoFile(zone, file);
      });
      if (input) {
        input.addEventListener("change", () => {
          placeVideoFile(zone, input.files && input.files[0]);
        });
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        clearAllZones();
        setError("");
        updateSlotStatus();
      });
    }

    if (continueLink) {
      continueLink.addEventListener("click", (event) => {
        if (continueLink.getAttribute("aria-disabled") === "true") {
          event.preventDefault();
        }
      });
    }

    applyLayout(currentLayout);

    return {
      applyLayout,
      placeVideoFile,
      removeVideo,
      resetVideos: clearAllZones,
      requiredSlots,
      visibleSlots,
      filledRequiredSlots,
      zonesBySlot,
      updateSlotStatus,
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createLayoutFirstController, isVideoFile, layouts };
    return;
  }

  if (global.document) {
    if (global.document.readyState === "loading") {
      global.document.addEventListener("DOMContentLoaded", () => createLayoutFirstController(global.document));
    } else {
      createLayoutFirstController(global.document);
    }
  }
}(typeof window !== "undefined" ? window : globalThis));
