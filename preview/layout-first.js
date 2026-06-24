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

  // Creator-facing names for each speaker slot, used when telling the creator which
  // required videos are still missing before they can continue.
  const SLOT_LABELS = {
    host: "Host",
    guest: "Guest",
    "guest-b": "Guest 2",
    broll: "B-roll",
  };

  function formatList(items) {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function isVideoFile(file) {
    return Boolean(file && typeof file.type === "string" && file.type.indexOf("video/") === 0);
  }

  // A stable identity for a dropped recording. Display name alone is not enough — separate
  // speaker recordings are often exported with the same name (recording.mp4, riverside-track.mp4),
  // so we key on name plus size and modified time. When neither size nor time is available we
  // return "" and never claim a duplicate, avoiding a false block on valid separate tracks.
  function fileSignature(file) {
    if (!file) return "";
    const hasSize = file.size !== undefined && file.size !== null;
    const hasTime = file.lastModified !== undefined && file.lastModified !== null;
    if (!hasSize && !hasTime) return "";
    const parts = ["name:" + (file.name || "")];
    if (hasSize) parts.push("size:" + file.size);
    if (hasTime) parts.push("mtime:" + file.lastModified);
    return parts.join("|");
  }

  function createLayoutFirstController(doc, options = {}) {
    const urlApi = options.URL || global.URL || {};
    const storage = options.storage || global.sessionStorage;
    const handoff = options.handoff || global.PodcastLayoutHandoff;
    const layoutButtons = toArray(doc.querySelectorAll("[data-layout]"));
    const zones = toArray(doc.querySelectorAll(".drop-zone[data-slot]"));
    const zonesBySlot = {};
    const slotIndicators = {};
    zones.forEach((zone) => {
      zonesBySlot[zone.dataset.slot] = zone;
      // A per-slot status badge rendered inside the slot on the canvas, so the creator can see
      // at the slot itself whether it still needs a video — not only in the side-panel summary.
      const indicator = doc.createElement("span");
      indicator.className = "slot-state";
      zone.appendChild(indicator);
      slotIndicators[zone.dataset.slot] = indicator;
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

    // The same recording placed in two visible speaker slots would put one person in two
    // speaker frames. We compare file identity (see fileSignature), not display name, and
    // return the creator-facing names of any slots that repeat the same recording.
    function duplicateFileNames() {
      const seen = Object.create(null);
      const duplicates = [];
      visibleSlots().forEach((zone) => {
        if (!zone.classList.contains("filled")) return;
        const sig = (zone.dataset.fileSig || "").trim();
        if (!sig) return;
        if (seen[sig]) {
          const name = (zone.dataset.fileName || "").trim() || sig;
          if (duplicates.indexOf(name) === -1) duplicates.push(name);
        } else {
          seen[sig] = true;
        }
      });
      return duplicates;
    }

    function updateContinueState() {
      if (!continueLink) return;
      const required = requiredSlots();
      const ready = required.length > 0
        && required.every((zone) => zone.classList.contains("filled"))
        && duplicateFileNames().length === 0;
      continueLink.classList.toggle("is-disabled", !ready);
      continueLink.setAttribute("aria-disabled", ready ? "false" : "true");
      if (ready && continueLink.dataset.readyHref) {
        const state = handoff && handoff.stateFromZones(currentLayout, zones);
        if (handoff && state) {
          handoff.save(storage, state);
          continueLink.href = handoff.hrefWithState(continueLink.dataset.readyHref, state);
        } else {
          continueLink.href = continueLink.dataset.readyHref;
        }
      } else {
        continueLink.removeAttribute("href");
        if (handoff && typeof handoff.clear === "function") {
          handoff.clear(storage);
        }
      }
    }

    // Reflect each visible slot's own assignment state on the canvas: a filled slot reads
    // "Ready", a still-empty required slot reads "Needs video", and the optional b-roll slot
    // reads "Optional". Hidden slots show nothing. This makes missing required assignments
    // visible at the slot, completing the side-panel summary rather than replacing it.
    function updateSlotIndicators() {
      const required = new Set(currentDefinition().requiredSlots);
      zones.forEach((zone) => {
        const indicator = slotIndicators[zone.dataset.slot];
        if (!indicator) return;
        indicator.classList.remove("is-ready", "is-missing", "is-optional");
        if (zone.classList.contains("is-hidden")) {
          indicator.textContent = "";
          indicator.hidden = true;
          return;
        }
        indicator.hidden = false;
        if (zone.classList.contains("filled")) {
          indicator.textContent = "Ready";
          indicator.classList.add("is-ready");
        } else if (required.has(zone.dataset.slot)) {
          indicator.textContent = "Needs video";
          indicator.classList.add("is-missing");
        } else {
          indicator.textContent = "Optional";
          indicator.classList.add("is-optional");
        }
      });
    }

    function updateSlotStatus(message) {
      updateSlotIndicators();
      if (!slotStatus) return;
      if (message) {
        slotStatus.textContent = message;
        updateContinueState();
        return;
      }

      const duplicates = duplicateFileNames();
      const total = requiredSlots().length;
      const filled = filledRequiredSlots().length;
      const brollZone = zonesBySlot["broll"];
      const brollNote = brollZone && brollZone.classList.contains("filled")
        ? "Optional b-roll is in place."
        : "Optional b-roll can be added later.";
      if (duplicates.length > 0) {
        slotStatus.textContent =
          "The same video is in more than one speaker slot. Give each speaker a separate recording before you continue.";
      } else if (filled === total) {
        slotStatus.textContent = `Required speaker videos ready. ${brollNote}`;
      } else {
        const missingNames = requiredSlots()
          .filter((zone) => !zone.classList.contains("filled"))
          .map((zone) => SLOT_LABELS[zone.dataset.slot] || zone.dataset.slot);
        const noun = missingNames.length > 1 ? "videos" : "video";
        slotStatus.textContent =
          `${filled} of ${total} required speaker videos ready. Still need the ${formatList(missingNames)} ${noun}. ${brollNote}`;
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
      zone.dataset.fileName = "";
      zone.dataset.fileSig = "";
    }

    function clearAllZones() {
      zones.forEach(clearZone);
    }

    function clearMatchingSource(zone, file) {
      const incomingSig = fileSignature(file);
      if (!incomingSig) {
        return;
      }
      zones.forEach((other) => {
        if (other !== zone && other.dataset.fileSig === incomingSig) {
          clearZone(other);
        }
      });
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

      // A 0-byte file is a failed or aborted export, not a usable recording. Reject it so
      // it never fills a slot or counts toward the Continue gate. Guard on === 0 (not
      // falsy) so files whose size is unknown are still accepted.
      if (typeof file.size === "number" && file.size === 0) {
        setError("That video file is empty. Re-export it and place the finished file.");
        updateSlotStatus();
        return;
      }

      setError("");
      clearMatchingSource(zone, file);
      clearZone(zone);
      zone.classList.add("filled");
      zone.dataset.fileName = file.name || "";
      zone.dataset.fileSig = fileSignature(file);

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
      // The Remove button lived inside the cleared video, so keyboard/screen-reader focus
      // would otherwise fall to the page body. Return it to this slot's file input — the
      // surviving "Choose <slot> video" control — so the creator stays oriented.
      const input = zone.querySelector("[data-file-input]");
      if (input && typeof input.focus === "function") {
        input.focus();
      }
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

      // Keep videos already placed in slots that stay visible, so switching layout to add
      // or drop a speaker doesn't discard the work a creator has already done. Only slots
      // that leave the new layout are cleared.
      zones.forEach((zone) => {
        const isVisible = visible.has(zone.dataset.slot);
        zone.classList.toggle("is-hidden", !isVisible);
        if (!isVisible) {
          clearZone(zone);
        }
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
      duplicateFileNames,
      zonesBySlot,
      slotIndicators,
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
