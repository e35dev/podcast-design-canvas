# Clip Candidate Review

Clip suggestions should help creators repurpose strong moments after the long-form episode is under control.

## User Goal

A creator should be able to review candidate short clips from the finished episode, approve the best ones, and keep them connected to the source episode.

## Relationship To Episode Review

Clip review should connect to the long-form episode already in the workspace:

- transcript search pins from `docs/transcript-search-navigation.md`
- chapters and segments from `docs/episode-chapter-markers.md` and `docs/show-segment-system.md`
- title moments from `docs/contextual-broll-moments.md`
- destination crops from `docs/destination-crop-previews.md`
- caption readiness from `docs/audio-caption-quality-review.md`
- export completion from `docs/export-package-handoff.md`

## Clip Approach

Clip review is downstream first: creators pick reusable short moments from a finished long-form episode without changing the full edit or forcing short-form pacing into the main timeline.

## Candidate Signals

Suggestions can come from:

- strong guest answers
- clear teaching moments
- title moments
- chapter transitions
- high-energy exchanges
- host summaries
- sponsor-safe moments
- creator-pinned transcript results

The product should explain why a moment was suggested.

## Review Cards

Each candidate should show:

- start and end time
- speaker context
- short transcript excerpt
- suggested hook
- destination crop preview
- caption readiness
- link back to the full episode moment

## Review States

The product should use clip status to drive downstream repurposing behavior:

- **suggested** — show the proposed moment with hook and crop preview; do not treat it as export-ready until approved
- **approved** — keep the clip for short-form export or later refinement without changing the source long-form moment
- **adjusted** — store the trimmed or re-hooked version as a downstream copy linked to the source moment
- **dismissed** — hide the candidate from the default list without clearing unrelated long-form export or checklist warnings

Each state should describe what happens to the clip package and source episode—not only the label on the card.

## Creator Controls

Offer simple actions:

- approve a candidate in one action
- nudge the start or end without opening a full editor
- pick a different hook or caption emphasis for the clip
- group related candidates from the same moment
- dismiss a weak suggestion
- jump back to the moment in the full episode

Approving or adjusting a clip should never change the long-form edit. Dismissed candidates should stay out of the list unless the creator asks to see them again.

## Boundaries

Clip review should remain downstream of the long-form workflow. It should not force short-form pacing, captions, or crops into the full episode.

## Maintainer Acceptance Notes

Accept work that helps creators select reusable short moments after building the full episode. Close work that optimizes the product primarily for short clips, changes the long-form edit to chase clip performance, or clears unrelated publish-readiness warnings when a clip candidate is dismissed.
