# Speaker Attribution Review

Speaker attribution should help creators trust who is speaking in captions, search, and publish checks without exposing raw transcript mechanics.

## User Goal

A creator should be able to confirm that host, guest, panelist, and off-camera voices are attached to the right moments before captions and metadata are marked ready for export.

## When To Flag

Flag attribution issues that affect the finished episode:

- a caption line names the wrong speaker
- a host or guest exchange is unlabeled after cross-talk
- an off-camera voice is shown as an on-camera guest
- transcript speaker changes no longer match video after sync repair
- repeated speaker labels conflict with the roles in `docs/speaker-role-mapping.md`

## Creator Controls

Use simple controls:

- assign a line or section to a speaker bucket
- split a back-and-forth exchange into two speakers
- mark a voice as off-camera or narrator
- apply the same speaker fix to nearby repeated lines
- open sync repair when timing is the likely cause
- reset attribution to the current role mapping

Avoid diarization scores, word-level timing grids, model logs, waveform alignment, or speaker embeddings in the default path.

## Review States

Use simple states:

- ready
- needs speaker
- speaker mismatch
- sync repair needed
- not in exported episode

These states should appear in caption review and long-form navigation only when they affect visible captions, search results, or publish readiness.

## Flow Connections

Attribution review starts from the speaker buckets and roles confirmed in `docs/episode-ingest-readiness.md` and `docs/speaker-role-mapping.md`. If the wrong speaker appears because the tracks drifted, hand the moment to `docs/speaker-sync-repair.md` instead of asking the creator to relabel every caption.

Caption wording, style, and confidence stay owned by `docs/audio-caption-quality-review.md`. Corrected speaker labels should also improve transcript jumps in `docs/transcript-search-navigation.md`, so a creator can find the right person and moment during long-form review.

## Publish Readiness

Speaker attribution should clear the `captions reviewed` item in `docs/publish-checklist.md` only when exported captions and searchable transcript moments point to the right speaker. Export readiness should surface unresolved attribution only when it affects the finished episode, then link back to this review or `docs/speaker-sync-repair.md` for the fix.
