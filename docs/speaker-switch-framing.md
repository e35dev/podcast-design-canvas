# Speaker Switch Framing

When the active speaker changes during a conversation, the layout should reframe naturally so the audience always sees who matters most in that moment.

## User Goal

A creator should be able to control how the episode reframes between speakers without manually cutting every transition across an hour-plus episode.

## Switch Styles

Use plain-language framing styles tied to the chosen preset:

- featured speaker — active speaker fills the main frame, others shrink
- equal presence — all speakers stay the same size regardless of who talks
- side-by-side — two speakers share the frame with a subtle highlight on the active one
- picture-in-picture — active speaker large, others in a small inset
- reaction aware — briefly hold on a listener's visible reaction before switching

Each style should preview on a real multi-speaker moment from the current episode.

Switch-style choice should stay tied to `docs/preset-style-picker.md` so creators can compare framing behavior as part of preset selection instead of treating speaker reframe style like a detached camera mode.

## Creator Controls

Use simple controls:

- choose a default switch style from the preset
- override the style for a specific moment
- set how quickly the reframe happens (instant, smooth, slow)
- pin a speaker as featured for an entire segment
- reset overrides back to the preset default

Avoid exposing keyframe timelines, easing curves, camera-track automation, or cut-list editing in this path.

When a creator overrides switch framing for one moment, that override should still appear in `docs/long-form-navigation.md` as a reviewable moment so the creator can revisit the same exchange without hunting through the whole episode.

## Review States

Keep switch framing status simple and creator-facing:

- ready — the reframe matches the chosen preset style for this stretch
- needs review — a long stretch with no reframe looks static or confusing
- conflict — the switch overlaps with a b-roll moment or sponsor placement
- overridden — the creator chose a different style for this moment than the preset default
- accepted original — the creator kept the preset default on purpose after review

Each state should point to a clear next step, not a raw cut list or camera track.

## When to Flag

Flag switch framing only when it affects the finished episode. Use the Review States above rather than surfacing every reframe equally.

These states should appear in `docs/long-form-navigation.md` navigation lanes and in `docs/export-readiness-review.md` Speaker Framing Warnings when they would affect export.

## Speaker Count Changes

When the people on screen during an episode don't match the speaker count the saved layout expects, the framing should adapt on its own and show the creator what changed:

- a guest who appears for only one segment gets folded into the active layout while present, then dropped from the frame once they stop speaking
- a solo intro before a guest arrives frames the lone host full, then opens room for the second speaker at the moment they first speak
- more speakers than the preset plans for fall back to the nearest layout the preset can hold, with the extra speakers added as smaller presences rather than forcing a re-pick
- fewer speakers than expected close the empty slots so the remaining speakers fill the frame instead of leaving a gap where someone never arrived

The creator sees a short note on each segment where the live count differed from the layout, so they can confirm the auto-adapted framing or pin a preferred arrangement for that stretch. Adapting to a changed count should reuse the episode's existing reframe styles and speeds rather than inventing a separate look for guest moments.

## Template Reuse

When saving a show template via `docs/show-template-adaptation.md`, the chosen switch style and speed should carry forward so recurring shows keep a consistent feel across episodes.

Template reuse should preserve the default switch style while still letting each episode review whether a specific exchange needs a different framing choice.
