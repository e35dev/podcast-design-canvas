# Pause And Cross-Talk Cleanup

Conversation cleanup should make long episodes easier to watch while preserving the natural rhythm of the speakers.

## User Goal

A creator should be able to review awkward pauses, false starts, and heavy cross-talk, then decide what to soften before export.

## Relationship To Speech Review

Cleanup review should start from episode context already in the workspace:

- speaker sync and track alignment from episode ingest
- caption confidence gaps in `docs/audio-caption-quality-review.md`
- pacing trim suggestions in `docs/preset-pacing-controls.md`
- transcript search for surrounding context in `docs/transcript-search-navigation.md`

Cleanup issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Audio Cleanup Warnings.

## Detected Moments

Flag moments that affect viewer clarity:

- long dead air
- repeated false starts
- cross-talk that makes captions unreliable
- accidental interruption during guest answers
- coughs or bumps during another speaker's point
- extended silence after a speaker leaves

The product should show the surrounding context before suggesting a cleanup.

## Cleanup Approach

Cleanup is review first: creators hear the moment in context and choose whether to soften it. Teaching pauses, emotional silence, and natural back-and-forth should stay unless the creator decides otherwise.

## Cleanup Actions

Use simple actions:

- shorten pause
- keep natural pause
- reduce background speaker
- leave cross-talk unchanged
- mark as intentional
- review captions here

Avoid destructive automatic cleanup across the full episode without creator review.

## Review States

The product should use cleanup status to drive speech and caption review:

- **suggested** — show the moment with surrounding transcript and audio context; do not apply changes until the creator chooses an action
- **kept natural** — leave the pause or cross-talk unchanged and clear related caption warnings when the creator confirms the moment is intentional
- **softened** — apply the chosen cleanup and refresh caption confidence for that span in `docs/audio-caption-quality-review.md`
- **needs caption review** — when cross-talk leaves missing or low-confidence words, open caption review for that moment before treating the cleanup as complete
- **ignored for export** — keep the moment unchanged but stop surfacing it in export readiness when the creator marks it as not relevant

Each state should describe what happens to playback, captions, and export warnings—not only the label on the moment.

## Creator Controls

Offer simple actions:

- play moment with context
- choose cleanup action
- mark intentional
- open caption review
- apply fix to similar moments
- ignore for export

Avoid exposing waveform editing, spectral tools, or batch auto-trim as the default workflow.

## Maintainer Acceptance Notes

Accept work that helps creators polish speech flow and caption clarity in long-form episodes. Close work that removes natural conversation texture, treats every pause as a defect, or exposes waveform editing as the default workflow.
