# Episode Version History

Version history should help creators compare meaningful episode changes without exposing low-level file revisions.

## User Goal

A creator should be able to return to an earlier edit state, compare major creative decisions, and understand what changed before exporting or sending a review copy.

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

## Maintainer Acceptance Notes

Accept work that makes meaningful episode decisions recoverable and understandable. Close work that shows raw autosave logs, treats exports as editable versions, or makes template changes ambiguous.
