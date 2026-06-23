# Episode Watch-Through Preview

Before exporting, a creator should be able to watch the finished episode play through once and trust how it actually feels, not just whether a checklist is clear.

## User Goal

A creator should be able to play the finished long-form episode start to finish, sense its pacing and polish as a viewer would, and catch anything that feels off before committing to an export.

## Watch-Through Approach

The watch-through is feel first, not fault first: it plays the real finished cut at normal speed with captions, music, b-roll, and branding live, so the creator judges the episode as a viewer instead of working a warning queue. It complements, and does not replace, the categorized checks in the export readiness review.

## What Plays

The preview should reflect the episode exactly as it will export:

- live captions, speaker framing, and lower-thirds
- approved b-roll, title moments, and callouts in place
- placed intro, outro, sponsor, and transition cues at their real levels
- the chosen destination's framing so the creator watches the version they will publish

## Keeping A Long Episode Watchable

For hour-plus episodes the watch-through should stay practical to use:

- play continuously without interrupting for warnings
- let the creator drop a quick marker at a moment that felt wrong, to revisit later
- skip ahead by chapter or segment to spot-check a long stretch
- remember where the creator stopped so a review can resume across sittings
- keep markers as soft notes, not blocking issues

A dropped marker should hand the creator to the surface that owns the fix when they choose to act on it, rather than becoming a second editing tool.

Those markers should stay visible through `docs/long-form-navigation.md`, so a creator can resume a calm watch-through pass and then jump back into the owning review surface without losing playback context.

## Review States

The product should show the watch-through as a quiet readiness signal, surfaced as a calm indicator on the export readiness summary rather than a blocking banner:

- **not watched** — the creator has not yet played this version through; show a gentle reminder, never a hard stop
- **in progress** — a watch-through is partway done with the resume point remembered
- **watched, looks good** — the creator played the current version through and left it unmarked
- **watched, has notes** — the creator dropped one or more soft markers to revisit before export
- **stale** — the episode changed after the last watch-through, so the prior pass no longer reflects the export

Each state should describe what it means for the creator's confidence in the current cut, not only the label, and none of these states should block export on their own.

## Creator Controls

Keep the watch-through a single calm reviewing step:

- play the finished episode from the start or from the resume point
- drop a quick marker at a moment that felt off
- jump from a marker to the moment in the player, or open the existing editing or review surface for that element
- skip by chapter or segment to spot-check
- mark the watch-through done for this version

The watch-through should never expose render diagnostics, encoder settings, or a second editing timeline; acting on a marker takes the creator to the editing or review surface that already owns that element.

## Maintainer Acceptance Notes

Accept work that helps creators trust how a finished long-form episode feels before export through a calm linear preview. Close work that duplicates the categorized export readiness warning list, turns the watch-through into a second editor, optimizes for short clips, or blocks export on whether the creator has watched the episode.
