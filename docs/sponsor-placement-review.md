# Sponsor Placement Review

Sponsor elements should be easy to place, review, and export without disrupting the episode's conversational feel.

## User Goal

A creator should be able to add sponsor visuals or disclosures, preview them in context, and confirm they do not conflict with speakers, captions, or show branding.

## Relationship To Episode Review

Sponsor placement should start from episode context already in the workspace:

- brand and sponsor-safe areas from `docs/show-brand-kit-setup.md`
- reusable sponsor rules from `docs/show-template-adaptation.md`
- disclosure text in `docs/episode-metadata-publishing.md`
- intro and outro acknowledgements in `docs/intro-outro-builder.md`
- sponsor music from `docs/music-cue-setup.md`
- framing and readability from `docs/speaker-framing-safety.md` and `docs/layout-safe-areas.md`
- nearby visual moments in `docs/contextual-broll-moments.md`
- export warnings in `docs/export-readiness-review.md`

## Sponsor Inputs

Support creator-facing inputs:

- sponsor name
- logo or brand mark
- approved URL or handle
- required disclosure text
- preferred placement window
- visual strength: subtle, standard, prominent
- reuse across future episodes

Do not require creators to configure ad-serving systems, tracking tags, or campaign mechanics in the default flow.

## Placement Approach

Sponsor review is context first: creators preview each placement on the real episode frame at the affected moment, not in a detached ad-management screen.

## Placement Types

Use podcast-appropriate placements:

- lower-corner sponsor mark
- title card sponsor mention
- chapter intro sponsor slate
- host-read visual support
- end-card sponsor acknowledgement
- description metadata reminder

Each placement should preview against the real canvas layout.

## Conflict Checks

Before export, flag:

- sponsor mark covers a face
- sponsor mark conflicts with lower-thirds
- disclosure text is missing
- sponsor visual appears during an unrelated sensitive moment
- sponsor asset does not meet readability or contrast requirements

Warnings should explain the viewer-facing issue and offer a direct fix.

## Review States

The product should use sponsor status to drive placement and export readiness:

- **placed** — show the sponsor element on the episode timeline with preview context; do not treat it as export-ready until episode-specific approval is complete
- **needs review** — keep the item in `docs/export-readiness-review.md` Sponsor Placement Warnings until disclosure, readability, or placement conflicts are resolved
- **approved for export** — include the placement and disclosure in the exported episode; clear only sponsor-related checklist and readiness items
- **conflict flagged** — block export for required sponsor destinations when the mark covers a face, misses disclosure, or appears during a sensitive moment; link directly to the fixing surface
- **not applicable for episode** — hide sponsor checklist and readiness items when the episode has no sponsor elements; do not clear unrelated metadata or caption warnings

Each state should describe what happens in preview, metadata, and export readiness—not only the label on the sponsor placement.

## Creator Controls

Placing a sponsor element should stay a quick, tasteful step the creator controls per episode. The creator should be able to:

- add or move a sponsor element by placement type, such as a lower-corner mark, title card mention, or end-card acknowledgement
- set the visual strength to subtle, standard, or prominent
- choose the placement window and preview it against the real canvas layout at the affected moment
- confirm the required disclosure text before the element appears in the episode
- swap the sponsor asset
- resolve a flagged conflict by accepting the suggested fix, moving the element, or reducing its strength
- approve a sponsor element for this episode only, or save the rule to the show template for recurring sponsors
- remove or skip a sponsor element for a single episode without dropping it from the template

Sponsor placement should never feel like configuring an ad system: the creator works with visible episode elements and approves them in context. Avoid exposing ad-serving settings, tracking tags, or campaign dashboards in the default workflow.

## Template Reuse

Recurring sponsor rules can be saved to a show template, but episode-specific approvals should remain tied to the current episode.

## Maintainer Acceptance Notes

Accept work that helps creators place sponsor visuals and disclosures tastefully in long-form podcast episodes. Close work that adds generic ad-tech workflow, hides sponsor conflicts until export, makes sponsorship mandatory for all shows, or clears unrelated publish-readiness warnings when sponsor review changes state.
