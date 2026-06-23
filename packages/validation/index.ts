// Shared validation rules, used by both the editor and the API.
import type { EditDocument } from "@edit-schema";

export type Severity = "blocker" | "review";

export interface Issue {
  severity: Severity;
  title: string;
  action: string;
}

export type ReadinessStatus = "ready" | "review" | "blocked";

export interface ReadinessResult {
  status: ReadinessStatus;
  issues: Issue[];
}

export function evaluateReadiness(doc: EditDocument): ReadinessResult {
  const issues: Issue[] = [];
  const { tracks } = doc;

  if (!tracks.some((t) => t.role === "host")) {
    issues.push({
      severity: "blocker",
      title: "Missing host track",
      action: "Assign one recording to the host bucket before choosing a preset.",
    });
  }

  // Duplicate-audio heuristic.
  const byMedia = new Map<string, SpeakerLike[]>();
  for (const t of tracks) {
    if (!t.mediaRef) continue;
    byMedia.set(t.mediaRef, [...(byMedia.get(t.mediaRef) ?? []), t]);
  }
  for (const matches of byMedia.values()) {
    if (matches.length > 1) {
      issues.push({
        severity: "review",
        title: `${matches.map((m) => m.name ?? m.role).join(" and ")} appear to share audio`,
        action: "Confirm these are separate speakers or replace the duplicate recording.",
      });
    }
  }

  const longest = Math.max(0, ...tracks.map((t) => t.durationS));
  for (const t of tracks) {
    if (!t.hasVideo) {
      issues.push({
        severity: "review",
        title: `${t.name ?? t.role} is audio-only`,
        action: "Continue with an audio-only speaker or replace the file with video.",
      });
    }
    if (longest - t.durationS > 120) {
      issues.push({
        severity: "review",
        title: `${t.name ?? t.role} is more than two minutes shorter than another speaker`,
        action: "Replace the shorter file or continue with a visible gap.",
      });
    }
  }

  const status: ReadinessStatus = issues.some((i) => i.severity === "blocker")
    ? "blocked"
    : issues.length
      ? "review"
      : "ready";

  return { status, issues };
}

type SpeakerLike = EditDocument["tracks"][number];
