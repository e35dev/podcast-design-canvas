# Screen Share Moment Review

Screen-share moments should help creators use shared screens, slides, and walkthroughs as clear visual evidence inside the finished episode, without turning the product into a screen-recording editor.

## User Goal

A creator should be able to decide when a shared screen should lead the layout, stay beside the speaker, or be skipped so viewers can follow the conversation in a long-form episode.

## Moment Sources

Screen-share review should start from episode context already captured in the workspace:

- shared-screen tracks imported through `docs/episode-ingest-readiness.md`
- source quality warnings from `docs/source-media-health.md`
- speaker and screen layout choices from `docs/canvas-layer-controls.md`
- creator-marked moments from `docs/transcript-search-navigation.md`
- approved supporting visuals from `docs/contextual-broll-moments.md`

The product should treat screen share as episode content, not as a detached asset library item.

## Creator Controls

Use simple controls:

- feature the shared screen for this moment
- keep speaker and screen side by side
- choose a readable focus area
- replace the screen with an approved visual or title card
- hide a private, blank, or unreadable frame
- save the preferred screen layout to the show template

Avoid exposing capture settings, monitor names, cursor logs, resolution diagnostics, or track routing in the default path.

## Review States

Use simple, creator-facing states:

- ready
- needs focus
- screen unreadable
- speaker too small
- private frame hidden
- skipped

These states should appear in the canvas or visual review surface only when the screen moment remains in the finished episode.

## Publish Readiness

Confirmed screen-share moments should follow the same visual checks as other episode visuals: safe placement from `docs/layout-safe-areas.md`, destination fit from `docs/destination-crop-previews.md`, and unresolved export issues in `docs/export-readiness-review.md`.

Unreadable or private screen moments should block only the affected export moment. Skipped moments should stay out of export without clearing unrelated caption, speaker, or metadata warnings.

## Template Reuse

Reusable screen layouts should save through `docs/show-template-adaptation.md` so recurring walkthrough segments can keep a consistent shape while each episode still re-checks the actual shared screen, speakers, and destination crop.
