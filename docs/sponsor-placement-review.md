# Sponsor Placement Review

Sponsor elements should be easy to place, review, and export without disrupting the episode's conversational feel.

## User Goal

A creator should be able to add sponsor visuals or disclosures, preview them in context, and confirm they do not conflict with speakers, captions, or show branding.

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

Sponsor issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Sponsor Placement Warnings.

## Creator Controls

Placing a sponsor element should stay a quick, tasteful step the creator controls per episode. The creator should be able to:

- add a sponsor element by placement type, such as a lower-corner mark, title card mention, or end-card acknowledgement
- set the visual strength to subtle, standard, or prominent
- choose the placement window and preview it against the real canvas layout
- confirm the required disclosure text before the element appears in the episode
- resolve a flagged conflict by accepting the suggested fix, moving the element, or reducing its strength
- approve a sponsor element for this episode only, or save the rule to the show template for recurring sponsors
- remove or skip a sponsor element for a single episode without dropping it from the template

Sponsor placement should never feel like configuring an ad system. The creator works with visible episode elements and approves them in context.

## Template Reuse

Recurring sponsor rules can be saved to a show template, but episode-specific approvals should remain tied to the current episode.

## Maintainer Acceptance Notes

Accept work that helps creators place sponsor visuals and disclosures tastefully in long-form podcast episodes. Close work that adds generic ad-tech workflow, hides sponsor conflicts until export, or makes sponsorship mandatory for all shows.
