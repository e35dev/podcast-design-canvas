# Preset Style Picker

The first editing path should let a creator choose a strong podcast visual style before they ever open a blank canvas.

## User Goal

A creator with synced host and guest recordings should be able to preview a polished long-form episode direction by choosing a preset, adjusting a few plain-language options, and applying it to the episode.

## Relationship To Episode Setup

Preset selection should start from episode context already in the workspace:

- speaker roles and bucket mapping from `docs/speaker-role-mapping.md`
- names and show context from `docs/social-context-intake.md`
- brand defaults from `docs/show-brand-kit-setup.md`
- side-by-side comparison in `docs/preset-comparison-preview.md`
- reusable layouts through `docs/show-template-adaptation.md`
- framing checks in `docs/speaker-framing-safety.md`

The preset step should feel like choosing a polished direction for this episode, not configuring a blank project.

## Preset Cards

Each preset card should show:

- the layout structure for host, guest, captions, title moments, and b-roll zones
- the pacing style, such as calm interview, punchy commentary, or teaching-focused
- the best-fit show type, such as solo host, two-person interview, panel, or agency client show
- a short preview state that uses the current episode speakers where available

## Selection Approach

Preset selection is visual first: creators preview a polished episode direction from real speaker media, not a generic settings form.

## Controls

Keep the controls creator-facing:

- layout density: simple, balanced, layered
- caption presence: minimal, standard, high-emphasis
- visual moments: restrained, balanced, energetic
- branding strength: neutral, show-branded, sponsor-ready

Caption presence choices should open the caption style preset path described in `docs/audio-caption-quality-review.md` Caption Style Presets.

Avoid exposing internal rendering, tracking, or timeline mechanics in this first path.

## Apply And Preview

Applying a preset should produce a polished first look at the whole episode, not just a styled card. When a creator applies a preset, the product should:

- carry forward any confirmed corrections from `docs/speaker-video-match.md` so the preview starts from balanced speaker footage instead of untreated mismatches
- lay out host, guest, captions, title moments, and b-roll zones for the episode's actual speaker count
- use the current episode's real speakers and social-context names where available
- render a previewable direction the creator can scrub before committing
- keep every choice adjustable without dropping the creator into a blank canvas

This is the core workflow promise: a creator reaches a publishable-feeling direction by choosing a preset, not by positioning every element by hand. Applying a preset should never require manual canvas work to see a first preview, and it should not make the creator redo speaker balancing that was already confirmed before preset selection.

## Control Mapping

Each control should drive the spec that owns its deeper behavior, so a preset stays a real visual direction instead of a settings form:

| Control | Owning spec | Relevant section |
| --- | --- | --- |
| layout density | `docs/layout-safe-areas.md` | Safe Area Types, Checks |
| caption presence | `docs/audio-caption-quality-review.md` | Caption Style Presets |
| visual moments | `docs/preset-pacing-controls.md` | Pacing Options, Effects |
| branding strength | `docs/show-brand-kit-setup.md` | Brand Inputs, Guardrails |

Before a preset preview is shown, visible speaker mismatches should route through `docs/speaker-video-match.md` When To Match and Review States so creators can fix footage coherence before judging layout, captions, or branding.

Changing a control should update the live preview through the owning spec, not open a separate configuration screen. A preset the creator likes should be saveable as a reusable show layout through `docs/show-template-adaptation.md` Template Contents, Adaptation Flow.

## Comparison Preview Flow

When one preset direction looks promising but a creator wants to compare it against another, comparison should stay inside preset selection rather than sending the creator into a separate planning tool.

Comparison should hand off to `docs/preset-comparison-preview.md` with the creator's current episode context:

- keep the same timestamp across compared presets
- carry current speaker names, roles, and brand kit
- preserve the current layout density, caption presence, visual moments, and branding strength choices while switching preset directions
- let the creator apply the chosen preset back to the full-episode preview without rebuilding the setup

Comparison exists to help creators make a faster taste decision on a real episode moment. It should not require mock scenes, placeholder media, or a separate approval step before the creator can apply a preset.

## Review States

The product should use preset status to drive the first-edit path:

- **previewing** — show the preset against real episode media; do not apply layout changes until the creator commits
- **selected** — lock the preset direction for apply and open comparison or control adjustments without leaving the preview
- **applied** — lay out the episode through the owning specs in Control Mapping; surface framing or caption follow-up only through the owning review surface, not by clearing unrelated warnings
- **saved as template** — carry the preset into `docs/show-template-adaptation.md` for future episodes
- **needs adjustment** — when speaker count, brand kit, or caption style conflicts with the preset, link to the owning spec instead of exposing canvas editing as the default fix

Each state should describe what the creator sees next in preset selection and preview—not unrelated export or caption readiness.

## Creator Controls

Offer simple actions:

- compare presets
- switch preview moment
- adjust plain-language controls
- apply preset to episode
- save as show template
- open canvas for advanced edits

Avoid forcing manual canvas positioning before the creator sees a polished first preview.

## Maintainer Acceptance Notes

Accept implementation work that makes preset selection feel visual, direct, and immediately previewable. Close work that turns the preset step into a generic settings form or forces users into manual canvas editing before they can see a polished direction.
