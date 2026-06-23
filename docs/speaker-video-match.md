# Speaker Video Match

Separately recorded speakers should look like they belong in the same conversation, even when they recorded in different rooms with different cameras.

## User Goal

A creator should be able to bring mismatched speaker recordings closer in look before choosing a preset, so the episode feels like one production.

## Match Targets

Offer plain-language corrections:

- brightness balance across speakers
- color warmth consistency
- exposure correction for backlit speakers
- background simplification for cluttered rooms
- contrast normalization between recordings

Each adjustment should preview on the real speaker frame and show a before-and-after comparison.

## Preview Contexts

Creators should judge video matching on episode moments where mismatches are easiest to notice:

- a solo close-up of the current speaker
- a split-screen exchange between host and guest
- a branded preset preview with captions visible
- a darker or backlit speaking moment
- a quick switch from one speaker to the next

Previewing more than one moment keeps creators from approving a correction that only works for the brightest frame or a single preset layout.

These previews should make the correction decision obvious:

- show a paused frame and a short playback loop for the same moment
- compare the corrected speaker against at least one other participant in the same layout
- keep the active preset framing visible so creators can judge whether matching still feels natural once the episode is styled
- preserve the same timestamp while switching between corrected and original footage

## Creator Controls

Use simple controls:

- auto-match all speakers to the best-lit recording
- adjust a single speaker manually
- reset to original look
- lock a speaker's correction before applying a preset
- skip matching when recordings already look consistent

Avoid exposing white balance kelvin values, histograms, LUTs, or color grading curves in this path.

## When To Match

Speaker video matching should happen after import and before preset selection:

- source quality issues surface in `docs/source-media-health.md`
- matched video feeds into the preset preview in `docs/preset-style-picker.md`
- corrections persist through canvas editing in `docs/canvas-layer-controls.md`

Matching should not undo the creator's preset or brand choices later in the flow.

## Review States

Use simple states:

- matched
- needs review
- skipped

These states should appear during ingest readiness only when the mismatch would be visible in the finished episode. When a creator leaves this step, the chosen state should carry into `docs/preset-style-picker.md` Apply And Preview so preset comparisons reflect the corrected footage instead of the untreated source.

## Template Reuse

When a show template includes recurring speakers, the product should remember their correction preferences from previous episodes and offer them as a starting point.
