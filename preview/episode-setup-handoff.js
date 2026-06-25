"use strict";

// Shared episode-setup handoff helper. The guided setup intake (the first ingest step)
// collects how the episode was started — a recording link or synced speaker files — plus
// each speaker's role, name, and optional social links, then carries that setup into the
// next preview step (episode readiness) so the creator sees the context they just entered.
//
// This mirrors the shape of layout-handoff.js (one sessionStorage key + a query-string
// fallback, a single normalize gate, and small summary helpers) so the two start paths —
// layout-first placement and the guided intake — stay consistent and easy to reason about.

(function (global) {
  const STORAGE_KEY = "pdc-episode-setup-handoff";
  const SETUP_QUERY_KEY = "setup";
  const SOURCE_QUERY_KEY = "source";

  // The source paths a creator can start from. Kept here so the intake screen and the
  // readiness summary agree on the labels without duplicating the list.
  const SOURCE_TYPES = {
    link: "Recording link",
    upload: "Uploaded speaker files",
  };

  // The speaker roles a track can be assigned to, in the order the product offers them.
  // The intake builds its dropdowns from this list, so a saved role always has a label.
  const ROLES = [
    { value: "host", label: "Host" },
    { value: "guest-1", label: "Guest 1" },
    { value: "guest-2", label: "Guest 2" },
    { value: "guest-3", label: "Guest 3" },
    { value: "co-host", label: "Co-host" },
    { value: "producer", label: "Producer" },
  ];
  const ROLE_LABELS = ROLES.reduce((labels, role) => {
    labels[role.value] = role.label;
    return labels;
  }, {});

  function normalizeSourceType(value) {
    return SOURCE_TYPES[value] ? value : "";
  }

  function sourceLabel(setup) {
    return setup && SOURCE_TYPES[setup.sourceType] ? SOURCE_TYPES[setup.sourceType] : "";
  }

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normalizeSpeaker(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const role = ROLE_LABELS[raw.role] ? raw.role : "";
    return {
      name: cleanText(raw.name),
      role,
      roleLabel: role ? ROLE_LABELS[role] : "",
      social: cleanText(raw.social),
    };
  }

  // A setup is only "complete" — and only ever carried forward — when the creator has
  // chosen a source path and every speaker has both a name and a unique role. A half-filled
  // intake never reaches the next step, so readiness never shows a misleading summary.
  function normalize(setup) {
    if (!setup || typeof setup !== "object") {
      return null;
    }
    const sourceType = normalizeSourceType(setup.sourceType);
    if (!sourceType) {
      return null;
    }
    const speakers = Array.isArray(setup.speakers)
      ? setup.speakers.map(normalizeSpeaker).filter(Boolean)
      : [];
    if (!speakers.length) {
      return null;
    }
    const seenRoles = new Set();
    for (const speaker of speakers) {
      if (!speaker.name || !speaker.role) {
        return null;
      }
      if (seenRoles.has(speaker.role)) {
        return null;
      }
      seenRoles.add(speaker.role);
    }
    return { sourceType, speakers };
  }

  function isComplete(setup) {
    return normalize(setup) !== null;
  }

  function save(storage, setup) {
    const normalized = normalize(setup);
    if (!storage || !normalized) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      // The query-string fallback still carries the setup if storage is unavailable.
    }
  }

  function clear(storage) {
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Clearing is best-effort.
    }
  }

  function setupFromQuery(rawSearch) {
    const params = new URLSearchParams(String(rawSearch || "").replace(/^\?/, ""));
    const encoded = params.get(SETUP_QUERY_KEY);
    if (!encoded) {
      return null;
    }
    try {
      const parsed = JSON.parse(encoded);
      const speakers = Array.isArray(parsed) ? parsed : parsed && parsed.speakers;
      const sourceType = params.get(SOURCE_QUERY_KEY)
        || (parsed && !Array.isArray(parsed) ? parsed.sourceType : "");
      return normalize({ sourceType, speakers });
    } catch (error) {
      return null;
    }
  }

  function setupFromStorage(storage) {
    if (!storage) {
      return null;
    }
    try {
      return normalize(JSON.parse(storage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  // Read the carried setup: a fresh setup in the URL wins (a deep link or the intake's
  // Continue href), otherwise fall back to what the intake stored this session.
  function load(storage, rawSearch) {
    return setupFromQuery(rawSearch) || setupFromStorage(storage);
  }

  function queryForState(setup) {
    const normalized = normalize(setup);
    if (!normalized) {
      return "";
    }
    const params = new URLSearchParams();
    params.set(SOURCE_QUERY_KEY, normalized.sourceType);
    params.set(
      SETUP_QUERY_KEY,
      JSON.stringify(normalized.speakers.map((speaker) => ({
        name: speaker.name,
        role: speaker.role,
        social: speaker.social,
      }))),
    );
    return params.toString();
  }

  // A creator-facing description of how the episode was started, e.g.
  // "Recording link — 2 speakers, 1 with a social link".
  function sourceSummary(setup) {
    const normalized = normalize(setup);
    if (!normalized) {
      return "";
    }
    const count = normalized.speakers.length;
    const withSocial = normalized.speakers.filter((speaker) => speaker.social).length;
    const speakerText = `${count} ${count === 1 ? "speaker" : "speakers"}`;
    const socialText = withSocial
      ? `, ${withSocial} with a social link`
      : "";
    return `${SOURCE_TYPES[normalized.sourceType]} — ${speakerText}${socialText}`;
  }

  // One line per speaker: "Host: Dana Brooks" (plus a "· link" hint when one was added),
  // so the next step lists exactly who was set up and in which role.
  function speakerLines(setup) {
    const normalized = normalize(setup);
    if (!normalized) {
      return [];
    }
    return normalized.speakers.map((speaker) => {
      const label = ROLE_LABELS[speaker.role] || speaker.role;
      return `${label}: ${speaker.name}${speaker.social ? " · link" : ""}`;
    });
  }

  const api = {
    STORAGE_KEY,
    SOURCE_TYPES,
    ROLES,
    ROLE_LABELS,
    normalize,
    isComplete,
    save,
    clear,
    load,
    queryForState,
    sourceLabel,
    sourceSummary,
    speakerLines,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  global.PodcastEpisodeSetupHandoff = api;
}(typeof window !== "undefined" ? window : globalThis));
