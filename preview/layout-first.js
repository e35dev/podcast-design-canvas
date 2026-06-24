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

  // A 0-byte file is a failed or aborted export, not a usable recording — placeVideoFile rejects
  // it. Guard on === 0 (not falsy) so a file whose size is unknown is still treated as placeable.
  function isEmptyExport(file) {
    return Boolean(file) && typeof file.size === "number" && file.size === 0;
  }

  // A file the placement path will actually accept into a slot: a video that carries real bytes.
  // Used to decide which extras in a multi-file drop may spill into open slots — a non-video or an
  // empty export passes neither, so it never consumes a slot it would only be rejected from.
  function isPlaceableVideo(file) {
    return isVideoFile(file) && !isEmptyExport(file);
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

  function duplicateBatchCount(files) {
    const seen = new Set();
    let duplicates = 0;
    (files || []).forEach((file) => {
      const sig = fileSignature(file);
      if (!sig) return;
      if (seen.has(sig)) {
        duplicates += 1;
        return;
      }
      seen.add(sig);
    });
    return duplicates;
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
      const indicatorId = "slot-state-" + zone.dataset.slot;
      indicator.id = indicatorId;
      if (typeof indicator.setAttribute === "function") indicator.setAttribute("id", indicatorId);
      zone.appendChild(indicator);
      slotIndicators[zone.dataset.slot] = indicator;
      // Tie the badge to the slot's file control so a screen-reader user hears the slot's
      // current state (Needs video / Ready / Invalid file) when they focus "Choose <slot> video",
      // not only sighted creators reading the badge on the canvas.
      const slotInput = zone.querySelector && zone.querySelector("[data-file-input]");
      if (slotInput && typeof slotInput.setAttribute === "function") {
        slotInput.setAttribute("aria-describedby", indicatorId);
      }
    });

    const sceneLabel = doc.getElementById("layout-scene-label");
    const runtimeLabel = doc.getElementById("layout-runtime-label");
    const speakerRow = doc.getElementById("speaker-row");
    const slotStatus = doc.getElementById("layout-slot-status");
    const resetButton = doc.getElementById("layout-reset");
    const continueLink = doc.getElementById("layout-continue");
    const errorCard = doc.getElementById("layout-error-card");
    const errorText = doc.getElementById("layout-error");
    const layoutCanvas = doc.getElementById("layout-canvas");

    // When Continue is gated, a screen-reader user focusing it should hear WHY, not just that
    // it is dimmed. The live placement status names which required videos are still missing
    // (and reads "Required speaker videos ready." once they are all placed), so describe the
    // Continue control with that status in both states.
    if (continueLink && slotStatus && typeof continueLink.setAttribute === "function") {
      continueLink.setAttribute("aria-describedby", "layout-slot-status");
    }

    let currentLayout = "interview";
    let objectUrls = [];
    // The slot a placed video is being dragged from, so a drop on another slot moves or
    // swaps the recording instead of being read as a new file drop.
    let draggingFromSlot = null;
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

    function placedSourceSignatures() {
      const signatures = new Set();
      visibleSlots().forEach((zone) => {
        const sig = (zone.dataset.fileSig || "").trim();
        if (zone.classList.contains("filled") && sig) {
          signatures.add(sig);
        }
      });
      return signatures;
    }

    function alreadyPlacedDropCount(files) {
      const placed = placedSourceSignatures();
      return (files || []).filter((file) => {
        const sig = fileSignature(file);
        return sig && placed.has(sig);
      }).length;
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

    // Clicks on a placed video's preview or Remove control should stay on that control.
    // Clicks on the slot chrome (label, padding) on a filled slot open the file picker
    // so the creator can replace the recording without clearing the slot first.
    function isPlacedVideoControl(target) {
      if (!target) {
        return false;
      }
      function hasClass(node, name) {
        if (!node) {
          return false;
        }
        if (node.classList && node.classList.contains(name)) {
          return true;
        }
        return typeof node.className === "string"
          && node.className.split(/\s+/).filter(Boolean).indexOf(name) !== -1;
      }
      if (typeof target.closest === "function") {
        let node = target;
        while (node) {
          if (hasClass(node, "placed-remove") || (node.tagName && node.tagName.toUpperCase() === "VIDEO")) {
            return true;
          }
          node = node.parentNode;
        }
        return false;
      }
      let node = target;
      while (node) {
        if (hasClass(node, "placed-remove") || (node.tagName && node.tagName.toUpperCase() === "VIDEO")) {
          return true;
        }
        node = node.parentNode;
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

    // The Reset control only does something once a video is placed, so disable it while every
    // slot is empty — a control that can't change anything shouldn't read as actionable.
    function updateResetState() {
      if (!resetButton) return;
      const hasPlacement = zones.some((zone) => zone.classList.contains("filled"));
      resetButton.disabled = !hasPlacement;
      if (typeof resetButton.setAttribute === "function") {
        resetButton.setAttribute("aria-disabled", hasPlacement ? "false" : "true");
      }
    }

    function updateSlotStatus(message) {
      updateSlotIndicators();
      updateResetState();
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
      // it never fills a slot or counts toward the Continue gate.
      if (isEmptyExport(file)) {
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
      // Let the creator drag a placed recording onto another slot to move or swap it,
      // so a mixed-up Host/Guest can be fixed without removing and re-adding both videos.
      wrap.draggable = true;
      if (typeof wrap.setAttribute === "function") {
        wrap.setAttribute("draggable", "true");
        // The drag-to-move/swap affordance is otherwise pointer-only and conveyed visually.
        // Make the placed video keyboard-operable too: focusable, with a drag role description
        // and arrow-key shortcuts, so a keyboard / screen-reader user can move or swap it
        // between slots instead of only dragging it with a mouse (WCAG 2.1.1).
        wrap.setAttribute("role", "group");
        wrap.setAttribute("aria-roledescription", "Draggable video");
        wrap.setAttribute("tabindex", "0");
        wrap.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight ArrowUp ArrowDown");
        wrap.setAttribute("aria-label", slotName(zone) + " video — drag, or focus and press the arrow keys, to move or swap it with another slot");
      }
      wrap.addEventListener("dragstart", (event) => {
        draggingFromSlot = zone.dataset.slot || null;
        if (event && event.dataTransfer) {
          try {
            event.dataTransfer.setData("application/x-pdc-slot", zone.dataset.slot || "");
          } catch (error) {
            // Some browsers restrict custom drag types; draggingFromSlot still tracks the source.
          }
          event.dataTransfer.effectAllowed = "move";
        }
      });
      wrap.addEventListener("dragend", () => {
        draggingFromSlot = null;
        clearDragAffordances();
      });
      // Keyboard equivalent of dragging a placed video onto another slot: the arrow keys move it
      // to the previous/next visible slot, moving into an empty slot or swapping with a filled
      // one through the same moveSlotVideo path as drag. Focus follows the video to its new slot
      // so a keyboard user stays oriented after the move.
      wrap.addEventListener("keydown", (event) => {
        let delta = 0;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          delta = -1;
        } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          delta = 1;
        } else {
          return;
        }
        event.preventDefault();
        const order = visibleSlots();
        const target = order[order.indexOf(zone) + delta];
        if (!target) {
          return;
        }
        moveSlotVideo(zone, target);
        const moved = target.querySelector && target.querySelector(".placed-video");
        if (moved && typeof moved.focus === "function") {
          moved.focus();
        }
      });

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
      const skippedDuplicate = duplicateBatchCount(all);
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
      // Spill only the extras a slot will actually accept: a real video with bytes. A non-video,
      // or a 0-byte/aborted export that passes the video-type check but is rejected on placement,
      // must not consume an open slot — that would shift the remaining recordings past it into the
      // wrong speaker assignments (the real guest take would land in optional b-roll) and flag a
      // slot the creator never aimed at. Count what was left out so the creator is told, rather
      // than a file silently vanishing. (The first file already went through placeVideoFile above,
      // which flags it if it can't be placed.)
      const rest = files.slice(1);
      const extras = rest.filter(isPlaceableVideo);
      const skippedNonVideo = rest.filter((file) => !isVideoFile(file)).length;
      const skippedEmpty = rest.filter((file) => isVideoFile(file) && isEmptyExport(file)).length;
      if (extras.length === 0 && skippedNonVideo === 0 && skippedEmpty === 0 && skippedDuplicate === 0) {
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
      // Tell the creator about anything from the drop that didn't land, rather than silently
      // discarding it. Overflow (more videos than open slots) takes priority; otherwise report the
      // empty exports, then the non-video files, that were skipped.
      if (overflow > 0) {
        const noun = overflow === 1 ? "video" : "videos";
        const verb = overflow === 1 ? "wasn't" : "weren't";
        setError(`There's no open slot left, so ${overflow} extra ${noun} ${verb} placed. Remove a video to make room for another.`);
      } else if (skippedEmpty > 0) {
        const noun = skippedEmpty === 1 ? "video" : "videos";
        const wasWere = skippedEmpty === 1 ? "was an empty export, so it was" : "were empty exports, so they were";
        setError(`${skippedEmpty} ${noun} in that drop ${wasWere} skipped. Re-export and drop the finished file.`);
      } else if (skippedNonVideo > 0) {
        const noun = skippedNonVideo === 1 ? "file" : "files";
        const wasWere = skippedNonVideo === 1 ? "wasn't a video, so it was" : "weren't videos, so they were";
        setError(`${skippedNonVideo} ${noun} in that drop ${wasWere} skipped. Only video files can fill a slot.`);
      } else if (skippedDuplicate > 0) {
        const noun = skippedDuplicate === 1 ? "duplicate recording" : "duplicate recordings";
        const wasWere = skippedDuplicate === 1 ? "was" : "were";
        setError(`${skippedDuplicate} ${noun} in that drop ${wasWere} skipped. Give each speaker a separate video file.`);
      }
    }

    function firstOpenVisibleSlot() {
      return visibleSlots().find((zone) => {
        return !zone.classList.contains("filled") && !zone.classList.contains("is-invalid");
      }) || null;
    }

    // Recordings dropped anywhere on the layout — not precisely onto a slot — should still
    // land. Route them to the next empty slot so a creator can drop their files onto the
    // layout and let the product place them in order. A drop that hits a specific slot is
    // handled by that slot (its drop handler stops propagation), so this only runs for
    // drops on the canvas gaps around the slots.
    function placeDroppedFiles(fileList) {
      const target = firstOpenVisibleSlot();
      if (target) {
        // A canvas-wide drop isn't aimed at a specific slot, so order the batch
        // placeable-videos-first before routing. Otherwise an unplaceable file (a non-video, or
        // a 0-byte export) that happens to come first in the drop would be sent to the target
        // slot, rejected there, and — because a slot drop stops spilling once its first file is
        // rejected — block every real recording in the same drop from placing. placeVideoFiles
        // still reports the trailing unplaceable files.
        const all = Array.prototype.slice.call(fileList || []).filter(Boolean);
        const ordered = all.filter(isPlaceableVideo).concat(all.filter((file) => !isPlaceableVideo(file)));
        placeVideoFiles(target, ordered);
        return;
      }
      // Every visible slot is already filled or flagged, so a canvas-wide drop has nowhere
      // to land. Tell the creator how to make room instead of silently ignoring the drop,
      // matching the multi-file spill guidance — prioritize placeable overflow, then empty
      // exports, then non-video files (#1231 extended this path for non-video only).
      const files = Array.prototype.slice.call(fileList || []).filter(Boolean);
      const placeableCount = files.filter(isPlaceableVideo).length;
      const alreadyPlacedCount = alreadyPlacedDropCount(files);
      const skippedEmpty = files.filter((file) => isVideoFile(file) && isEmptyExport(file)).length;
      const skippedNonVideo = files.filter((file) => !isVideoFile(file)).length;
      if (placeableCount > 0 && alreadyPlacedCount === placeableCount) {
        const noun = placeableCount === 1 ? "recording is" : "recordings are";
        setError(`${placeableCount} ${noun} already in the layout. Drop a separate video file for another speaker, or remove a slot first.`);
        return;
      }
      if (placeableCount > 0) {
        setError("There's no open slot left. Remove a video to make room for another.");
        return;
      }
      if (skippedEmpty > 0) {
        const noun = skippedEmpty === 1 ? "video" : "videos";
        const wasWere = skippedEmpty === 1 ? "was an empty export, so it was" : "were empty exports, so they were";
        setError(`${skippedEmpty} ${noun} in that drop ${wasWere} skipped. Re-export and drop the finished file.`);
        return;
      }
      if (skippedNonVideo > 0) {
        const noun = skippedNonVideo === 1 ? "file" : "files";
        const wasWere = skippedNonVideo === 1 ? "wasn't a video, so it was" : "weren't videos, so they were";
        setError(`${skippedNonVideo} ${noun} in that drop ${wasWere} skipped. Only video files can fill a slot.`);
      }
    }

    // Move a placed recording from one slot to another by dragging it. Dropping it on an
    // empty slot moves it there; dropping it on a filled slot swaps the two recordings, so a
    // creator can correct a mixed-up Host/Guest without removing and re-adding both videos.
    function moveSlotVideo(fromZone, toZone) {
      if (!fromZone || !toZone || fromZone === toZone) {
        return;
      }
      if (!fromZone.classList.contains("filled") || toZone.classList.contains("is-hidden")) {
        return;
      }
      const fromFile = fromZone.placedFile;
      if (!fromFile) {
        return;
      }
      // Read the target's current file before any placement clears it; if it has one we are
      // swapping, otherwise we are moving into an empty slot.
      const toFile = toZone.classList.contains("filled") ? toZone.placedFile : null;
      placeVideoFile(toZone, fromFile);
      if (toFile) {
        placeVideoFile(fromZone, toFile);
      } else {
        clearZone(fromZone);
        updateSlotStatus();
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
      // Name the placement canvas after the chosen layout so a screen-reader user moving into
      // it hears which layout they're filling, instead of a generic region name that never
      // changes when they switch interview / solo / panel.
      if (layoutCanvas && typeof layoutCanvas.setAttribute === "function") {
        layoutCanvas.setAttribute("aria-label", layout.scene + " — video placement slots");
      }
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

    // Drop-target highlights are tracked per slot/canvas with enter/leave depth. Clear them all
    // when a placed-video drag ends without landing on a slot — otherwise a destination that was
    // highlighted mid-drag keeps glowing after a cancel or canvas-gap drop (#1246).
    function clearDragAffordances() {
      zones.forEach((candidate) => {
        candidate._pdcDragDepth = 0;
        if (candidate.classList) {
          candidate.classList.remove("drag-over");
        }
      });
      if (layoutCanvas) {
        layoutCanvas._pdcCanvasDragDepth = 0;
        if (layoutCanvas.classList) {
          layoutCanvas.classList.remove("drag-over");
        }
      }
    }

    zones.forEach((zone) => {
      const input = zone.querySelector("[data-file-input]");
      // Make the whole slot a click target for choosing a video, so a creator can place or
      // replace media by clicking the slot chrome instead of aiming at the small file input.
      // A filled slot still leaves its video preview and Remove control alone; a click on the
      // input itself already opens the picker (so it must not re-trigger one here).
      zone.addEventListener("click", (event) => {
        if (zone.classList.contains("is-hidden")) {
          return;
        }
        if (event && event.target === input) {
          return;
        }
        if (zone.classList.contains("filled") && isPlacedVideoControl(event && event.target)) {
          return;
        }
        if (input && typeof input.click === "function") {
          input.click();
        }
      });
      // Keep the drop-target highlight steady while a file is dragged over the slot. dragenter
      // and dragleave fire each time the cursor crosses one of the slot's children (the label,
      // the status badge, the file input), so adding on dragover and removing on every
      // dragleave makes the highlight flicker as the pointer moves across the slot. Track
      // enter/leave depth and only clear the highlight once the cursor has truly left the slot.
      zone._pdcDragDepth = 0;
      zone.addEventListener("dragenter", () => {
        // During a placed-video move (#1233), only destination slots should highlight — not the
        // slot the recording is being dragged from (#1244 fixed the canvas; this fixes the slot).
        if (draggingFromSlot && draggingFromSlot === zone.dataset.slot) {
          return;
        }
        zone._pdcDragDepth += 1;
        zone.classList.add("drag-over");
      });
      zone.addEventListener("dragover", (event) => {
        // Required so the slot is a valid drop target; the highlight is owned by dragenter.
        event.preventDefault();
      });
      zone.addEventListener("dragleave", () => {
        zone._pdcDragDepth = Math.max(0, zone._pdcDragDepth - 1);
        if (zone._pdcDragDepth === 0) {
          zone.classList.remove("drag-over");
        }
      });
      zone.addEventListener("drop", (event) => {
        event.preventDefault();
        // A drop aimed at a specific slot is owned by that slot — stop it from also
        // bubbling to the layout-wide drop handler, which would re-route the files.
        event.stopPropagation();
        zone._pdcDragDepth = 0;
        zone.classList.remove("drag-over");
        const internalSlot = draggingFromSlot
          || (event.dataTransfer && typeof event.dataTransfer.getData === "function"
            ? event.dataTransfer.getData("application/x-pdc-slot")
            : "");
        if (internalSlot) {
          // A placed video was dragged here from another slot — move or swap it instead of
          // treating the drop as a new file.
          moveSlotVideo(zonesBySlot[internalSlot], zone);
          draggingFromSlot = null;
          return;
        }
        placeVideoFiles(zone, event.dataTransfer && event.dataTransfer.files);
      });
      if (input) {
        input.addEventListener("change", () => {
          placeVideoFiles(zone, input.files);
        });
      }
    });

    if (layoutCanvas) {
      // Show the whole canvas as a drop target while a file is dragged over it. A canvas drop
      // routes to the next open slot (#1216), but without a cue the creator can't tell the
      // layout — not only the small slots — accepts a drop. Track enter/leave depth so crossing
      // the slots inside the canvas doesn't flicker the highlight, mirroring the per-slot cue.
      layoutCanvas._pdcCanvasDragDepth = 0;
      layoutCanvas.addEventListener("dragenter", () => {
        // The canvas affordance is for external file drops (#1216 / #1237). A placed video being
        // dragged between slots (#1233) must not light up the whole layout as if new files belong
        // here — only the target slot should highlight.
        if (draggingFromSlot) {
          return;
        }
        layoutCanvas._pdcCanvasDragDepth += 1;
        layoutCanvas.classList.add("drag-over");
      });
      layoutCanvas.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      layoutCanvas.addEventListener("dragleave", () => {
        layoutCanvas._pdcCanvasDragDepth = Math.max(0, layoutCanvas._pdcCanvasDragDepth - 1);
        if (layoutCanvas._pdcCanvasDragDepth === 0) {
          layoutCanvas.classList.remove("drag-over");
        }
      });
      layoutCanvas.addEventListener("drop", (event) => {
        event.preventDefault();
        // The canvas fully owns this drop — stop it bubbling to the document guard below, or
        // the same files would be routed twice (once here, once at the document).
        if (typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        layoutCanvas._pdcCanvasDragDepth = 0;
        layoutCanvas.classList.remove("drag-over");
        // A placed-video dragged between slots is handled by the target slot; the canvas-wide
        // handler only routes real file drops to the next empty slot.
        if (draggingFromSlot) {
          clearDragAffordances();
          draggingFromSlot = null;
          return;
        }
        placeDroppedFiles(event.dataTransfer && event.dataTransfer.files);
      });
    }

    // A video released anywhere on the page — not just between slots but outside the whole
    // canvas (the header, the page margins) — would otherwise trigger the browser's default
    // "open this file" navigation, discarding the single-page app and every placement the
    // creator has made (#1213, data loss). Guard at the document level: keep drops catchable
    // (preventDefault on dragover), and for any drop that reaches the document — i.e. landed
    // outside the canvas, since slot and canvas drops stop propagation — prevent the navigation
    // and still route the videos into the first open slot so a near-miss isn't lost.
    if (doc && typeof doc.addEventListener === "function") {
      doc.addEventListener("dragover", (event) => {
        event.preventDefault();
      });
      doc.addEventListener("drop", (event) => {
        event.preventDefault();
        if (draggingFromSlot) {
          clearDragAffordances();
          draggingFromSlot = null;
          return;
        }
        placeDroppedFiles(event.dataTransfer && event.dataTransfer.files);
      });
    }

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
      placeDroppedFiles,
      moveSlotVideo,
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
