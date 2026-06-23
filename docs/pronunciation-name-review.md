# Pronunciation And Name Review

Getting a guest's name right out loud matters as much as spelling it right on screen. The product should give creators a calm pass to confirm how names, brands, and recurring terms are pronounced before an episode publishes.

## User Goal

A creator should be able to review the names and terms that are easy to say wrong, confirm an approved pronunciation, and trust that intros, outros, and on-screen context respect how people want to be addressed.

## When This Applies

This is a spoken-accuracy pass, separate from how a word is written:

- a guest with a name that is easy to mispronounce
- a brand, product, or company said differently than it is spelled
- a recurring term or acronym the show says a particular way
- a host reading a guest introduction or outro credits aloud
- a name the creator wants to double-check before sending a review copy

Confirming a pronunciation should never silently rewrite what a speaker actually said.

## Pronunciation Sources

Suggested pronunciations can start from context the workspace already has:

- spelling notes and links from `docs/social-context-intake.md`
- approved spellings from `docs/transcript-glossary.md`
- a guest's own stated pronunciation from earlier in the episode
- reusable guest details from `docs/guest-profile-reuse.md`
- the creator's own recorded or typed pronunciation note

Suggestions are a starting point. The creator confirms the approved pronunciation before it is treated as trusted.

## Review Approach

Pronunciation review is confirm-in-context: creators hear the name at the real moment it is spoken and approve it there, rather than reading a phonetic table detached from the episode. A short plain-language note ("sounds like EYE-rin") is enough; the product should not require formal phonetic spelling.

## Creator Controls

Keep the controls creator-facing and tied to the people in the episode:

- confirm or correct a suggested pronunciation in plain language
- play the moment where a name is spoken to check it in context
- mark a name as the guest's own preferred pronunciation
- apply a confirmed pronunciation to repeated mentions across the episode
- save a pronunciation to the guest profile or show template for recurring people and terms

Avoid exposing phonetic alphabets, syllable timing grids, or voice-synthesis controls in the default path.

## Review States

The product should show pronunciation as a quiet readiness signal on the long-form review surface, surfaced as a calm badge rather than a blocking banner, with one status at a time:

- **confirmed** — the creator approved how the name or term is said and it is trusted for intros, outros, and review handoff
- **suggested** — a proposed pronunciation is shown with its source and not yet approved
- **needs review** — a name or term is easy to mispronounce or conflicts with an earlier mention, and the creator has not decided
- **guest preferred** — the pronunciation was set from the guest's own stated preference and should be respected across reuse
- **not spoken in episode** — the term appears only in text, so spoken review is not needed for this episode

Each state should describe what it means for the creator's confidence before publishing, and none of these states should block export on their own.

## Connections

Pronunciation review should reuse decisions the workspace already owns rather than redefining them:

- written spellings stay owned by `docs/transcript-glossary.md` (Glossary Entries, Application)
- names and links come from `docs/social-context-intake.md` (Accepted Inputs) and `docs/guest-profile-reuse.md` (Reusable Details)
- recurring people and terms carry forward through `docs/show-template-adaptation.md` (Template Contents)

A confirmed pronunciation should attach to the guest or term once and let these surfaces respect it, not be re-entered on every screen.

## Maintainer Acceptance Notes

Accept work that helps creators get spoken names and terms right before publishing a long-form episode. Close work that rewrites what a speaker actually said, exposes phonetic or voice-synthesis tooling to normal creators, duplicates written-spelling review owned by the glossary, or blocks export on whether a pronunciation was confirmed.
