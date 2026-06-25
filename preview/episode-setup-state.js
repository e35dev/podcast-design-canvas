"use strict";

(function setupEpisodeState(globalObject) {
  const STORAGE_KEY = "pdc-episode-setup";
  const SOURCE_TYPES = {
    "recording-link": "Riverside recording link",
    "multi-file": "Separate synced uploads",
  };
  const BUCKETS = {
    host: "Host",
    "guest-1": "Guest 1",
    "guest-2": "Guest 2",
    "co-host": "Co-host",
    producer: "Producer / off-camera",
  };
  const REQUIRED_BUCKETS = ["host", "guest-1", "guest-2"];
  const BUCKET_ROLE = {
    host: "host",
    "guest-1": "guest",
    "guest-2": "guest",
    "co-host": "co-host",
    producer: "producer",
  };

  const SAMPLE_TRACKS = {
    "recording-link": [
      {
        id: "host-track",
        requiredBucket: "host",
        bucket: "host",
        sourceLabel: "Dana_Brooks_Host.mov",
        speakerName: "Dana Brooks",
        socialLink: "https://x.com/danabrooks",
        durationMinutes: 61,
      },
      {
        id: "guest-1-track",
        requiredBucket: "guest-1",
        bucket: "guest-1",
        sourceLabel: "Marcus_Lee_Guest.mov",
        speakerName: "Marcus Lee",
        socialLink: "https://www.linkedin.com/in/marcuslee",
        durationMinutes: 59,
      },
      {
        id: "guest-2-track",
        requiredBucket: "guest-2",
        bucket: "guest-2",
        sourceLabel: "Priya_Anand_Guest.mov",
        speakerName: "Priya Anand",
        socialLink: "",
        durationMinutes: 57,
      },
    ],
    "multi-file": [
      {
        id: "host-track",
        requiredBucket: "host",
        bucket: "host",
        sourceLabel: "Host_camera_master.mp4",
        speakerName: "Dana Brooks",
        socialLink: "https://danabrooks.fm",
        durationMinutes: 61,
      },
      {
        id: "guest-1-track",
        requiredBucket: "guest-1",
        bucket: "guest-1",
        sourceLabel: "Marcus_remote_guest.mp4",
        speakerName: "Marcus Lee",
        socialLink: "https://www.youtube.com/@marcuslee",
        durationMinutes: 59,
      },
      {
        id: "guest-2-track",
        requiredBucket: "guest-2",
        bucket: "guest-2",
        sourceLabel: "Priya_remote_guest.mp4",
        speakerName: "Priya Anand",
        socialLink: "",
        durationMinutes: 57,
      },
    ],
  };

  function cloneTrack(track) {
    return {
      id: track.id,
      requiredBucket: track.requiredBucket,
      bucket: track.bucket || "",
      sourceLabel: track.sourceLabel || "",
      speakerName: track.speakerName || "",
      socialLink: track.socialLink || "",
      durationMinutes: Number(track.durationMinutes) || 60,
    };
  }

  function cloneTracks(tracks) {
    return (tracks || []).map(cloneTrack);
  }

  function cloneValue(value) {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function createDefaultState() {
    return {
      sourceType: "recording-link",
      recordingLink: "https://riverside.fm/studio/full-episode-218",
      sourceLoaded: false,
      tracks: cloneTracks(SAMPLE_TRACKS["recording-link"]).map((track) => ({ ...track, sourceLabel: "" })),
    };
  }

  function bucketLabel(bucket) {
    return BUCKETS[bucket] || "Unassigned";
  }

  function sourceTypeLabel(sourceType) {
    return SOURCE_TYPES[sourceType] || SOURCE_TYPES["recording-link"];
  }

  function normalizeTrack(track, index) {
    const fallback = SAMPLE_TRACKS["recording-link"][index] || SAMPLE_TRACKS["recording-link"][0];
    return {
      id: track && track.id ? track.id : fallback.id,
      requiredBucket: track && track.requiredBucket ? track.requiredBucket : fallback.requiredBucket,
      bucket: track && typeof track.bucket === "string" ? track.bucket : "",
      sourceLabel: track && typeof track.sourceLabel === "string" ? track.sourceLabel : "",
      speakerName: track && typeof track.speakerName === "string" ? track.speakerName : "",
      socialLink: track && typeof track.socialLink === "string" ? track.socialLink : "",
      durationMinutes: Number(track && track.durationMinutes) || fallback.durationMinutes,
    };
  }

  function normalize(state) {
    const base = createDefaultState();
    const sourceType = state && state.sourceType === "multi-file" ? "multi-file" : "recording-link";
    const tracks = cloneTracks(
      ((state && Array.isArray(state.tracks) && state.tracks.length)
        ? state.tracks
        : base.tracks).map(normalizeTrack),
    );
    return {
      sourceType,
      recordingLink: state && typeof state.recordingLink === "string" ? state.recordingLink : base.recordingLink,
      sourceLoaded: Boolean(state && state.sourceLoaded),
      tracks,
    };
  }

  function load(storage) {
    if (!storage || typeof storage.getItem !== "function") {
      return createDefaultState();
    }
    try {
      return normalize(JSON.parse(storage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return createDefaultState();
    }
  }

  function save(storage, state) {
    if (!storage || typeof storage.setItem !== "function") {
      return;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(normalize(state)));
  }

  function clear(storage) {
    if (!storage || typeof storage.removeItem !== "function") {
      return;
    }
    storage.removeItem(STORAGE_KEY);
  }

  function applySourceSample(state, sourceType) {
    const next = normalize({ ...state, sourceType });
    next.sourceLoaded = true;
    next.tracks = cloneTracks(SAMPLE_TRACKS[sourceType]);
    return next;
  }

  function duplicateBuckets(tracks) {
    const count = new Map();
    for (const track of tracks) {
      if (!track.bucket) {
        continue;
      }
      count.set(track.bucket, (count.get(track.bucket) || 0) + 1);
    }
    return new Set([...count.entries()].filter(([, value]) => value > 1).map(([key]) => key));
  }

  function issues(state) {
    const current = normalize(state);
    const currentSourceLabel = sourceTypeLabel(current.sourceType);
    const nextIssues = [];

    if (!current.sourceLoaded) {
      nextIssues.push({
        key: "missing-source",
        title: current.sourceType === "recording-link"
          ? "Import the recording link to build the speaker tracks"
          : "Add the synced speaker files to build the setup tracks",
        action: current.sourceType === "recording-link"
          ? "Load the Riverside recording so Host and Guest tracks are ready to assign."
          : "Add the uploaded files so each speaker shows up as a track before you continue.",
      });
      return nextIssues;
    }

    const duplicates = duplicateBuckets(current.tracks);
    const covered = new Set();

    for (const track of current.tracks) {
      if (!track.sourceLabel.trim()) {
        nextIssues.push({
          key: `source:${track.id}`,
          title: `${bucketLabel(track.requiredBucket)} still needs a source file`,
          action: `Add the ${bucketLabel(track.requiredBucket)} recording before continuing from ${currentSourceLabel}.`,
        });
      }
      if (!track.bucket) {
        nextIssues.push({
          key: `bucket:${track.id}`,
          title: `${track.sourceLabel || "This track"} is not assigned to a speaker bucket`,
          action: "Choose Host, Guest 1, Guest 2, Co-host, or Producer so the episode starts organized.",
        });
      } else {
        covered.add(track.bucket);
        if (duplicates.has(track.bucket)) {
          nextIssues.push({
            key: `duplicate:${track.bucket}`,
            title: `${bucketLabel(track.bucket)} is assigned twice`,
            action: "Give each speaker track its own bucket before continuing.",
          });
        }
      }
      if (!track.speakerName.trim()) {
        nextIssues.push({
          key: `name:${track.id}`,
          title: `${bucketLabel(track.requiredBucket)} still needs a speaker name`,
          action: "Add the speaker name now so captions, lower-thirds, and references start with the right person.",
        });
      }
    }

    for (const bucket of REQUIRED_BUCKETS) {
      if (!covered.has(bucket)) {
        nextIssues.push({
          key: `required:${bucket}`,
          title: `${bucketLabel(bucket)} is still missing from the setup`,
          action: "Assign every required speaker bucket before continuing into episode review.",
        });
      }
    }

    return nextIssues.filter((issue, index, list) => list.findIndex((item) => item.key === issue.key) === index);
  }

  function isComplete(state) {
    return issues(state).length === 0;
  }

  function summary(state) {
    const current = normalize(state);
    const socialCount = current.tracks.filter((track) => track.socialLink.trim()).length;
    const names = current.tracks.map((track) => track.speakerName.trim()).filter(Boolean);
    return {
      sourceType: current.sourceType,
      sourceLabel: sourceTypeLabel(current.sourceType),
      socialCount,
      trackCount: current.tracks.length,
      names,
    };
  }

  function readinessTracksFromState(state, fallbackTracks) {
    const current = normalize(state);
    if (!current.sourceLoaded) {
      return cloneValue(fallbackTracks);
    }
    return current.tracks.map((track, index) => ({
      id: track.id || `setup-track-${index + 1}`,
      name: bucketLabel(track.bucket || track.requiredBucket),
      speakerName: track.speakerName,
      role: BUCKET_ROLE[track.bucket || track.requiredBucket] || "guest",
      duration: track.durationMinutes * 60,
      audioKey: `setup-audio-${index + 1}`,
      hasVideo: true,
      transcript: "ready",
      socialLink: track.socialLink,
      sourceLabel: track.sourceLabel,
    }));
  }

  const api = {
    STORAGE_KEY,
    BUCKETS,
    REQUIRED_BUCKETS,
    applySourceSample,
    bucketLabel,
    clear,
    createDefaultState,
    isComplete,
    issues,
    load,
    normalize,
    readinessTracksFromState,
    save,
    sourceTypeLabel,
    summary,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  globalObject.PodcastEpisodeSetupState = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
