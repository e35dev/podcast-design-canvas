# Show Segment System

Recurring show segments should be reusable building blocks that keep an episode structured without forcing manual timeline work.

## User Goal

A creator should be able to define repeatable segments, apply them to an episode, and let the visual system adapt titles, pacing, branding, and metadata around them.

## Relationship To Episode Review

Segment arrangement should connect to the surfaces segments influence:

- chapter structure from `docs/episode-chapter-markers.md`
- title cards from `docs/contextual-title-cards.md`
- contextual visuals from `docs/contextual-broll-moments.md`
- music cues from `docs/music-cue-setup.md` and `docs/music-sound-cues.md`
- sponsor reads from `docs/sponsor-placement-review.md`
- pacing from `docs/preset-pacing-controls.md`
- metadata from `docs/episode-metadata-publishing.md`
- reusable templates from `docs/show-template-adaptation.md`

## Segment Approach

Segment arrangement is structure first: creators define repeatable show sections around the conversation—not internal timeline markers or a fixed format every episode must follow.

## Segment Types

Support common podcast segments:

- cold open
- host intro
- guest introduction
- main conversation
- recurring Q&A
- sponsor read
- teaching section
- audience question
- outro

Segments should be creator-facing and editable. Avoid making users manage internal timeline markers.

## Segment Behavior

Segments can influence:

- chapter titles
- title cards
- b-roll suggestions
- sponsor placement
- caption emphasis
- pacing choices
- export metadata
- template adaptation

The product should preview how a segment changes the episode before applying it broadly.

When a segment needs a transition sound, that cue should route through `docs/music-cue-setup.md` Placement Flow and `docs/music-sound-cues.md` Structural Routing so the creator picks a cue that matches the segment purpose instead of editing a detached audio timeline.

## Creator Controls

Defining and applying segments should stay a creator-facing arranging step, not internal timeline marking. The creator should be able to:

- create a segment from a common type or a custom one, and name it for the show
- set or adjust where a segment starts and ends from the conversation, without editing raw timeline markers
- reorder segments and apply the arrangement to the current episode
- save a segment order and visual treatment to the show template, or change it for this episode only
- skip or remove a segment for a single episode without dropping it from the template
- adjust per-episode details such as guest, topic, or sponsor inside a reused segment
- preview how a segment changes titles, pacing, and branding before applying it across the episode

A segment change should adapt the episode's structure around it rather than forcing every show into the same fixed format.

## Review States

While arranging segments, each segment is either resolved or still needs a decision, so the creator can keep the "needs attention" list focused on segments that are genuinely undecided.

Resolved — no action needed:

- ready — placed, bounded, and named; contributes to the episode
- skipped — intentionally left out of this episode but kept in the template

Unresolved — needs a creator decision, shown in the order to address first:

- empty — no part of the conversation is mapped to the segment
- needs boundaries — mapped, but the start or end in the conversation is unclear
- needs a name — bounded, but still using a default type label instead of a show-specific name

Only the unresolved tier should surface as needing attention in long-form review. These states describe the segment arrangement only; how a segment then shapes chapters, titles, pacing, branding, and metadata stays owned by the specs in Segment Behavior. Skipping a segment for one episode should not clear unrelated export-readiness or checklist warnings.

## Overlap and Gaps

Because segments are bounded against the conversation and can be reordered, two segments can end up claiming the same stretch of audio, or a stretch can fall between them with no segment assigned. The product should resolve these between-segment situations without making the creator edit raw timeline markers.

When boundaries collide, the product should:

- flag any stretch claimed by more than one segment as an overlap, and show which segments contend for it
- offer to trim the earlier segment's end to the later segment's start, or the later segment's start to the earlier segment's end, as a one-tap fix
- keep the contended stretch assigned to whichever segment the creator confirms, and never split a single moment across two segments silently
- treat a stretch with no segment as an unassigned gap, and let the creator extend a neighboring segment to cover it, drop in a new segment, or intentionally leave it as filler

A stretch is covered exactly when it belongs to a single segment; overlap and unassigned gap are surfaced as separate, fixable conditions rather than blended into one warning, and they show as a quiet marker on the stretch rather than a blocking banner. Whether a covered stretch is otherwise ready, skipped, or still undecided stays with the segment-by-segment arrangement status, and how the resulting structure shapes titles, pacing, branding, and metadata stays with the segment behavior specs.

## Reuse

Show templates can remember segment order and visual treatment, while each episode can adjust names, topics, guests, and sponsor details.

## Maintainer Acceptance Notes

Accept work that makes recurring podcast formats easier to produce across episodes. Close work that turns segments into technical markers only, forces every show into the same episode structure, or clears unrelated publish-readiness warnings when a segment is skipped for one episode.
