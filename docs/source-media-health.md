# Source Media Health

Source media health should tell creators whether their raw speaker files are good enough to produce a polished episode.

## User Goal

A creator should be able to import separate speaker recordings and see any media quality issues that will affect the final video before spending time on styling.

## Relationship To Episode Setup

Source media health should connect to the ingest and export path:

- speaker buckets from `docs/episode-ingest-readiness.md`
- speaker roles from `docs/speaker-role-mapping.md`
- per-track visual fixes from `docs/speaker-video-match.md`
- cross-speaker visual match from `docs/speaker-visual-match.md`
- audio cleanup from `docs/audio-cleanup-controls.md`
- publish checklist from `docs/publish-checklist.md`
- export warnings in `docs/export-readiness-review.md`

## Health Approach

Source health is viewer-facing first: flag only problems that affect the finished episode, preview the actual issue when possible, and hand visual-match problems to the owning surface—not codec menus or file metadata screens.

## Health Checks

Flag issues that matter to the viewer:

- speaker video is low resolution
- camera framing is too dark or blurry
- audio is missing or too quiet
- file has a different frame rate than the episode
- speaker video is portrait when the layout expects landscape
- source file appears corrupted or incomplete
- transcript generation cannot use the audio

The product should explain what the creator can do next, such as replace the file, continue with a warning, or mark a track as audio-only.

## Creator Controls

When a source file is flagged, the creator should be able to act on it without opening technical file tools. From a speaker bucket, the creator should be able to:

- replace a flagged file with a better take
- mark a track as audio-only when the video cannot be used
- continue with a visible warning when the issue does not affect the final episode
- re-import or relink a missing file
- trim or adjust a track that starts late or runs long
- re-check the track against the chosen export destination after a fix

Each action should explain its effect on the finished episode, and issues that do not affect the visible episode should never block the creator from continuing.

## Review States

The product should use source media status to drive speaker-bucket review and export readiness:

- **ready** — the track is usable for the chosen layout and destination; clear only source-media warnings for that speaker bucket
- **review suggested** — show the issue with preview when possible; keep styling available when the destination allows continuing with consequence shown
- **needs replacement** — block export when the missing or corrupted file would appear in the finished episode; link directly to replace or re-import
- **audio-only usable** — keep the speaker in the episode without video when the layout allows it; surface the consequence in export readiness
- **unavailable** — stop using the track in export until the creator replaces it or marks an allowed fallback

Each state should attach to a speaker bucket and describe the next creator action—not codec or pipeline labels.

Source media issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Source Media Warnings.

## Batch Import Summary

When a creator imports several speaker recordings at once, the product should check every file in the batch and present one calm summary instead of a separate interruption per file. The summary should let the creator see the whole import at a glance and decide where to spend attention first.

The summary should give the batch a single rolled-up status, derived from the per-track review states already attached to each speaker bucket:

- all clear — every track in the batch is usable for the chosen layout and destination; show a quiet inline marker confirming the import is ready, or nothing at all, never a blocking banner
- attention suggested — at least one track has a non-blocking issue but none would stop export; show a small inline count of how many tracks want a look, and let the creator open them in order
- action needed — at least one track would not appear correctly in the finished episode; show an inline count of those tracks and link straight to replace or re-import, while leaving the clear tracks ready to style

The rolled-up status should follow the most serious track in the batch: action needed wins over attention suggested, which wins over all clear. The summary should always offer a way to jump to just the tracks that need work, so a creator with twenty good files and two flagged ones is never asked to re-inspect the good ones.

Each per-track action should stay available from the summary without leaving it, and fixing or continuing a flagged track should update the rolled-up status immediately so the creator can watch the import settle toward ready. Whether a replaced file passes once it is checked again is decided by the same track-level health rules, not by the summary itself.

## Preview

Health checks should preview the actual problem when possible: show a dark frame, play a quiet sample, or jump to the missing section. Avoid forcing users to interpret technical file metadata.

When a speaker's problem is mainly visual rather than missing media, the next step should stay in the same creator-facing flow:

- open `docs/speaker-video-match.md` when one track needs direct correction such as backlight, contrast, or clutter cleanup before preset selection
- open `docs/speaker-visual-match.md` when multiple speakers need to look more cohesive side by side before the creator judges the preset or canvas result

Audio-only and missing-file problems should stay in source health rather than redirecting into visual matching.

When the file is usable but one speaker is too quiet, noisy, or uneven against the rest, the next step should open `docs/audio-cleanup-controls.md` instead of treating the track as broken source media.

## Maintainer Acceptance Notes

Accept work that helps creators identify source media issues before styling and export. Close work that exposes raw codec diagnostics as the main experience, blocks progress for issues that do not affect the visible episode, or clears unrelated sync or caption warnings when a track is marked audio-only or continued with warning.
