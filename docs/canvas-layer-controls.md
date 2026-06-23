# Canvas Layer Controls

The canvas editor should let advanced creators customize a podcast layout without losing the structure that makes presets feel polished.

## User Goal

A creator should be able to adjust speaker frames, captions, overlays, title elements, and b-roll zones directly on the canvas, then save those choices as a reusable show layout.

## Core Layers

The layer stack should use podcast-specific objects:

- speaker video frames
- captions
- lower-thirds
- title moments
- b-roll zones
- shapes and backgrounds
- logos, sponsor marks, and show branding
- safe-area guides for publishing destinations

Layer names should match what creators see in the episode. Avoid generic object names like rectangle 12 or media asset 4 in the primary UI.

## Direct Manipulation

Creators should be able to:

- drag and resize speaker frames
- crop a speaker without changing sync
- reorder overlays above or below video
- snap objects to common podcast layouts
- lock brand elements that should not move accidentally
- preview layout changes against real episode moments

When editing a preset, the canvas should preserve the preset's pacing and visual logic unless the creator intentionally changes it.

## Speaker And Moment Awareness

Canvas objects should understand episode context:

- speaker frames stay attached to speaker buckets
- lower-thirds inherit names and handles from social context
- captions avoid covering active speaker faces when possible
- b-roll zones can appear only during approved moments
- title elements can inherit episode metadata

The editor should make context visible enough to guide the creator, without turning the canvas into a timeline engineering tool.

## Preview Guardrails

Before a creator applies a layout across the episode or saves it as a reusable template, the canvas should surface the visible checks that already shape the surrounding workflow:

- safe-area conflicts from `docs/layout-safe-areas.md` Checks
- speaker visibility blockers from `docs/speaker-framing-safety.md` Checks and Creator Controls
- destination-specific crop failures from `docs/destination-crop-previews.md` Checks and Fixes
- brand readability risks from `docs/show-brand-kit-setup.md` Preview Surfaces and Guardrails
- cross-speaker visual mismatch carried from `docs/speaker-visual-match.md` Review States and Connection to Preset and Canvas
- speaker-count fallback choices from `docs/show-template-adaptation.md` Adaptation Flow when the current episode does not match the saved layout

These warnings should open the exact moment and preview surface the creator needs to fix. Export readiness can summarize unresolved layout problems later, but the canvas should stay the place where creators actually solve them.

## Review States

Use simple creator-facing states:

- editing — a layer change is visible in preview but not yet applied broadly or saved
- applied to moment — the edit affects one timestamp or segment the creator chose
- applied broadly — the same layout pattern carries to similar moments after confirmation
- saved to template — the layout is stored for reuse through `docs/show-template-adaptation.md`
- needs guardrail review — overlap, crop, or brand readability still blocks save or export

Each state should describe what happens in preview and the next creator action, such as "Caption zone overlaps the lower-third on the mobile preview."

## Reuse Requirements

Before saving a canvas layout as a template, confirm which parts should adapt next time:

- speaker count and roles
- guest names and lower-thirds
- brand colors and logo placement
- caption style
- title moment treatment
- b-roll placement rules

## Template Reuse Mapping

When a canvas layout is saved as a reusable template, each adaptable element should follow the spec that already owns its adaptation rather than re-implementing brand, caption, role, or context logic inside the canvas. This keeps the editor a layout surface and protects the strong preset foundation.

| Adaptable element | Spec that owns the adaptation | Relevant section |
| --- | --- | --- |
| speaker count and roles | `docs/speaker-role-mapping.md` | Core Roles, Layout Effects |
| guest names and lower-thirds | `docs/social-context-intake.md`, `docs/guest-profile-reuse.md` | Accepted Inputs, Review States; Reusable Details, Episode Review |
| brand colors and logo placement | `docs/show-brand-kit-setup.md` | Brand Inputs, Reuse |
| caption style | `docs/audio-caption-quality-review.md` | Caption Style Presets |
| title moment treatment | `docs/contextual-broll-moments.md` | Visual Types, Approval Flow |
| b-roll placement rules | `docs/contextual-broll-moments.md` | Approval Flow, Quality Rules |

The saved layout is applied to future episodes through `docs/show-template-adaptation.md` (Template Contents, Adaptation Flow). The canvas editor should store which elements adapt and hand off to these specs, not duplicate their behavior.

## Maintainer Acceptance Notes

Accept work that makes canvas editing feel visual, structured, and reusable for podcast layouts. Close work that becomes a generic design editor, breaks speaker-track relationships, or removes the strong preset foundation.
