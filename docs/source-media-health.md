# Source Media Health

Source media health should tell creators whether their raw speaker files are good enough to produce a polished episode.

## User Goal

A creator should be able to import separate speaker recordings and see any media quality issues that will affect the final video before spending time on styling.

## Relationship To Ingest

Source media health should start from speaker buckets already assigned during ingest:

- empty or mismatched buckets from `docs/episode-ingest-readiness.md`
- visual matching follow-up in `docs/speaker-video-match.md` when the file is usable but looks inconsistent
- sync repair in `docs/speaker-sync-repair.md` when timing rather than file quality is the problem
- export resurface in `docs/export-readiness-review.md` Source Media Warnings when an unfixed track would ship in the finished episode

Source media issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Source Media Warnings.

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

## Health Approach

Track health is speaker first: creators review one bucket at a time with a visible preview or sample, then choose replace, continue, audio-only, or open visual match. Avoid exposing codec lists, bitrate tables, or pipeline diagnostics in the default path.

## Review States

The product should use media health status to drive ingest confidence and export readiness:

- **ready** — the track is usable for styling and export without further action
- **review suggested** — the track may work but has a visible quality issue the creator should preview
- **needs replacement** — the file is missing, corrupted, or too broken to style confidently
- **audio-only usable** — the creator marked the track as voice-only and layouts should adapt accordingly
- **unavailable** — the file cannot be loaded and should block export if still included

Repaired or audio-only outcomes should flow back to `docs/episode-ingest-readiness.md` so the setup screen reflects the current bucket state instead of re-flagging a resolved problem.

## Creator Controls

Offer direct fixes:

- replace the file
- preview the dark, quiet, or corrupted section
- mark as audio-only
- continue with warning for this episode
- open visual match when the issue is look consistency rather than missing media
- jump back to ingest to reassign the bucket

## Readiness Summary

Use clear status labels:

- ready
- review suggested
- needs replacement
- audio-only usable
- unavailable

The summary should attach to speaker buckets so creators understand which person is affected.

## Preview

Health checks should preview the actual problem when possible: show a dark frame, play a quiet sample, or jump to the missing section. Avoid forcing users to interpret technical file metadata.

When a speaker's problem is mainly visual rather than missing media, the next step should stay in the same creator-facing flow:

- open `docs/speaker-video-match.md` when one track needs direct correction such as backlight, contrast, or clutter cleanup before preset selection
- open `docs/speaker-visual-match.md` when multiple speakers need to look more cohesive side by side before the creator judges the preset or canvas result

Audio-only and missing-file problems should stay in source health rather than redirecting into visual matching.

## Maintainer Acceptance Notes

Accept work that helps creators identify source media issues before styling and export. Close work that exposes raw codec diagnostics as the main experience or blocks progress for issues that do not affect the visible episode.
