"use strict";

// Shared handoff for the guided episode setup intake (#1326). The intake screen lets a
// creator start a new episode from a recording link or separate synced speaker files, name
// each speaker, assign a role, and add optional social links. This helper carries ONLY a
// genuinely complete setup forward (every speaker named and assigned a unique role) so the
// next step — episode readiness — can surface the chosen source, speakers, and links.
//
// It mirrors the shape of layout-handoff.js: a pure module that works the same in the browser
// (window.PodcastEpisodeSetupHandoff) and under Node (module.exports), with a sessionStorage
// save/load plus a query-string fallback so a deep link or refresh keeps the setup.

(function (global) {
  const SOURCE_TYPES = {
    "recording-link": {
      id: "recording-link",
      label: "Riverside recording link",
      sourceNoun: "recording link",
    },
    "uploaded-files": {
      id: "uploaded-files",
      label: "Uploaded speaker files",
      sourceNoun: "speaker files",
    },
  };

  // Canonical speaker roles, in display order. Host and the two guest seats each hold exactly
  // one speaker; assigning the same role twice is an incomplete setup, not a valid handoff.
  const ROLES = {
    host: { id: "host", label: "Host" },
    "guest-1": { id: "guest-1", label: "Guest 1" },
    "guest-2": { id: "guest-2", label: "Guest 2" },
  };
  const ROLE_ORDER = ["host", "guest-1", "guest-2"];

  const STORAGE_KEY = "pdc-episode-setup-handoff";
  const SPEAKERS_QUERY_KEY = "speakers";
  const SOURCE_QUERY_KEY = "source";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeSourceType(sourceType) {
    return SOURCE_TYPES[sourceType] ? sourceType : "";
  }

  function normalizeRole(role) {
    return ROLES[role] ? role : "";
  }

  function trimmed(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  // A speaker row is usable only when it names a real person and a known role. Social links are
  // always optional, so a missing link never blocks the handoff.
  function normalizeSpeaker(raw) {
    if (!raw) {
      return null;
    }
    const role = normalizeRole(raw.role);
    const name = trimmed(raw.name);
    if (!role || !name) {
      return null;
    }
    const speaker = { role, roleLabel: ROLES[role].label, name };
    const social = trimmed(raw.social);
    if (social) {
      speaker.social = social;
    }
    return speaker;
  }

  function normalizeSpeakers(rawSpeakers) {
    const speakers = [];
    const seenRoles = new Set();
    (rawSpeakers || []).forEach((raw) => {
      const speaker = normalizeSpeaker(raw);
      // Drop a row whose role repeats one already taken: two speakers can't share a single seat,
      // and a "ready" setup must map each named speaker to a distinct role.
      if (!speaker || seenRoles.has(speaker.role)) {
        return;
      }
      seenRoles.add(speaker.role);
      speakers.push(speaker);
    });
    return speakers.sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
  }

  // The single source of truth for "is this setup finished?": a known source type and at least
  // one fully-specified speaker, where normalizeSpeakers has already dropped unnamed, unassigned,
  // and duplicate-role rows. If normalization lost a row, the raw setup was not complete.
  function stateFromRaw(raw) {
    if (!raw) {
      return null;
    }
    const sourceType = normalizeSourceType(raw.sourceType);
    if (!sourceType) {
      return null;
    }
    const speakers = normalizeSpeakers(raw.speakers);
    if (!speakers.length) {
      return null;
    }
    if (Array.isArray(raw.speakers) && speakers.length !== raw.speakers.length) {
      return null;
    }
    return {
      sourceType,
      sourceLabel: SOURCE_TYPES[sourceType].label,
      sourceNoun: SOURCE_TYPES[sourceType].sourceNoun,
      speakers,
    };
  }

  function isComplete(raw) {
    return stateFromRaw(raw) !== null;
  }

  function speakersQueryPayload(state) {
    return state.speakers.map((speaker) => {
      const entry = { role: speaker.role, name: speaker.name };
      if (speaker.social) {
        entry.social = speaker.social;
      }
      return entry;
    });
  }

  function queryForState(raw) {
    const state = stateFromRaw(raw);
    if (!state) {
      return "";
    }
    const params = new URLSearchParams();
    params.set(SOURCE_QUERY_KEY, state.sourceType);
    params.set(SPEAKERS_QUERY_KEY, JSON.stringify(speakersQueryPayload(state)));
    return params.toString();
  }

  function speakersFromQuery(params) {
    const value = params.get(SPEAKERS_QUERY_KEY);
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function stateFromQuery(rawSearch) {
    const params = new URLSearchParams(String(rawSearch || "").replace(/^\?/, ""));
    return stateFromRaw({
      sourceType: params.get(SOURCE_QUERY_KEY),
      speakers: speakersFromQuery(params),
    });
  }

  function hrefWithState(baseHref, raw) {
    const query = queryForState(raw);
    if (!baseHref || !query) {
      return baseHref || "";
    }
    const [beforeHash, hash = ""] = baseHref.split("#");
    if (!hash) {
      return `${baseHref}${baseHref.includes("?") ? "&" : "?"}${query}`;
    }
    const [screen, search = ""] = hash.split("?");
    const params = new URLSearchParams(search);
    for (const [key, value] of new URLSearchParams(query).entries()) {
      params.set(key, value);
    }
    return `${beforeHash}#${screen}?${params.toString()}`;
  }

  function save(storage, raw) {
    const state = stateFromRaw(raw);
    if (!storage || !state) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // The query-string fallback still carries the chosen source and speakers.
    }
  }

  function clear(storage) {
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Clearing is best-effort; the URL handoff still reflects the chosen setup.
    }
  }

  function stateFromStorage(storage) {
    if (!storage) {
      return null;
    }
    try {
      return stateFromRaw(JSON.parse(storage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  // Prefer the query handoff (the link the creator just followed) and fall back to stored state,
  // so a refresh or a same-tab revisit still shows the carried setup.
  function load(storage, rawSearch) {
    return stateFromQuery(rawSearch) || stateFromStorage(storage);
  }

  // Creator-facing summary rows for the readiness screen: the source line plus one line per
  // speaker, naming the role, the person, and whether a social link came along.
  function summaryLines(raw) {
    const state = stateFromRaw(raw);
    if (!state) {
      return [];
    }
    const lines = [`Source: ${state.sourceLabel}`];
    state.speakers.forEach((speaker) => {
      const social = speaker.social ? ` · ${speaker.social}` : "";
      lines.push(`${speaker.roleLabel}: ${speaker.name}${social}`);
    });
    return lines;
  }

  const api = {
    STORAGE_KEY,
    SOURCE_TYPES,
    ROLES,
    ROLE_ORDER,
    normalizeSourceType,
    normalizeRole,
    stateFromRaw,
    isComplete,
    queryForState,
    stateFromQuery,
    hrefWithState,
    save,
    clear,
    load,
    summaryLines,
    clone,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  global.PodcastEpisodeSetupHandoff = api;
}(typeof window !== "undefined" ? window : globalThis));
