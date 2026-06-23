# Contextual Title Cards

Title cards should surface key moments — topic shifts, guest introductions, notable quotes, and segment transitions — as polished visual beats that keep viewers oriented across a long-form episode.

## User Goal

A creator should be able to place, style, and review title cards at meaningful moments so the episode feels structured and easy to follow without manual motion-graphics work.

## Relationship To Visual Review

Title card review should start from episode context already in the workspace:

- topics and talking points from `docs/social-context-intake.md`
- guest names and handles from `docs/guest-profile-reuse.md`
- segment labels from `docs/show-segment-system.md`
- chapter titles from `docs/episode-chapter-markers.md`
- pacing intensity from `docs/preset-pacing-controls.md`
- canvas placement from `docs/canvas-layer-controls.md`
- neighboring visuals from `docs/contextual-broll-moments.md`
- on-screen corrections from `docs/on-screen-correction-note.md`
- safe areas and readability from `docs/layout-safe-areas.md`
- speaker framing from `docs/speaker-framing-safety.md`
- destination crops from `docs/destination-crop-previews.md`
- reusable styles from `docs/show-template-adaptation.md`
- export warnings in `docs/export-readiness-review.md`

## Title Card Approach

Title cards are calm structure, not decoration: creators confirm cards at real episode beats on the real frame, keep long-form spacing restrained, and open layout review when a card competes with captions or the active speaker.

## Sources

Title card content can come from:

- topic names and talking points from `docs/social-context-intake.md`
- guest names and handles from `docs/guest-profile-reuse.md`
- segment labels from `docs/show-segment-system.md`
- chapter titles from `docs/episode-chapter-markers.md`
- transcript highlights the creator marks as quotable

The product should suggest title card placements but never insert them without creator confirmation.

## Creator Controls

Use simple controls:

- accept, edit, or dismiss a suggested title card
- place a new title card at any moment
- choose a card style from the current preset
- adjust text, position, and duration with named steps
- preview a title card against the real episode moment

Avoid exposing keyframe editors, motion curves, render layers, or compositing tools in the default path.

## Review States

The product should use title card status to drive contextual review and export readiness. States should group in the long-form review surface rather than flag every suggestion equally:

- **suggested** — show the card with plain-language source context; do not include it in export until the creator keeps or edits it
- **kept** — the card stays on the moment with the chosen style; clear only the related contextual-visual readiness item when overlap and readability checks pass
- **adjusted** — the creator changed text, timing, position, or duration; reopen preview at the affected moment
- **dismissed** — remove the card from the episode without clearing unrelated caption, sponsor, metadata, or export-readiness warnings
- **saved to template** — store the card style or placement rule in `docs/show-template-adaptation.md` for future episodes after episode-specific approval
- **needs review** — keep the item in `docs/export-readiness-review.md` Contextual Visual Warnings when overlap with captions or speaker frames, mobile readability, or destination crop conflicts remain

Each state should describe what happens in preview, export readiness, and template reuse—not only the label on the card.

## Preview Contexts

A title card that reads well in one view can fail in another, so each card should be checked the way a viewer will actually see it before it is approved:

- full-size desktop preview with the active speaker visible
- small mobile preview, to confirm the text stays readable
- the card over live captions, to confirm it does not bury a line viewers need
- the card held on a paused frame, to confirm it reads on its own
- the seconds just before and after, to confirm it does not collide with a neighboring overlay or b-roll moment

Every context should use the real episode frame and the same card, so the creator judges one honest tradeoff instead of approving a card that only works in the editor's main view.

## Pacing Rules

Title cards should stay calm across a long-form episode, not crowd every moment:

- keep a restrained default count rather than a card at every topic mention
- space cards so a viewer has time to read one before the next appears
- favor cards at real beats — topic shifts, guest introductions, and segment changes
- group repeated suggestions so an hour-plus episode does not surface dozens of equal-priority cards
- preserve confirmed cards and their timing when the episode is re-rendered

Avoid filling quiet stretches with decorative cards just because a moment was detected; the conversation should stay the focus.

## Template Reuse

Title card styles and placement rules should save with the show template described in `docs/show-template-adaptation.md`, so recurring segments and guest introductions keep a consistent look across episodes.

## Maintainer Acceptance Notes

Accept work that helps creators place and review tasteful title cards at real episode beats using preset styles and simple text or duration controls. Close work that exposes keyframe editors, motion curves, or compositing tools in the default path, floods long-form episodes with decorative cards at every detected topic mention, or treats `kept` or `dismissed` as final clearance for captions, metadata, sponsor placement, or export readiness owned elsewhere.
