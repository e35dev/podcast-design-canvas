"use strict";

// Carries the guided episode setup (#1326) from the intake screen into the next
// preview step. The intake screen records the chosen source type, the speaker
// buckets, names, and optional social links; the next screen (episode readiness)
// reads them back and shows the creator the context they just entered, so the
// setup visibly follows into the rest of the workflow.
//
// Mirrors the layout-first handoff: sessionStorage is the primary channel, with a
// compact query string as a fallback when storage is unavailable (private windows,
// the iframe shell, a fresh deep link). Storage access is always guarded.

(function (root) {
  const STORAGE_KEY = "pdc-episode-setup";

  const SOURCE_LABELS = {
    "recording-link": "Recording link",
    "separate-files": "Separate synced files",
  };

  const BUCKET_LABELS = {
    host: "Host",
    "guest-1": "Guest 1",
    "guest-2": "Guest 2",
  };

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  // Keep only the fields we carry forward, in a stable shape, so a malformed or
  // partial payload can never crash the receiving screen.
  function normalize(state) {
    if (!state || typeof state !== "object") {
      return null;
    }
    const sourceType = SOURCE_LABELS[state.sourceType] ? state.sourceType : null;
    if (!sourceType) {
      return null;
    }
    const speakers = Array.isArray(state.speakers)
      ? state.speakers
          .map((speaker) => ({
            bucket: BUCKET_LABELS[speaker && speaker.bucket] ? speaker.bucket : "",
            name: cleanText(speaker && speaker.name),
            social: cleanText(speaker && speaker.social),
          }))
          .filter((speaker) => speaker.bucket)
      : [];
    return {
      sourceType,
      recordingLink: cleanText(state.recordingLink),
      sourceCount: Number.isFinite(state.sourceCount) ? state.sourceCount : speakers.length,
      speakers,
    };
  }

  function save(storage, state) {
    const normalized = normalize(state);
    if (!storage || !normalized) {
      return normalized;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
      // Storage may be full or blocked — the query fallback still carries the setup.
    }
    return normalized;
  }

  function clear(storage) {
    if (!storage) {
      return;
    }
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Nothing to clear if storage is unavailable.
    }
  }

  // Encode the setup as a query string so it survives when sessionStorage cannot.
  // Speakers collapse to bucket:name:social triples; social links are optional.
  function queryForState(state) {
    const normalized = normalize(state);
    if (!normalized) {
      return "";
    }
    const params = new URLSearchParams();
    params.set("setup", normalized.sourceType);
    if (normalized.recordingLink) {
      params.set("link", normalized.recordingLink);
    }
    if (normalized.speakers.length) {
      params.set(
        "speakers",
        normalized.speakers
          .map((speaker) =>
            [speaker.bucket, speaker.name, speaker.social]
              .map((part) => encodeURIComponent(part || ""))
              .join(":"),
          )
          .join(","),
      );
    }
    return params.toString();
  }

  function stateFromQuery(rawSearch) {
    const params = new URLSearchParams((rawSearch || "").replace(/^\?/, ""));
    const sourceType = params.get("setup");
    if (!SOURCE_LABELS[sourceType]) {
      return null;
    }
    const speakersRaw = params.get("speakers") || "";
    const speakers = speakersRaw
      ? speakersRaw.split(",").map((triple) => {
          const [bucket, name, social] = triple.split(":");
          return {
            bucket: decodeURIComponent(bucket || ""),
            name: decodeURIComponent(name || ""),
            social: decodeURIComponent(social || ""),
          };
        })
      : [];
    return normalize({
      sourceType,
      recordingLink: params.get("link") || "",
      speakers,
    });
  }

  function load(storage, rawSearch) {
    // A live query string wins over stored state so a deep link reflects its own setup.
    const fromQuery = stateFromQuery(rawSearch);
    if (fromQuery) {
      return fromQuery;
    }
    if (!storage) {
      return null;
    }
    try {
      return normalize(JSON.parse(storage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return null;
    }
  }

  // The single gate that decides whether the creator can continue. Pure so both the
  // intake screen and its tests can ask the same question. Returns the open issues so
  // the screen can tell the creator exactly what setup is still missing.
  //   input: { sourceType, recordingLink, tracks: [{ bucket, name, social }] }
  function evaluateSetup(input) {
    const issues = [];
    const sourceType = input && input.sourceType;
    if (!SOURCE_LABELS[sourceType]) {
      issues.push("choose-source");
    }
    if (sourceType === "recording-link" && !cleanText(input && input.recordingLink)) {
      issues.push("recording-link");
    }
    const tracks = input && Array.isArray(input.tracks) ? input.tracks : [];
    if (!tracks.length) {
      issues.push("no-sources");
    }
    if (tracks.some((track) => !BUCKET_LABELS[track && track.bucket])) {
      issues.push("unassigned-source");
    }
    if (!tracks.some((track) => track && track.bucket === "host")) {
      issues.push("no-host");
    }
    const buckets = tracks
      .map((track) => track && track.bucket)
      .filter((bucket) => BUCKET_LABELS[bucket]);
    if (new Set(buckets).size !== buckets.length) {
      issues.push("duplicate-bucket");
    }
    if (tracks.some((track) => track && BUCKET_LABELS[track.bucket] && !cleanText(track.name))) {
      issues.push("missing-name");
    }
    return { complete: issues.length === 0, issues };
  }

  // Collapse the intake's working tracks into the carried handoff shape (speakers
  // keyed by assigned bucket). Only assigned sources become speakers.
  function toHandoffState(input) {
    const tracks = input && Array.isArray(input.tracks) ? input.tracks : [];
    return normalize({
      sourceType: input && input.sourceType,
      recordingLink: input && input.recordingLink,
      sourceCount: tracks.length,
      speakers: tracks.map((track) => ({
        bucket: track && track.bucket,
        name: track && track.name,
        social: track && track.social,
      })),
    });
  }

  function sourceLabel(state) {
    return (state && SOURCE_LABELS[state.sourceType]) || "";
  }

  // A short human summary the receiving screen can show: source type, each assigned
  // speaker bucket + name, and a social-link count.
  function summary(state) {
    const normalized = normalize(state);
    if (!normalized) {
      return "";
    }
    const parts = [SOURCE_LABELS[normalized.sourceType]];
    const roles = normalized.speakers
      .map((speaker) => {
        const label = BUCKET_LABELS[speaker.bucket] || speaker.bucket;
        return speaker.name ? `${label} ${speaker.name}` : label;
      })
      .join(", ");
    if (roles) {
      parts.push(roles);
    }
    const socialCount = normalized.speakers.filter((speaker) => speaker.social).length;
    if (socialCount) {
      parts.push(`${socialCount} social ${socialCount === 1 ? "link" : "links"}`);
    }
    return parts.join(" · ");
  }

  const api = {
    STORAGE_KEY,
    SOURCE_LABELS,
    BUCKET_LABELS,
    normalize,
    save,
    clear,
    load,
    queryForState,
    stateFromQuery,
    evaluateSetup,
    toHandoffState,
    sourceLabel,
    summary,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.PodcastEpisodeSetup = api;
})(typeof window !== "undefined" ? window : globalThis);
