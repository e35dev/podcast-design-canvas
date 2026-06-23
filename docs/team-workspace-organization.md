# Team Workspace Organization

Team workspaces should help creators and agencies manage multiple shows without mixing client assets, templates, or approvals.

## User Goal

A team should be able to organize shows, episodes, templates, assets, and reviewers in a way that matches podcast production.

## Relationship To Production Workflow

Workspace organization should connect to the surfaces teams actually use:

- review handoff from `docs/review-handoff-summary.md`
- client review copies from `docs/client-review-copy-flow.md`
- publish checklist approvals from `docs/publish-checklist.md`
- templates from `docs/show-template-adaptation.md`
- brand kits from `docs/show-brand-kit-setup.md`
- guest profiles from `docs/guest-profile-reuse.md`
- sponsor assets from `docs/sponsor-placement-review.md`
- episode assets from `docs/episode-asset-library.md`
- version checkpoints from `docs/episode-version-history.md`

## Workspace Approach

Workspace organization is production context first: teams should see shows, clients, episodes, and reviewers in creative terms—not generic folders or file storage.

## Workspace Structure

Support organization by:

- show
- client
- episode
- template
- brand kit
- guest profile
- sponsor kit
- review copy

The primary organization should be creative and production context, not raw folders.

## Team Views

Useful views include:

- episodes needing review
- exports ready to publish
- templates recently changed
- assets needing approval
- sponsor approvals pending
- guest information needing confirmation

Each view should link back to the relevant episode moment or product surface.

## Review States

The product should use workspace item status to drive team navigation without replacing owning review surfaces:

- **scoped** — the item belongs to the current show or client workspace
- **shared pending confirmation** — another show or client can reuse the item only after ownership is confirmed
- **needs review** — open the linked episode moment or review surface; do not treat workspace list status as final publish approval
- **ready to publish** — export or handoff is available for that episode within the workspace context
- **blocked by ownership** — stop cross-show reuse until the creator confirms the correct client or show boundary

Each state should describe what the team can open next—not only the label on the workspace row.

## Creator Controls

Organizing a workspace should follow podcast production, not generic file management. A team should be able to:

- create a show or client workspace and keep its templates, brand kit, assets, and guests scoped to it
- move or copy an episode, template, or asset between contexts only after confirming ownership
- assign reviewers and a final approver to a show or episode
- open any team view directly to the episode moment or product surface that needs attention
- share a template, asset, or guest profile across shows only when the creator confirms it is reusable
- keep solo creators on a simple default without requiring team setup

Shared resources should always show their owning show or client before they are applied somewhere new.

## Boundaries

Teams should not accidentally reuse assets, guests, or sponsor materials across the wrong client or show. The product should make ownership visible before applying shared resources.

Solo creators should never see team attribution clutter; show multi-editor and reviewer details only when a workspace actually has more than one person involved.

## Maintainer Acceptance Notes

Accept work that makes multi-show podcast production easier for teams and agencies. Close work that turns the workspace into generic file storage, hides client and show boundaries, or treats workspace list status as final approval for captions, metadata, or export readiness owned elsewhere.
