"use strict";

// Carries the guided episode setup intake into the next preview step (#1326 / #583).
// The intake screen saves a completed setup here the moment it is valid; episode
// readiness reads it back so the chosen source type, speaker roles, names, and
// optional social links are visibly carried into the next step. Mirrors the shared
// layout-first handoff helper: one session-storage key, one normalize gate, and a
// small creator-facing summary both screens agree on.
(function (global) {
  const STORAGE_KEY = "pdc-episode-setup-handoff";

  const SOURCE_LABELS = {
    link: "Riverside link",
    files: "Uploaded speaker files",
  };

  function normalizeSourceType(value) {
    return value === "link" || value === "files" ? value : "";
  }

  function trimString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeSpeaker(speaker) {
    if (!speaker || typeof speaker !== "object") {
      return null;
    }
    const role = trimString(speaker.role);
    const name = trimString(speaker.name);
    // A speaker is only carried once it has both a role bucket and a name — the
    // same gate the intake screen's Continue button enforces.
    if (!role || !name) {
      return null;
    }
    const normalized = { role, name };
    const twitter = trimString(speaker.twitter);
    const website = trimString(speaker.website);
    if (twitter) {
      normalized.twitter = twitter;
    }
    if (website) {
      normalized.website = website;
    }
    return normalized;
  }

  // Returns a clean setup object only when the intake is genuinely complete: a
  // chosen source, at least one speaker, every speaker named and assigned a role,
  // and no two speakers sharing a role. Returns null otherwise, so the next step
  // never shows a half-finished handoff.
  function normalize(setup) {
    if (!setup || typeof setup !== "object") {
      return null;
    }
    const sourceType = normalizeSourceType(setup.sourceType);
    if (!sourceType) {
      return null;
    }
    const rawSpeakers = Array.isArray(setup.speakers) ? setup.speakers : [];
    const speakers = [];
    const seenRoles = new Set();
    for (const raw of rawSpeakers) {
      const speaker = normalizeSpeaker(raw);
      if (!speaker || seenRoles.has(speaker.role)) {
        return null;
      }
      seenRoles.add(speaker.role);
      speakers.push(speaker);
    }
    if (!speakers.length) {
      return null;
    }
    return { sourceType, speakers };
  }

  function sourceLabel(setup) {
    const normalized = normalize(setup);
    return normalized ? SOURCE_LABELS[normalized.sourceType] : "";
  }

  function socialCount(speaker) {
    let count = 0;
    if (speaker && speaker.twitter) {
      count += 1;
    }
    if (speaker && speaker.website) {
      count += 1;
    }
    return count;
  }

  // Creator-facing lines for the readiness banner: one per speaker, showing the
  // role bucket, the name, and how many social links carried over.
  function summaryLines(setup) {
    const normalized = normalize(setup);
    if (!normalized) {
      return [];
    }
    return normalized.speakers.map((speaker) => {
      const links = socialCount(speaker);
      const linkNote = links ? ` · ${links} social link${links === 1 ? "" : "s"}` : "";
      return `${speaker.role}: ${speaker.name}${linkNote}`;
    });
  }

  function save(storage, setup) {
    const normalized = normalize(setup);
    if (!storage || !normalized) {
      return false;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return true;
    } catch (error) {
      return false;
    }
  }

  function load(storage) {
    if (!storage) {
      return null;
    }
    try {
      return normalize(JSON.parse(storage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  function clear(storage) {
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Best-effort: an incomplete setup simply leaves nothing for the next step.
    }
  }

  const api = {
    STORAGE_KEY,
    clear,
    load,
    normalize,
    save,
    socialCount,
    sourceLabel,
    summaryLines,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  global.PodcastEpisodeSetupHandoff = api;
}(typeof window !== "undefined" ? window : globalThis));
