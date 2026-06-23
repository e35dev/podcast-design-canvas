# Episode Version History

Version history should help creators compare meaningful episode changes without exposing low-level file revisions.

## User Goal

A creator should be able to return to an earlier edit state, compare major creative decisions, and understand what changed before exporting or sending a review copy.

## Relationship To Episode Review

Version history should connect to the workflows that create meaningful checkpoints:

- template apply and divergence from `docs/show-template-adaptation.md`
- review-copy milestones from `docs/client-review-copy-flow.md`
- export warning changes from `docs/export-readiness-review.md`
- package handoff states from `docs/export-package-handoff.md`
- metadata updates from `docs/episode-metadata-publishing.md`
- caption and visual approvals from `docs/audio-caption-quality-review.md` and `docs/contextual-broll-moments.md`
- team attribution from `docs/team-workspace-organization.md` when multiple editors are present

## History Approach

Version history is checkpoint first: show creator-meaningful creative decisions with visual comparison—not raw autosave logs, background processing steps, or file-revision mechanics.

## Version Events

Capture creator-meaningful events:

- preset applied
- brand kit changed
- canvas layout saved
- template applied
- caption review completed
- b-roll moments approved
- review copy created
- export readiness warnings resolved
- metadata updated

Avoid showing every automatic render, autosave, or background processing step as a main version.

## Comparison

Creators should be able to compare:

- layout changes
- caption style changes
- approved versus rejected b-roll
- metadata changes
- template changes
- export warning changes

The comparison should use visual preview where possible.

## Flow Connections

Version history should stay connected to the creative workflows that produce episode-level decisions:

- template apply and divergence states from `docs/show-template-adaptation.md`
- review-copy milestones and resolved feedback from `docs/client-review-copy-flow.md`
- export warning changes before final handoff from `docs/export-package-handoff.md`

The product should show creator-meaningful checkpoints from these flows, not raw autosave noise or background processing logs.

## Version Actions

A creator scanning version history should be able to act on a checkpoint without digging through low-level revisions.

Every version has one status:

- current — the edit state the creator is working in
- superseded — an earlier checkpoint kept for reference

On top of status, a creator can apply independent flags, which can combine on the same version:

- labeled — given a plain-language name
- pinned — kept easy to find as an important checkpoint
- protected — a final export or client-approved state that should not be overwritten

Keep the actions simple:

- label a version in plain language
- pin an important checkpoint
- compare two versions side by side
- restore an earlier version
- duplicate a version as a safe place to try changes
- protect a final or approved version from accidental overwrite

Acting on a version should describe the creative effect, not a file operation: "Restore the edit from before the last template change" rather than "revert to an earlier revision." Restoring follows the rules in Restore Behavior below, and a protected version should stay safe even when the creator restores or edits other checkpoints.

## Restore Behavior

Restoring a version should explain what will change:

- current episode only
- linked template
- brand kit
- metadata
- review comments

The product should protect final exports and client-approved states from accidental overwrites.

## Review States

Use simple creator-facing states:

- browsing — the creator is scanning meaningful checkpoints without changing the live edit
- comparing — two versions preview side by side with creative differences highlighted
- restore preview — the creator is seeing what would change before confirming a restore
- **restore confirmed** — an earlier checkpoint became the live edit with the creative effect explained; do not clear unrelated export-readiness or checklist warnings unless the restored checkpoint explicitly resolves them
- **protected checkpoint** — a final export or client-approved version stays safe from overwrite

Each state should describe the creative effect, such as "Restore would revert the caption style from the last template change."

## Team Checkpoints

When more than one person edits an episode, version history should stay readable instead of turning into a raw edit log:

- show which collaborator made a checkpoint in plain language, not a raw user ID
- keep the checkpoint list grouped by creator-meaningful event, not by who saved last
- make a protected final or client-approved checkpoint safe from overwrite no matter who is editing
- let any collaborator label, pin, or compare a checkpoint without changing whose work it was

Solo creators should never see team attribution clutter; show it only when a workspace actually has more than one editor. Workspace, reviewer, and approver organization itself stays in `docs/team-workspace-organization.md` — this view only attributes the meaningful checkpoints it already shows.

## Maintainer Acceptance Notes

Accept work that makes meaningful episode decisions recoverable and understandable. Close work that shows raw autosave logs, treats exports as editable versions, makes template changes ambiguous, or clears unrelated publish-readiness warnings when a creator is only browsing or comparing checkpoints.
