# Speaker Eye-Line Coherence

When speakers record on separate cameras, the layout should make them appear to face one another so a two-person conversation reads as one room instead of two strangers staring the same way.

## User Goal

A creator should be able to place separately-recorded speakers into a layout and have them feel like they are looking at each other, without manually mirroring frames or nudging crops across an hour-plus episode.

## When This Applies

Eye-line coherence matters wherever two or more speakers share the frame and the audience reads a relationship between them:

- a host-and-guest side-by-side or split layout
- a panel where listeners should track who is addressing whom
- a moment where one speaker turns to react to another
- a guest who joins for one segment and sits beside the host

It does not apply to solo stretches, full-screen single-speaker moments, or intentionally stylized layouts where speakers are meant to address the camera directly.

## Coherence Signals

Flag the spatial mismatches a viewer would feel, in plain language and on real episode frames:

- both speakers appear to look the same direction instead of toward each other
- a speaker placed on the right appears to look further right, away from the person beside them
- a reaction lands while the reacting speaker faces away from the speaker they are reacting to
- two speakers' eye-lines cross awkwardly so neither seems to be addressing the other

Describe each as a viewer-facing observation ("Host and guest both look left"), never as an angle measurement or vector readout.

## Coherence Choices

Offer simple, preset-aware ways to bring eye-lines into agreement:

- swap left/right placement so the speakers face inward
- mirror a single speaker's frame so they face the conversation
- favor a layout the current preset already supports over a custom one
- keep the original placement when the creator judges it fine

Each choice should preview on the real shared-frame moment, with the chosen preset's framing and brand elements visible, so the creator judges the finished look rather than a bare crop. Mirroring should respect anything that would read backwards, such as on-shirt text or a visible logo, and warn before flipping it.

## Preview Contexts

An eye-line that reads right in one shot can fail in the next, so a choice should be checked the way a viewer will see it:

- the side-by-side or split moment where both speakers share the frame
- a reaction moment where one speaker turns toward the other
- the layout under the chosen preset with lower-thirds and brand colors
- the hand-off back to a single featured speaker, to confirm placement still reads

Compare against at least one shared-frame moment, and keep the preset framing visible so the relationship still feels natural once the episode is styled.

Avoid exposing gaze vectors, head-pose readouts, or per-frame angle values in these previews.

## Review States

Eye-line coherence should surface as a quiet, non-blocking badge on shared-frame moments, never as a banner that stops review:

- **coherent** — the speakers appear to face one another for this stretch; no action needed
- **needs review** — speakers appear to look the same way or away from each other in a shared frame
- **adjusted** — the creator swapped placement or mirrored a frame; reopen preview at the affected moment
- **accepted as is** — the creator kept the original placement on purpose, and the badge clears for this episode

Each state should say what happens in preview and template reuse, not only name the moment. These states should appear in `docs/long-form-navigation.md` lanes and in `docs/export-readiness-review.md` Speaker Framing Warnings only when the mismatch would be visible in the finished episode.

## Connections

Eye-line coherence should reuse decisions the workspace already owns rather than redefining framing:

- speaker buckets and roles come from `docs/speaker-role-mapping.md` (Core Roles, Layout Effects)
- which speaker is featured and how the layout reframes on a speaker change stays in `docs/speaker-switch-framing.md` (Switch Styles, Speaker Count Changes)
- placement and mirroring happen on real layers in `docs/canvas-layer-controls.md` (Direct Manipulation, Speaker And Moment Awareness)
- color and brightness coherence stays in `docs/speaker-visual-match.md` (Match Signals) and is judged before eye-line, so creators fix look and spatial relationship in a sensible order
- occlusion checks stay in `docs/speaker-framing-safety.md` (Checks); eye-line answers "do they face each other," not "is a face covered"
- a confirmed left/right arrangement carries forward through `docs/show-template-adaptation.md` (Template Contents) for recurring setups

The creator should set placement once for a recurring recording setup and let these surfaces apply it, not re-decide it every episode.

## Maintainer Acceptance Notes

Accept work that makes separately-recorded speakers appear to face one another using simple swap-and-mirror choices previewed under the chosen preset. Close work that exposes gaze vectors or head-pose math to creators, flips frames with readable logos or text without warning, blocks review with eye-line banners, or duplicates the featured-speaker reframing already owned by speaker switch framing.
