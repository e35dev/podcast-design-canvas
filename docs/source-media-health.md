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

## Maintainer Acceptance Notes

Accept work that helps creators identify source media issues before styling and export. Close work that exposes raw codec diagnostics as the main experience or blocks progress for issues that do not affect the visible episode.
