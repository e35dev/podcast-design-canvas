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

## When to Flag

Flag switch framing only when it affects the finished episode:

- ready
- needs review — a long stretch with no reframe looks static
- conflict — switch overlaps with a b-roll moment or sponsor placement

These states should appear in `docs/long-form-navigation.md` navigation lanes and in `docs/export-readiness-review.md` Speaker Framing Warnings when they would affect export.

## Review States

Use simple creator-facing states:

- ready — the switch style fits the exchange and export preview looks correct
- override active — a moment-specific framing choice differs from the preset default
- needs review — a long stretch with no reframe looks static in preview
- conflict — a switch overlaps with a b-roll moment or sponsor placement
- reset pending — the creator is previewing a return to the preset default

Each state should describe what viewers would notice, such as "Featured speaker stays pinned through a guest answer."

## Template Reuse

When saving a show template via `docs/show-template-adaptation.md`, the chosen switch style and speed should carry forward so recurring shows keep a consistent feel across episodes.

Template reuse should preserve the default switch style while still letting each episode review whether a specific exchange needs a different framing choice.
