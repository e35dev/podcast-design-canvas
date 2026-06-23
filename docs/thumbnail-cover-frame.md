# Thumbnail And Cover Frame

The final episode package should include a strong thumbnail or cover frame that matches the episode design.

## User Goal

A creator should be able to choose or generate a publish-ready thumbnail from the finished episode without leaving the podcast production workflow.

## Relationship To Export Flow

Thumbnail selection should draw from episode context already in the workspace:

- speaker moments and title moments from the finished edit
- chapter openings from `docs/show-segment-system.md`
- brand layouts from `docs/show-brand-kit-setup.md`
- names and titles from `docs/social-context-intake.md` and `docs/transcript-glossary.md`
- platform crops from `docs/destination-crop-previews.md`
- metadata packaging in `docs/episode-metadata-publishing.md`
- readiness checks in `docs/publish-checklist.md` and `docs/export-readiness-review.md`

## Candidate Sources

Thumbnail candidates can come from:

- high-quality speaker moments
- title moments
- approved b-roll frames
- chapter openings
- uploaded show art
- brand kit layouts
- social context for names and titles

Candidates should use real episode assets and avoid generic stock-like compositions.

## Review Approach

Thumbnail review is visual first: creators pick and preview frames from episode moments rather than filling metadata forms or opening a separate design canvas.

## Review Criteria

The product should help creators evaluate:

- speaker expressions are clear
- text is readable at small sizes
- guest and show names are accurate
- brand colors and logo placement fit
- sponsor marks are allowed where present
- the frame does not spoil sensitive content

## Review States

The product should use thumbnail status to drive export and checklist behavior:

- **selected** — include the frame in `docs/export-package-handoff.md` and destination metadata where required; clear the thumbnail item in `docs/publish-checklist.md`
- **needs review** — keep the thumbnail item in needs review or blocked until the creator confirms the frame or chooses another candidate; show the specific preview concern
- **missing** — when the destination requires a thumbnail, block export in `docs/export-readiness-review.md` and link directly to candidate selection
- **low confidence** — surface the readability, naming, spoiler, or crop issue in preview; do not treat the thumbnail as publish-ready until the creator confirms or explicitly ignores the warning with the publishing consequence shown
- **not required for destination** — mark the checklist item not needed and continue export without generating a thumbnail file

Each state should describe what happens at export time, not only the label on the frame.

## Editing Controls

Keep edits lightweight:

- choose frame
- swap title text
- toggle guest name or handle
- adjust crop
- apply brand kit
- choose platform-safe crop

Advanced canvas editing can be available, but the default path should produce a usable thumbnail quickly.

## Export Connection

The selected thumbnail should appear in `docs/export-readiness-review.md`, `docs/client-review-copy-flow.md`, `docs/episode-metadata-publishing.md`, and `docs/export-package-handoff.md` where relevant for the chosen destination.

## Maintainer Acceptance Notes

Accept work that makes thumbnails feel like part of the finished podcast episode package. Close work that depends on unrelated stock art, ignores show branding, or treats thumbnail creation as a separate generic design tool.
