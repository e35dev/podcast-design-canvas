# Contextual B-Roll Moments

B-roll and callouts should make long-form conversations clearer and more engaging without overwhelming the episode.

## User Goal

A creator should be able to review suggested visual moments, approve the ones that fit the show, and keep the episode feeling intentionally edited.

## Relationship To Visual Review

Contextual visual review should start from episode context already in the workspace:

- transcript topics and references from episode ingest and `docs/transcript-search-navigation.md`
- names, brands, and references from `docs/social-context-intake.md`
- segment structure from `docs/show-segment-system.md`
- sponsor-safe visuals from `docs/sponsor-placement-review.md`
- title cards from `docs/contextual-title-cards.md`
- framing checks from `docs/speaker-framing-safety.md`
- reusable moments from `docs/show-template-adaptation.md`
- export warnings in `docs/export-readiness-review.md`

## Moment Sources

Suggestions can come from:

- transcript topics and repeated references
- approved social context
- episode title and description
- speaker emphasis and chapter-like transitions
- uploaded brand or sponsor assets
- creator-pinned notes

The product should explain why a moment was suggested in plain language, such as "Guest mentions the product launch" or "Host introduces a new segment."

## Visual Types

Use podcast-appropriate visual treatments:

- image or video b-roll
- title cards
- quote emphasis
- website or social preview
- product screenshot
- sponsor-safe callout
- subtle background shift

Each treatment should preview on the real episode frame before approval.

## Visual Approach

Contextual visuals are review first with restrained defaults: creators approve moments on the real episode frame, and a long episode should not become visually noisy just because many candidate moments exist.

## Preview Contexts

A b-roll or callout moment that looks right in one view can fail in another, so a candidate should be checked the same way a viewer will actually see it before it is approved:

- full-size desktop preview
- small mobile preview
- the moment under active speech, to confirm the visual does not bury a face or a line viewers need
- the moment held on a paused frame, to confirm it reads on its own
- the seconds just before and after, to confirm it does not collide with a neighboring overlay or title moment

Every context should use the real episode frame and the same candidate, so the creator judges one honest tradeoff instead of approving a moment that only works in the editor's main view.

## Quality Rules

Suggestions should avoid:

- unrelated personal details
- low-confidence public context
- visuals that cover active speaker faces
- repetitive overlays in back-to-back moments
- short-clip pacing that feels wrong in a full episode

## Review States

The product should use visual moment status to drive contextual review and export readiness, and states should group in the long-form review surface rather than flag every candidate equally, so the default view stays calm:

- **suggested** — show the moment with plain-language context; do not include it in export until the creator approves or replaces it
- **approved** — include the visual in the exported episode and clear only the related contextual-visual readiness item
- **adjusted** — approved with a changed treatment, timing, or strength; reopen preview at the affected moment
- **replaced** — swap the suggestion for creator-chosen media or treatment and reopen preview at the affected moment
- **rejected** — remove the suggestion from export consideration without clearing unrelated caption, sponsor, or metadata warnings
- **pinned to template** — save a recurring visual pattern to `docs/show-template-adaptation.md` for future episodes after episode-specific approval
- **needs review** — keep the item in `docs/export-readiness-review.md` Contextual Visual Warnings when overlap, low-confidence context, or framing conflicts remain

Each state should describe what happens in preview, export readiness, and template reuse—not only the label on the moment.

## Creator Controls

Offer simple actions:

- approve, reject, or replace a suggestion
- adjust the start and end point
- choose a calmer or stronger treatment
- block a repeated source from future suggestions
- pin a visual moment into the show template when it is recurring
- jump to framing or title-card review when overlap appears

Avoid auto-filling the episode with visuals or exposing a separate effects timeline as the default workflow.

## Maintainer Acceptance Notes

Accept work that helps creators add relevant b-roll, callouts, and title moments with reviewable context. Close work that auto-fills the whole episode with distracting visuals, uses social context beyond visible episode quality, or clears unrelated publish-readiness warnings when a visual moment is rejected.
