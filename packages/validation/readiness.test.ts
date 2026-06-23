import { describe, it, expect } from "vitest";
import { emptyDocument } from "@edit-schema";
import { evaluateReadiness } from "@validation";

function docWith(tracks: Parameters<typeof make>[0]) {
  return make(tracks);
}

function make(tracks: { role: string; name?: string; hasVideo?: boolean; durationS?: number; mediaRef?: string }[]) {
  const base = emptyDocument({ episodeId: "ep1", workspaceId: "ws1", preset: "calm-interview" });
  return {
    ...base,
    tracks: tracks.map((t, i) => ({
      id: `t${i}`,
      role: t.role as never,
      name: t.name,
      hasVideo: t.hasVideo ?? true,
      durationS: t.durationS ?? 3600,
      mediaRef: t.mediaRef,
      sync: { offsetMs: 0 },
    })),
  };
}

describe("evaluateReadiness", () => {
  it("blocks when there is no host", () => {
    const result = evaluateReadiness(docWith([{ role: "guest" }]));
    expect(result.status).toBe("blocked");
  });

  it("is ready for a clean host + guest", () => {
    const result = evaluateReadiness(docWith([{ role: "host" }, { role: "guest" }]));
    expect(result.status).toBe("ready");
  });

  it("flags an audio-only speaker for review", () => {
    const result = evaluateReadiness(docWith([{ role: "host" }, { role: "guest", hasVideo: false }]));
    expect(result.status).toBe("review");
    expect(result.issues.some((i) => i.title.includes("audio-only"))).toBe(true);
  });
});
