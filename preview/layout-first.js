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

  const VIDEO_EXTENSIONS = [".mp4", ".m4v", ".mov", ".webm", ".ogv", ".ogg", ".mkv", ".mpg", ".mpeg"];

  function hasVideoExtension(name) {
    const lower = String(name || "").toLowerCase();
    return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
  }

  // A file counts as a video when its MIME type is a video/* type. Drag-and-drop bypasses the
  // input's `accept="video/*"` filter, and some browsers/OSes report an empty type for a valid
  // recording — so when the type is missing we fall back to a known video file extension rather
  // than reject a real .mp4/.mov/.webm. A non-empty, non-video type (e.g. image/png) is still
  // rejected, so this never loosens the guard for files the browser positively identifies.
  function isVideoFile(file) {
    if (!file) return false;
    const type = typeof file.type === "string" ? file.type : "";
    if (type.indexOf("video/") === 0) return true;
    // Drag-and-drop often reports application/octet-stream for a real recording; treat it like
    // a missing type and fall back to the file extension, but never loosen a positive non-video type.
    if (type === "" || type === "application/octet-stream") return hasVideoExtension(file.name);
    return false;
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
    // Videos set aside when their slot leaves the current layout, keyed by slot, so
    // switching back to a compatible layout restores the placement instead of discarding it.
    const setAside = Object.create(null);
    // Rejection state for slots that leave the layout while still invalid, so switching
    // back does not downgrade them to an untouched "Needs video" empty slot.
    const invalidAside = Object.create(null);

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

    function slotName(zone) {
      const slot = zone && zone.dataset && zone.dataset.slot;
      return SLOT_LABELS[slot] || "selected";
    }

    // When a slot rejects a file, mark that slot (not just the shared error line) so the
    // creator can see which assignment failed — #1131 asks for invalid slot assignments to
    // be clearly indicated. The flag clears when a valid file lands or the slot is cleared.
    function flagInvalidSlot(zone, message) {
      // Only the slot that just rejected a file should be flagged — a prior rejection on
      // another slot must not keep its outline once the error names a different slot.
      zones.forEach((candidate) => {
        if (candidate !== zone && candidate.classList) {
          if (candidate.classList.contains("is-invalid")) {
            delete invalidAside[candidate.dataset.slot];
          }
          candidate.classList.remove("is-invalid");
          candidate.dataset.invalidMessage = "";
        }
      });
      if (zone && zone.classList) zone.classList.add("is-invalid");
      if (zone && zone.dataset) zone.dataset.invalidMessage = message;
      setError(message);
    }

    function firstInvalidZone() {
      return zones.find((zone) => {
        return zone.classList.contains("is-invalid") && !zone.classList.contains("is-hidden");
      });
    }

    function promoteInvalidAside() {
      if (firstInvalidZone()) return;
      const zone = zones.find((candidate) => {
        const slot = candidate.dataset.slot;
        return !candidate.classList.contains("is-hidden")
          && !candidate.classList.contains("filled")
          && invalidAside[slot];
      });
      if (!zone) return;
      const slot = zone.dataset.slot;
      zone.classList.add("is-invalid");
      zone.dataset.invalidMessage = invalidAside[slot];
      delete invalidAside[slot];
    }

    function syncInvalidError() {
      const invalid = firstInvalidZone();
      const message = invalid && invalid.dataset && invalid.dataset.invalidMessage;
      setError(message || "");
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

    // Visible speaker slots that share the same recording identity block Continue even
    // when each slot looks filled. Return them in layout order for guidance focus.
    function duplicateBlockingZones() {
      const sigToZones = Object.create(null);
      visibleSlots().forEach((zone) => {
        if (!zone.classList.contains("filled")) return;
        const sig = (zone.dataset.fileSig || "").trim();
        if (!sig) return;
        if (!sigToZones[sig]) sigToZones[sig] = [];
        sigToZones[sig].push(zone);
      });
      const blocked = [];
      Object.keys(sigToZones).forEach((sig) => {
        if (sigToZones[sig].length > 1) {
          sigToZones[sig].forEach((zone) => {
            if (blocked.indexOf(zone) === -1) blocked.push(zone);
          });
        }
      });
      return blocked;
    }

    function focusSlotInput(zone) {
      if (!zone) return false;
      const input = zone.querySelector("[data-file-input]");
      if (input && typeof input.focus === "function") {
        input.focus();
        return true;
      }
      return false;
    }

    // When Continue is gated, send the creator to the first slot that still blocks
    // progress — invalid rejection, missing required video, or duplicate recording.
    function firstBlockingZone() {
      const invalidRequired = requiredSlots().find((zone) => zone.classList.contains("is-invalid"));
      if (invalidRequired) return invalidRequired;
      const missingRequired = requiredSlots().find((zone) => !zone.classList.contains("filled"));
      if (missingRequired) return missingRequired;
      const duplicates = duplicateBlockingZones();
      return duplicates.length > 0 ? duplicates[0] : null;
    }

    function focusFirstBlockingSlot() {
      const zone = firstBlockingZone();
      if (!zone) return false;
      if (errorCard && !errorCard.hidden && typeof errorCard.scrollIntoView === "function") {
        errorCard.scrollIntoView({ block: "nearest" });
      }
      return focusSlotInput(zone);
    }

    function firstMissingRequiredZone() {
      return requiredSlots().find((zone) => {
        return !zone.classList.contains("filled")
          && !zone.classList.contains("is-invalid")
          && !zone.classList.contains("is-hidden");
      }) || null;
    }

    function focusFirstMissingRequired() {
      return focusSlotInput(firstMissingRequiredZone());
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
        indicator.classList.remove("is-ready", "is-missing", "is-optional", "is-invalid");
        if (zone.classList.contains("is-hidden")) {
          indicator.textContent = "";
          indicator.hidden = true;
          return;
        }
        indicator.hidden = false;
        if (zone.classList.contains("filled")) {
          indicator.textContent = "Ready";
          indicator.classList.add("is-ready");
        } else if (zone.classList.contains("is-invalid")) {
          indicator.textContent = "Invalid file";
          indicator.classList.add("is-invalid");
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
          .filter((zone) => {
            return !zone.classList.contains("filled") && !zone.classList.contains("is-invalid");
          })
          .map((zone) => SLOT_LABELS[zone.dataset.slot] || zone.dataset.slot);
        if (missingNames.length > 0) {
          const noun = missingNames.length > 1 ? "videos" : "video";
          slotStatus.textContent =
            `${filled} of ${total} required speaker videos ready. Still need the ${formatList(missingNames)} ${noun}. ${brollNote}`;
        } else {
          slotStatus.textContent =
            `${filled} of ${total} required speaker videos ready. ${brollNote}`;
        }
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
      zone.classList.remove("is-invalid");
      zone.dataset.invalidMessage = "";
      const placed = zone.querySelector(".placed-video");
      if (placed) placed.remove();
      const input = zone.querySelector("[data-file-input]");
      if (input) input.value = "";
      zone.dataset.fileName = "";
      zone.dataset.fileSig = "";
      zone.placedFile = null;
    }

    function clearAllZones() {
      zones.forEach(clearZone);
      // Reset starts the layout over, so nothing stays set aside for a later switch.
      Object.keys(setAside).forEach((slot) => delete setAside[slot]);
      Object.keys(invalidAside).forEach((slot) => delete invalidAside[slot]);
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
      // A source lives in only one slot. Also drop it from the set-aside cache so a hidden
      // slot can't later restore it as a duplicate of a placement just made in another slot.
      Object.keys(setAside).forEach((slot) => {
        if (fileSignature(setAside[slot]) === incomingSig) {
          delete setAside[slot];
        }
      });
    }

    function placeVideoFile(zone, file) {
      if (!zone || zone.classList.contains("is-hidden")) {
        return;
      }

      if (!isVideoFile(file)) {
        flagInvalidSlot(zone, "The " + slotName(zone) + " slot accepts only MP4, MOV, or WebM video.");
        updateSlotStatus();
        return;
      }

      // A 0-byte file is a failed or aborted export, not a usable recording. Reject it so
      // it never fills a slot or counts toward the Continue gate. Guard on === 0 (not
      // falsy) so files whose size is unknown are still accepted.
      if (typeof file.size === "number" && file.size === 0) {
        flagInvalidSlot(zone, "The " + slotName(zone) + " video file is empty. Re-export it and place the finished file.");
        updateSlotStatus();
        return;
      }

      if (zone.classList) {
        zone.classList.remove("is-invalid");
        zone.dataset.invalidMessage = "";
      }
      delete invalidAside[zone.dataset.slot];
      clearMatchingSource(zone, file);
      clearZone(zone);
      zone.classList.add("filled");
      zone.dataset.fileName = file.name || "";
      zone.dataset.fileSig = fileSignature(file);
      // Retain the source File so this placement can be set aside and restored intact when
      // the creator switches layouts.
      zone.placedFile = file;

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
      syncInvalidError();
      promoteInvalidAside();
      syncInvalidError();
      updateSlotStatus();
    }

    // Place several recordings from one drop or file pick: fill the slot they landed on,
    // then spill the remaining videos into the next empty visible slots in order (required
    // slots first, optional b-roll last). This lets a creator drop all of their speaker
    // recordings at once instead of one slot at a time.
    function placeVideoFiles(zone, fileList) {
      const all = Array.prototype.slice.call(fileList || []).filter(Boolean);
      // Drop exact-duplicate recordings within one batch. The same source can't fill two
      // speaker slots, and spilling a duplicate would clear the slot it was first placed in
      // (clearMatchingSource moves a source to its newest slot), leaving the target empty.
      // Files without an identity signature (no size/mtime) are kept — we can't tell them apart.
      const seenSig = new Set();
      const files = all.filter((file) => {
        const sig = fileSignature(file);
        if (!sig) return true;
        if (seenSig.has(sig)) return false;
        seenSig.add(sig);
        return true;
      });
      if (files.length === 0) {
        return;
      }
      placeVideoFile(zone, files[0]);
      if (!zone.classList.contains("filled")) {
        // The target slot rejected the first file — do not spill the rest into other slots,
        // or valid recordings shift into the wrong speaker assignments.
        return;
      }
      // Only spill the extra files that are actually videos, so a stray non-video in the
      // batch never flags a slot the creator didn't aim at.
      const extras = files.slice(1).filter(isVideoFile);
      if (extras.length === 0) {
        return;
      }
      const openSlots = visibleSlots().filter((candidate) => {
        return candidate !== zone
          && !candidate.classList.contains("filled")
          && !candidate.classList.contains("is-invalid");
      });
      let overflow = 0;
      extras.forEach((file, index) => {
        if (openSlots[index]) {
          placeVideoFile(openSlots[index], file);
        } else {
          overflow += 1;
        }
      });
      // More videos than open slots: the surplus has nowhere to land. Say so instead of
      // silently dropping the extra files, and tell the creator how to make room.
      if (overflow > 0) {
        const noun = overflow === 1 ? "video" : "videos";
        const verb = overflow === 1 ? "wasn't" : "weren't";
        setError(`There's no open slot left, so ${overflow} extra ${noun} ${verb} placed. Remove a video to make room for another.`);
      }
    }

    // Clear a single placed video without disturbing the other slots, so a creator who
    // picks the wrong file can fix just that slot instead of resetting the whole layout.
    function removeVideo(zone) {
      if (!zone || !zone.classList.contains("filled")) {
        return;
      }
      clearZone(zone);
      syncInvalidError();
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
      const previousVisible = new Set(
        visibleSlots().map((zone) => zone.dataset.slot),
      );
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
          // Remember a rejection on a slot that is leaving the layout so it can be
          // restored instead of looking like an untouched empty slot.
          if (zone.classList.contains("is-invalid") && zone.dataset.invalidMessage) {
            invalidAside[zone.dataset.slot] = zone.dataset.invalidMessage;
          }
          // Set the placed video aside (don't destroy it) when its slot leaves the layout,
          // so switching back to a compatible layout restores the creator's work.
          if (zone.classList.contains("filled") && zone.placedFile) {
            setAside[zone.dataset.slot] = zone.placedFile;
          }
          clearZone(zone);
        }
      });

      // Restore any set-aside video whose slot is visible again (unless the creator already
      // placed something new there).
      zones.forEach((zone) => {
        const slot = zone.dataset.slot;
        if (visible.has(slot) && setAside[slot] && !zone.classList.contains("filled")) {
          const file = setAside[slot];
          delete setAside[slot];
          placeVideoFile(zone, file);
        }
      });

      // Restore rejection state after set-aside videos so a filled restore wins.
      zones.forEach((zone) => {
        const slot = zone.dataset.slot;
        if (!visible.has(slot) || zone.classList.contains("filled")) return;
        const message = invalidAside[slot];
        if (!message) return;
        if (firstInvalidZone()) {
          invalidAside[slot] = message;
          return;
        }
        zone.classList.add("is-invalid");
        zone.dataset.invalidMessage = message;
        delete invalidAside[slot];
      });

      layoutButtons.forEach((button) => {
        const buttonLayout = layouts[button.dataset.layout] || layouts.interview;
        const active = button.dataset.layout === currentLayout;
        const label = button.querySelector("[data-layout-label]");
        button.setAttribute("aria-pressed", active ? "true" : "false");
        if (label) label.textContent = active ? buttonLayout.activeLabel : buttonLayout.readyLabel;
      });

      syncInvalidError();
      promoteInvalidAside();
      syncInvalidError();
      updateSlotStatus();
      const newlyVisibleRequired = requiredSlots().find((zone) => {
        return !previousVisible.has(zone.dataset.slot)
          && !zone.classList.contains("filled")
          && !zone.classList.contains("is-invalid")
          && !zone.classList.contains("is-hidden");
      });
      const blocking = firstBlockingZone();
      const focusTarget = (blocking && blocking.classList.contains("is-invalid"))
        ? blocking
        : newlyVisibleRequired;
      if (focusTarget) {
        focusSlotInput(focusTarget);
      }
    }

    layoutButtons.forEach((button) => {
      button.addEventListener("click", () => {
        applyLayout(button.dataset.layout);
      });
    });

    zones.forEach((zone) => {
      const input = zone.querySelector("[data-file-input]");
      // Make the whole empty slot a click target for choosing a video, so a creator can place
      // media by clicking the slot in the layout instead of aiming at the small file input.
      // A filled slot leaves clicks to its video and Remove control, and a click on the input
      // itself already opens the picker (so it must not re-trigger one here).
      zone.addEventListener("click", (event) => {
        if (zone.classList.contains("filled") || zone.classList.contains("is-hidden")) {
          return;
        }
        if (event && event.target === input) {
          return;
        }
        if (input && typeof input.click === "function") {
          input.click();
        }
      });
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
        placeVideoFiles(zone, event.dataTransfer && event.dataTransfer.files);
      });
      if (input) {
        input.addEventListener("change", () => {
          placeVideoFiles(zone, input.files);
        });
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        clearAllZones();
        setError("");
        updateSlotStatus();
        focusFirstMissingRequired();
      });
    }

    if (continueLink) {
      continueLink.addEventListener("click", (event) => {
        if (continueLink.getAttribute("aria-disabled") === "true") {
          event.preventDefault();
          focusFirstBlockingSlot();
        }
      });
    }

    applyLayout(currentLayout);

    return {
      applyLayout,
      placeVideoFile,
      placeVideoFiles,
      removeVideo,
      resetVideos: clearAllZones,
      requiredSlots,
      visibleSlots,
      filledRequiredSlots,
      duplicateFileNames,
      duplicateBlockingZones,
      firstBlockingZone,
      focusFirstBlockingSlot,
      firstMissingRequiredZone,
      focusFirstMissingRequired,
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
