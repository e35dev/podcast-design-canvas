# Segment Transition Style

The visual move between one show section and the next should feel like an intentional, on-brand beat, not a hard jump cut, and should stay consistent across an hour-plus episode without manual editing.

## User Goal

A creator should be able to choose how the picture moves from one segment into the next — a clean cut, a branded wipe, a soft dissolve, or a short bumper — preview it on the episode's real segment boundaries, and apply it across the whole show without opening a transitions timeline.

## Where Transitions Come From

Segment transitions are placed at structure the workspace already knows, not invented per moment:

- segment boundaries from `docs/show-segment-system.md` decide where a transition belongs
- pacing sets how strong and frequent transitions feel, handed in from `docs/preset-pacing-controls.md` rather than dialed here a second time
- the transition look starts from the chosen preset in `docs/preset-style-picker.md` and brand treatment in `docs/show-brand-kit-setup.md`
- a transition's sound stays owned by `docs/music-cue-setup.md` and `docs/music-sound-cues.md`; this spec sets the visual move only
- a title card that announces the new segment stays owned by `docs/contextual-title-cards.md`; a transition can carry it but does not replace it
- reusable choices save through `docs/show-template-adaptation.md`

A transition is the visual handoff between sections; the boundary, the sound, and the announcing card each stay with the spec that owns them.

## Transition Styles

Use plain-language, preset-tied styles previewed on real boundaries:

- clean cut — an immediate change with no effect, the calm default
- soft dissolve — a brief cross-fade for reflective or teaching shows
- branded wipe — a directional move carrying the show's color or logo treatment
- short bumper — a one-to-two-second branded card between sections, for recurring formats
- hold and resume — a held end frame of the outgoing segment before the next begins, for emphasis

Each style previews on an actual segment boundary from the current episode, with both the outgoing and incoming speakers visible, so the creator judges the real handoff and not a generic sample.

## Restraint Across a Long Episode

A long conversation should not feel chopped into pieces by constant effects:

- keep the clean cut as the resting default and reserve stronger moves for real section changes
- apply one consistent style across the episode unless the creator overrides a specific boundary
- never add a transition inside a continuous conversation where no segment boundary exists
- take transition intensity from the pacing choice rather than escalating it independently
- preserve a confirmed transition and its timing when the episode is re-rendered

The conversation stays the focus; transitions mark structure, they do not decorate every moment.

## Creator Controls

Keep transitions a single preset-level choice, not a second editor:

- choose a default transition style for the whole episode from the named options
- preview the style on a real segment boundary before applying it
- override the style for one specific boundary when a section needs it
- carry an announcing title card or transition sound by handing off to the spec that owns it, not by rebuilding it here
- reset an overridden boundary back to the episode default
- save the chosen transition style to the show template

Avoid exposing per-frame timing handles, easing curves, a transitions timeline, or a generic effects library in the default path.

## Review States

Transition status describes what the move does at a boundary in plain creator-facing terms, surfaced as a quiet marker on the affected boundary in `docs/long-form-navigation.md` and rolled into `docs/export-readiness-review.md` only when it would affect the finished episode — not as a separate transitions queue:

- **preset default** — the boundary uses the episode's chosen transition style; resting state, no action needed
- **previewing** — show the style against the real boundary and do not change the episode until the creator applies it
- **overridden** — the creator chose a different move for this boundary than the episode default
- **needs review** — the transition collides with a title card, b-roll moment, or sponsor placement at the same boundary, or a strong move lands mid-conversation where no real section change exists
- **accepted default** — the creator kept the episode default at this boundary on purpose after review
- **saved to template** — store the transition style for future episodes, which re-check it against new segment structure and pacing before treating it as ready

Each state should name the affected boundary and the next surface the creator lands on, such as "Branded wipe collides with the sponsor title card entering the Q&A segment," and conflicts should route to the owning title, b-roll, or sponsor surface rather than resolving here.

## Maintainer Acceptance Notes

Accept work that makes the visual handoff between segments a simple, preset-driven, brand-aware choice that stays consistent and restrained across hour-plus episodes, takes its intensity from pacing, and hands sound and announcing cards to the specs that own them. Close work that exposes a per-frame transitions timeline, easing curves, or a generic effects library; that adds transitions inside continuous conversation where no segment boundary exists; that re-dials pacing intensity or re-implements title-card or music behavior; or that floods a long episode with decorative moves between every moment.
