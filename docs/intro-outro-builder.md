# Intro And Outro Builder

Intro and outro sections should help creators frame each episode consistently while still adapting to the specific guest and topic.

## User Goal

A creator should be able to add a polished opening and closing sequence using show branding, episode metadata, and speaker context.

## Intro Elements

Support:

- show title
- episode title
- host and guest names
- short topic line
- logo or brand treatment
- music or sound cue placeholder
- first speaker frame
- sponsor disclosure when needed

The intro should preview as part of the episode, not as a detached template slide.

When a creator swaps the music or sound cue placeholder, that choice should route through `docs/music-cue-setup.md` Placement Flow and `docs/music-sound-cues.md` Structural Routing so the cue stays attached to the intro or outro purpose instead of acting like a generic background track.

## Outro Elements

Support:

- closing title
- guest links
- show subscribe prompt
- sponsor acknowledgement
- next episode teaser
- credits
- export destination note

Outro content should be easy to keep, remove, or adapt per episode.

## Template Behavior

Reusable intros and outros should store structure and brand treatment while replacing episode-specific names, titles, and links for each new episode.

Saved intro and outro cue choices should reuse the structural cue behavior described in `docs/music-cue-setup.md` Template Reuse and `docs/show-template-adaptation.md` Template Contents, so future episodes keep the intended opening or closing cue without freezing episode-specific names, links, or sponsor details.
That reusable behavior should stay aligned with `docs/show-template-adaptation.md` Template Contents and Adaptation Flow, so opening and closing structure follow the same template review path as the rest of the episode layout instead of becoming a detached template slide.

Intro and outro issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Intro And Outro Warnings.

## Creator Controls

Building an intro or outro should stay a quick, per-episode editing step rather than a fixed template slide. The creator should be able to:

- reorder or remove individual intro and outro elements
- shorten or skip the intro for a specific episode without breaking the saved template
- pull host, guest, topic, and metadata details from episode context, then edit them before applying
- swap the music or sound cue placeholder for an approved cue
- preview the opening and closing against the episode's real first and last speaker moments, not a detached slide
- keep, remove, or adapt each outro element for the current episode only
- confirm sponsor disclosure or acknowledgement when the episode requires it

Defaults should favor a short, branded opening. A creator should never be forced to keep a long intro on an episode that does not need one, and per-episode edits should not overwrite the reusable template unless the creator chooses to save them back.

## Maintainer Acceptance Notes

Accept work that makes openings and endings feel consistent, branded, and episode-aware. Close work that hard-codes a single show format, forces long intros on every episode, or treats intros and outros as unrelated video assets.
