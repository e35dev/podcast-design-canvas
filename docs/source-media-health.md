# Source Media Health

Source media health should tell creators whether their raw speaker files are good enough to produce a polished episode.

## User Goal

A creator should be able to import separate speaker recordings and see any media quality issues that will affect the final video before spending time on styling.

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

## Readiness Summary

Use clear status labels:

- ready
- review suggested
- needs replacement
- audio-only usable
- unavailable

The summary should attach to speaker buckets so creators understand which person is affected.

Source media issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Source Media Warnings.

## Preview

Health checks should preview the actual problem when possible: show a dark frame, play a quiet sample, or jump to the missing section. Avoid forcing users to interpret technical file metadata.

When a speaker's problem is mainly visual rather than missing media, the next step should stay in the same creator-facing flow:

- open `docs/speaker-video-match.md` when one track needs direct correction such as backlight, contrast, or clutter cleanup before preset selection
- open `docs/speaker-visual-match.md` when multiple speakers need to look more cohesive side by side before the creator judges the preset or canvas result

Audio-only and missing-file problems should stay in source health rather than redirecting into visual matching.

## Maintainer Acceptance Notes

Accept work that helps creators identify source media issues before styling and export. Close work that exposes raw codec diagnostics as the main experience or blocks progress for issues that do not affect the visible episode.
