# Preset Pacing Controls

Preset pacing should let creators shape how energetic an episode feels without manually editing every moment.

## User Goal

A creator should be able to choose a pacing feel that matches the show and preview how it changes speaker framing, visual moments, captions, and transitions.

## Relationship To Production Workflow

Pacing owns how energetic an episode feels, but each concrete change it triggers should be rendered and reviewed by the spec that owns that element:

- preset selection from `docs/preset-style-picker.md`
- side-by-side comparison from `docs/preset-comparison-preview.md`
- title moment frequency from `docs/contextual-title-cards.md`
- b-roll suggestion intensity from `docs/contextual-broll-moments.md`
- caption emphasis from `docs/audio-caption-quality-review.md`
- speaker frame changes from `docs/speaker-framing-safety.md`
- pause trimming recommendations from `docs/pause-crosstalk-cleanup.md`
- chapter density from `docs/episode-chapter-markers.md`
- runtime overview from `docs/episode-runtime-shaping.md`
- reusable show defaults from `docs/show-template-adaptation.md`
- export readiness from `docs/export-readiness-review.md`

Transition strength and overall rhythm stay owned by pacing itself. A pacing choice should set intensity and hand the concrete elements to these specs already attached to the right speakers and moments, not duplicate their review surfaces.

## Pacing Approach

Pacing is one creative feel, not a second editor: creators choose energy once, preview it across representative moments, and open the owning surface when a concrete element needs adjustment.

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
- open the editing surface for a concrete change — titles, b-roll, captions, framing, pauses, or chapters — to adjust it there instead of here
- save the chosen pacing feel to the show template

Avoid exposing raw edit timing, per-cut duration handles, or frame-level rhythm automation in the default path.

## Review States

Pacing status should describe what a pacing choice does to the episode in plain creator-facing terms:

- **previewing** — show the pacing feel against the sampled moments and do not change the episode until the creator applies it
- **fits the show** — the pacing feel matches the format across calm and energetic samples; does not clear caption, metadata, sponsor, or export-readiness warnings owned elsewhere
- **too aggressive** — visual rhythm or pause trimming would feel rushed for this episode
- **too calm** — title moments, b-roll, or frame changes feel underpowered for the content
- **ready to apply** — the creator checked multiple moments and can commit pacing to the episode
- **applied** — set intensity across the episode; each concrete change appears on the editing surface that owns it, already attached to the right speakers and moments
- **moment held** — keep a creator-pinned moment at its current pacing even when the surrounding episode feel changes; does not clear unrelated caption or attribution warnings on that moment
- **needs element review** — when a pacing change pushes titles, b-roll, captions, framing, pauses, or chapters past what the creator has approved, take the creator to that editing or review surface rather than resolving it here
- **saved to template** — store the pacing feel for future episodes, which re-checks it against new speakers, length, and chapter timing before treating it as ready

Each state should describe what changes in preview and which editing or review surface the creator lands on, such as "Punchy commentary adds title moments too often in the teaching segment." Pacing-level issues that would affect the chosen export destination should appear in the export readiness review alongside the relevant element, not as a separate pacing queue.

## Maintainer Acceptance Notes

Accept work that makes pacing a simple preset-level creative choice for long-form episodes. Close work that exposes raw edit timing controls too early, optimizes only for short-form clip energy, duplicates element review surfaces, or treats `fits the show`, `moment held`, or `applied` as final clearance for captions, metadata, sponsor placement, or export readiness owned elsewhere.
