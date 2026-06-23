# Preset Pacing Controls

Preset pacing should let creators shape how energetic an episode feels without manually editing every moment.

## User Goal

A creator should be able to choose a pacing feel that matches the show and preview how it changes speaker framing, visual moments, captions, and transitions.

## Pacing Options

Use plain-language controls:

- calm interview
- balanced conversation
- punchy commentary
- teaching focused
- panel discussion
- sponsor-friendly

Each option should describe what changes visually and rhythmically.

## Effects

Pacing can influence:

- frequency of title moments
- b-roll suggestion intensity
- caption emphasis
- speaker frame changes
- transition strength
- pause trimming recommendations
- chapter density

The product should avoid changing the actual conversation meaning just to make the episode feel faster.

## Effect Routing

Pacing owns how energetic an episode feels, but each concrete change it triggers should be rendered and reviewed by the spec that owns that element, so a pacing choice never becomes a second editor for titles, b-roll, captions, or chapters:

| Pacing effect | Owning spec | Relevant section |
| --- | --- | --- |
| frequency of title moments | `docs/contextual-title-cards.md` | Sources, Creator Controls |
| b-roll suggestion intensity | `docs/contextual-broll-moments.md` | Moment Sources, Approval Flow |
| caption emphasis | `docs/audio-caption-quality-review.md` | Caption Style Presets |
| speaker frame changes | `docs/speaker-framing-safety.md` | Framing Approach, Review States |
| pause trimming recommendations | `docs/pause-crosstalk-cleanup.md` | Detected Moments, Cleanup Actions |
| chapter density | `docs/episode-chapter-markers.md` | Where Chapters Come From, Creator Controls |

Transition strength and overall rhythm stay owned by pacing itself. A pacing choice should set intensity and hand the concrete elements to these specs already attached to the right speakers and moments, not duplicate their review surfaces.

## Preview

Creators should preview pacing on:

- episode opening
- a high-energy exchange
- a quiet explanation
- a chapter transition
- a sponsor or metadata-heavy moment

Previewing multiple moments prevents the creator from choosing a pacing style that only works for one clip.

## Creator Controls

Keep pacing a single creative choice, not a second editor for every element it touches:

- choose a pacing feel from the named options
- preview the feel across the sampled moments before applying it
- apply a pacing feel to the whole episode
- nudge intensity up or down one step without leaving the preset
- hold a specific moment at its current pacing when the show needs it
- open the owning spec to adjust a concrete change instead of editing it here
- save the chosen pacing feel to the show template

Avoid exposing raw edit timing, per-cut duration handles, or frame-level rhythm automation in the default path.

## Review States

Pacing status should describe what a pacing choice does to the episode, while element-level review stays with the spec that owns each change in Effect Routing:

- **previewing** — show the pacing feel against the sampled moments and do not change the episode until the creator applies it
- **applied** — set intensity across the episode and hand each concrete change to its owning spec already attached to the right speakers and moments
- **moment held** — keep a creator-pinned moment at its current pacing even when the surrounding episode feel changes
- **needs element review** — when a pacing change pushes titles, b-roll, captions, framing, pauses, or chapters past what those specs have approved, send the creator to the owning spec rather than resolving it here
- **saved to template** — store the pacing feel for future episodes, which re-check it against new speakers, length, and chapter timing before treating it as ready

Each state should describe what happens to the episode preview and which owning spec renders the concrete change, not only the label on the pacing choice. Pacing-level issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` as part of the relevant element's warnings, not as a separate pacing queue.

## Maintainer Acceptance Notes

Accept work that makes pacing a simple preset-level creative choice for long-form episodes. Close work that exposes raw edit timing controls too early or optimizes only for short-form clip energy.
