export type SpeakerRole = "host" | "co-host" | "guest" | "panelist" | "producer" | "voiceover";

export type TrackHealth = "ready" | "review" | "missing" | "audio-only";

export interface SpeakerTrack {
  id: string;
  speakerName?: string;
  role: SpeakerRole;
  durationSeconds?: number;
  audioFingerprint?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  transcriptStatus: "not-started" | "processing" | "ready" | "failed";
}

export interface ReadinessIssue {
  code:
    | "missing-speaker"
    | "duplicate-audio"
    | "audio-only"
    | "duration-mismatch"
    | "transcript-unavailable";
  severity: "blocker" | "review";
  speakerTrackIds: string[];
  message: string;
  nextAction: string;
}

export interface EpisodeReadiness {
  status: "ready" | "review" | "blocked";
  issues: ReadinessIssue[];
}

export interface EpisodeReadinessOptions {
  requiredRoles?: SpeakerRole[];
  durationMismatchSeconds?: number;
}

const DEFAULT_DURATION_MISMATCH_SECONDS = 120;

export function evaluateEpisodeReadiness(
  tracks: SpeakerTrack[],
  options: EpisodeReadinessOptions = {},
): EpisodeReadiness {
  const issues: ReadinessIssue[] = [];
  const requiredRoles = options.requiredRoles ?? ["host"];
  const durationMismatchSeconds = options.durationMismatchSeconds ?? DEFAULT_DURATION_MISMATCH_SECONDS;

  for (const role of requiredRoles) {
    if (!tracks.some((track) => track.role === role)) {
      issues.push({
        code: "missing-speaker",
        severity: "blocker",
        speakerTrackIds: [],
        message: `Missing required ${role} track.`,
        nextAction: `Assign a speaker recording to the ${role} bucket before choosing a preset.`,
      });
    }
  }

  for (const track of tracks) {
    if (!track.hasAudio) {
      issues.push({
        code: "missing-speaker",
        severity: "blocker",
        speakerTrackIds: [track.id],
        message: `${speakerLabel(track)} has no usable audio.`,
        nextAction: "Replace the track or remove this speaker from the episode.",
      });
    }

    if (track.hasAudio && !track.hasVideo) {
      issues.push({
        code: "audio-only",
        severity: "review",
        speakerTrackIds: [track.id],
        message: `${speakerLabel(track)} can be used as audio-only.`,
        nextAction: "Continue with an audio-only speaker or replace the file with video.",
      });
    }

    if (track.transcriptStatus === "failed" || track.transcriptStatus === "not-started") {
      issues.push({
        code: "transcript-unavailable",
        severity: "review",
        speakerTrackIds: [track.id],
        message: `${speakerLabel(track)} does not have a ready transcript.`,
        nextAction: "Start transcript generation or continue knowing captions may need review.",
      });
    }
  }

  issues.push(...findDuplicateAudioIssues(tracks));
  issues.push(...findDurationMismatchIssues(tracks, durationMismatchSeconds));

  return {
    status: issues.some((issue) => issue.severity === "blocker")
      ? "blocked"
      : issues.length > 0
        ? "review"
        : "ready",
    issues,
  };
}

function findDuplicateAudioIssues(tracks: SpeakerTrack[]): ReadinessIssue[] {
  const byFingerprint = new Map<string, SpeakerTrack[]>();

  for (const track of tracks) {
    if (!track.audioFingerprint) {
      continue;
    }
    byFingerprint.set(track.audioFingerprint, [...(byFingerprint.get(track.audioFingerprint) ?? []), track]);
  }

  return [...byFingerprint.values()]
    .filter((matches) => matches.length > 1)
    .map((matches) => ({
      code: "duplicate-audio" as const,
      severity: "review" as const,
      speakerTrackIds: matches.map((track) => track.id),
      message: `${matches.map(speakerLabel).join(" and ")} appear to use the same audio.`,
      nextAction: "Confirm these are separate speakers or replace the duplicate recording.",
    }));
}

function findDurationMismatchIssues(
  tracks: SpeakerTrack[],
  durationMismatchSeconds: number,
): ReadinessIssue[] {
  const timedTracks = tracks.filter(
    (track): track is SpeakerTrack & { durationSeconds: number } => typeof track.durationSeconds === "number",
  );

  if (timedTracks.length < 2) {
    return [];
  }

  const longest = timedTracks.reduce((current, track) =>
    track.durationSeconds > current.durationSeconds ? track : current,
  );

  return timedTracks
    .filter((track) => longest.durationSeconds - track.durationSeconds > durationMismatchSeconds)
    .map((track) => ({
      code: "duration-mismatch" as const,
      severity: "review" as const,
      speakerTrackIds: [longest.id, track.id],
      message: `${speakerLabel(track)} is more than ${Math.round(durationMismatchSeconds / 60)} minutes shorter than ${speakerLabel(longest)}.`,
      nextAction: "Replace the shorter file or continue with a visible gap.",
    }));
}

function speakerLabel(track: SpeakerTrack): string {
  return track.speakerName ?? track.role;
}
