# Show Segment System

Recurring show segments should be reusable building blocks that keep an episode structured without forcing manual timeline work.

## User Goal

A creator should be able to define repeatable segments, apply them to an episode, and let the visual system adapt titles, pacing, branding, and metadata around them.

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

While arranging segments, each segment should show one state — the most important unresolved item — so the creator can see what still needs a decision before styling and export. The states form a simple order, from least to most ready:

- skipped — intentionally left out of this episode but kept in the template
- empty — no part of the conversation is mapped to the segment
- needs boundaries — mapped, but the start or end in the conversation is unclear
- needs a name — bounded, but still using a default type label instead of a show-specific name
- ready — placed, bounded, and named

A segment has exactly one of these states at a time; resolving the current item advances it to the next. These states describe the segment arrangement only. How a segment then shapes chapters, titles, pacing, branding, and metadata stays owned by the specs in Segment Behavior, and a state should surface in long-form review only when it would affect the finished episode.

## Reuse

Show templates can remember segment order and visual treatment, while each episode can adjust names, topics, guests, and sponsor details.

## Maintainer Acceptance Notes

Accept work that makes recurring podcast formats easier to produce across episodes. Close work that turns segments into technical markers only or forces every show into the same episode structure.
