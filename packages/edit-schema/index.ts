// Edit Document — the shared contract for editor, API, and workers.
import { z } from "zod";

export const SpeakerRole = z.enum([
  "host",
  "co-host",
  "guest",
  "panelist",
  "producer",
  "narrator",
]);
export type SpeakerRole = z.infer<typeof SpeakerRole>;

// Durable speaker identity, threaded through every stage.
export const SpeakerBucket = z.object({
  id: z.string(),
  role: SpeakerRole,
  name: z.string().optional(),
  mediaRef: z.string().optional(), // object-store key for the uploaded track
  hasVideo: z.boolean().default(true),
  durationS: z.number().int().nonnegative().default(0),
  sync: z.object({ offsetMs: z.number().default(0) }).default({ offsetMs: 0 }),
});
export type SpeakerBucket = z.infer<typeof SpeakerBucket>;

export const LayerKind = z.enum([
  "speaker-frame",
  "caption",
  "lower-third",
  "title-moment",
  "broll-zone",
  "logo",
]);
export type LayerKind = z.infer<typeof LayerKind>;

const Box = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

export const Layer = z.object({
  id: z.string(),
  kind: LayerKind,
  box: Box,
  z: z.number().int().default(0),
  locked: z.boolean().default(false),
  speakerId: z.string().optional(),
  props: z.record(z.unknown()).default({}),
});
export type Layer = z.infer<typeof Layer>;

export const SegmentKind = z.enum([
  "cold-open",
  "intro",
  "main",
  "sponsor",
  "outro",
]);
export type SegmentKind = z.infer<typeof SegmentKind>;

export const Segment = z.object({
  id: z.string(),
  kind: SegmentKind,
  order: z.number().int(),
});
export type Segment = z.infer<typeof Segment>;

export const EditDocument = z.object({
  version: z.literal(1),
  episodeId: z.string(),
  workspaceId: z.string(),
  preset: z.string(), // never blank
  templateRef: z.string().optional(),
  brandKitRef: z.string().optional(),
  tracks: z.array(SpeakerBucket),
  layers: z.array(Layer).default([]),
  segments: z.array(Segment).default([]),
});
export type EditDocument = z.infer<typeof EditDocument>;

// Minimal document, born from a preset (never blank).
export function emptyDocument(input: {
  episodeId: string;
  workspaceId: string;
  preset: string;
}): EditDocument {
  return {
    version: 1,
    episodeId: input.episodeId,
    workspaceId: input.workspaceId,
    preset: input.preset,
    tracks: [],
    layers: [],
    segments: [
      { id: "seg-intro", kind: "intro", order: 0 },
      { id: "seg-main", kind: "main", order: 1 },
      { id: "seg-outro", kind: "outro", order: 2 },
    ],
  };
}
