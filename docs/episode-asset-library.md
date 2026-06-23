# Episode Asset Library

The asset library should make reusable podcast materials easy to find without exposing creators to raw production storage.

## User Goal

A creator should be able to reuse logos, guest photos, b-roll, sponsor marks, title images, and show graphics across episodes with clear ownership and context.

## Relationship To Production Workflow

Asset choices should stay attached to the workflow that gives them meaning:

- workspace scoping from `docs/team-workspace-organization.md`
- guest headshots and lower-third images from `docs/guest-profile-reuse.md`
- sponsor marks and disclosure graphics from `docs/sponsor-placement-review.md`
- approved b-roll clips and screenshots from `docs/contextual-broll-moments.md`
- title backgrounds and thumbnail images from `docs/thumbnail-cover-frame.md`
- show logos, textures, and recurring graphics from `docs/show-brand-kit-setup.md`
- intro and outro elements from `docs/intro-outro-builder.md`
- reusable show-level assets from `docs/show-template-adaptation.md`
- export package completeness from `docs/export-package-handoff.md`
- missing-asset recovery from `docs/render-failure-recovery.md`

## Asset Library Approach

Assets are workflow-owned first: every asset card should show where it belongs, where it is already used, and which review surface approves it—not generic file metadata or folder paths.

## Asset Types

Support podcast-specific assets:

- show logo
- guest headshot or approved image
- sponsor logo
- b-roll clip
- screenshot
- title card background
- lower-third graphic
- intro or outro element
- thumbnail image

Assets should be labeled by how creators use them, not only by file type.

## Organization

Assets should be scoped to:

- current episode
- show template
- client or agency workspace
- speaker profile
- sponsor kit

The product should show where an asset is already used so creators do not accidentally remove something from a finished episode.

## Discovery

Creators should be able to find assets by:

- speaker
- show
- episode
- sponsor
- recent use
- approved or needs review
- visual role

Search and filters should stay tied to podcast workflow rather than generic file management.

## Review States

The product should use asset review status to drive placement and handoff behavior. Lifecycle availability (`suggested`, `in use`, `archived`) stays separate in **Asset Status** below—these states describe whether the creator should trust the asset for its role:

- **ready to place** — approved for the intended role in this context and available for new placement; routing to guest, sponsor, brand, b-roll, or thumbnail review still happens through the owning spec when the asset is applied
- **needs role approval** — visible in the library but blocked for new placement until the creator confirms the role such as sponsor mark, guest headshot, thumbnail source, or b-roll support
- **flagged in use** — already appears in at least one episode, template, or kit with an active concern; keep the warning wherever it is placed, stop offering it for new placements, and open the owning review surface
- **rejected for this episode** — hide from current-episode suggestions only; do not treat this as global archival or as clearing approval standing for other episodes or templates
- **wrong context** — block placement until the creator confirms the correct show, client, speaker, or sponsor kit boundary

Each state should describe what happens on placement and export—not only the label on the asset card. Approving an asset for a role must not auto-clear caption, metadata, sponsor placement, or export-readiness warnings owned elsewhere.

## Creator Controls

From an asset card, creators should be able to:

- preview where the asset already appears in the current episode, template, or review copy
- replace the asset only for the current episode or also for future template reuse
- approve the asset for a specific role such as sponsor mark, title image, thumbnail source, or b-roll support
- hide a rejected asset from future suggestions without breaking already exported episodes
- open the owning workflow directly when the decision depends on guest, sponsor, brand, or thumbnail review

## Safety Rules

Before applying an asset, flag:

- missing usage approval
- low-resolution image
- unreadable sponsor mark
- wrong speaker association
- asset already rejected for this episode

## Asset Status

Every asset should carry one lifecycle status at a time, describing where the asset is in its life rather than whether it is cleared for a role. A single asset should be in exactly one of:

- suggested — pulled in automatically or proposed for the creator, not yet placed in any episode, template, or kit
- in use — currently placed in at least one current episode, template, speaker profile, or sponsor kit
- archived — retired by the creator from future suggestions and new placements

These three states should be mutually exclusive: an asset that becomes placed moves out of suggested, and archiving overrides suggested or in use.

Lifecycle status is separate from the approval and review flags above, and the two can apply at once, so the product should define the combined picture rather than hide one behind the other:

- when an in-use asset also carries a rejection or review flag such as a wrong-speaker or missing-approval concern, keep a clear warning wherever the asset already appears, stop offering it for new placements, and point the creator to the approval concern to resolve — while leaving any already-exported episode untouched
- an archived asset keeps whatever approval or rejection it last had, so restoring it later brings back that same standing instead of silently clearing it
- status decides availability for new use; the approval flag decides whether the creator should trust the asset, and a status change never counts as resolving an approval concern

The product should also make clear what each status means for already-finished work:

- archiving an asset keeps it out of new suggestions and new placements while leaving every already-exported episode untouched
- an archived asset stays findable when a creator opens an episode or template that already relies on it, so retired material is never silently lost
- moving an asset back from archived to suggested or in use should be a deliberate creator action, not an automatic side effect of search or filtering

## Maintainer Acceptance Notes

Accept work that helps creators reuse approved podcast assets across episodes, templates, and clients with clear ownership and usage context. Close work that becomes a generic file browser, ignores where assets are used in final exports, hides approval concerns behind lifecycle status, or treats asset role approval as final clearance for captions, metadata, sponsor placement, or export readiness owned elsewhere.
