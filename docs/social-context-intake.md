# Social Context Intake

The episode setup flow should use host and guest social links to improve the edit while keeping the experience respectful and obviously useful.

## User Goal

A creator should be able to add public links for the people in an episode and get better transcript spellings, on-screen names, b-roll suggestions, title moments, and reference handling without feeling like the product is doing unrelated background research.

## Accepted Inputs

Keep the input model lightweight:

- personal or show website
- X, LinkedIn, Instagram, YouTube, TikTok, or podcast profile
- company or project page
- optional spelling notes for names, brands, products, and recurring terms

Every link should attach to a speaker bucket from episode ingest. If a link cannot be matched to a speaker, ask the creator to assign it rather than silently applying it across the episode.

## Context Uses

Social context should improve visible episode quality in these areas:

- speaker display names, titles, handles, and lower-thirds
- proper noun spellings in transcripts and captions
- likely topic names, company names, and project references
- tasteful b-roll and visual callout candidates
- title moments that fit the speaker and show context

The product should show a short "used for" summary so creators understand why a link is being requested.

## Context Routing

Social context is an input, not an output surface. Each context use should flow to the spec that owns how it appears and gets approved, so corrections happen in one place per concern rather than on this intake screen:

| Context use | Owning spec | Relevant section |
| --- | --- | --- |
| display names, titles, handles, and lower-thirds | `docs/guest-profile-reuse.md` | Reusable Details, Matching |
| proper-noun spellings and recurring terms | `docs/transcript-glossary.md` | Glossary Entries, Application |
| caption accuracy review | `docs/audio-caption-quality-review.md` | Caption Confidence |
| b-roll and visual callout candidates | `docs/contextual-broll-moments.md` | Moment Sources, Approval Flow |
| title moments | `docs/contextual-title-cards.md` | Sources, Review States |

Intake should hand each link's derived suggestions to these specs already attached to the right speaker bucket, and let the owning review surface make the final visible decision. This screen should not become a second place to approve captions, b-roll, or titles.

## Privacy And Taste Boundaries

Do not surface unrelated personal details or sensitive inferred information. The product should use public context to make the episode more accurate and relevant, not to create a dossier on the guest.

Avoid attention-grabbing overlays that make a serious interview feel like a gossip feed. Contextual visuals should support the conversation and the show's identity.

## Review States

When generated context affects visible output, the creator should be able to review and correct it:

- approved spellings
- rejected b-roll suggestions
- pinned guest bio or title
- blocked topics or links that should not appear on screen

Corrections should persist into the reusable show template where appropriate, especially recurring host names, show brands, sponsor names, and common segment labels.

## Maintainer Acceptance Notes

Accept work that turns social links into better captions, titles, b-roll, lower-thirds, and reference accuracy. Close work that makes social context feel invasive, unrelated to the visible episode, or detached from speaker buckets.
