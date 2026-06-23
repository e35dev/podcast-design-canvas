# Clip Candidate Review

Clip suggestions should help creators repurpose strong moments after the long-form episode is under control.

## User Goal

A creator should be able to review candidate short clips from the finished episode, approve the best ones, and keep them connected to the source episode.

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

Pinned transcript moments should come from `docs/transcript-search-navigation.md` Results and Filters so clip discovery stays grounded in real long-form review instead of a separate short-form-only search path.

## Review Cards

Each candidate should show:

- start and end time
- speaker context
- short transcript excerpt
- suggested hook
- destination crop preview
- caption readiness
- link back to the full episode moment

Those cards should reuse the existing preview and navigation surfaces:

- `destination crop preview` should use `docs/destination-crop-previews.md` Preview Surfaces, Checks, and Fixes
- `link back to the full episode moment` should return to the long-form review context in `docs/long-form-navigation.md` Moment Cards and Playback Continuity
- transcript excerpts should stay aligned with `docs/transcript-search-navigation.md` Results so creators can trust the quoted moment before approving a clip

## Boundaries

Clip review should remain downstream of the long-form workflow. It should not force short-form pacing, captions, or crops into the full episode.

If a candidate needs a different crop, caption treatment, or speaker framing to work, that adjustment should stay localized to clip review and should not rewrite the long-form episode by default.

## Maintainer Acceptance Notes

Accept work that helps creators select reusable short moments after building the full episode. Close work that optimizes the product primarily for short clips or changes the long-form edit to chase clip performance.
