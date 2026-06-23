# Accessibility And Readability Checks

Accessibility checks should protect viewer clarity without making creators think like compliance specialists.

## User Goal

A creator should be able to catch captions, contrast, motion, and layout issues that make a podcast episode harder to watch or understand.

## Checks

Flag viewer-facing issues:

- captions have low contrast
- captions are too small
- captions cover speaker faces
- lower-thirds overlap captions
- sponsor marks reduce readability
- title cards move too quickly
- flashing or intense motion appears repeatedly
- important visual information has no text equivalent

Checks should explain the viewing problem and offer a direct fix.

Issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Readability Warnings.

## Preview Contexts

Review readability in:

- full-size desktop preview
- small mobile preview
- paused frame
- active speaking moment
- b-roll moment
- title card moment

Different preview contexts should use the same episode content so creators can judge real tradeoffs.

## Review States

Use simple creator-facing states:

- clear
- adjust this moment
- apply safer style across the episode
- blocks export for this destination

Each state should describe what a viewer would notice, such as "captions are readable on desktop but too small in the mobile preview."

## Creator Controls

Offer simple fixes:

- increase caption size
- move captions
- improve contrast
- reduce motion
- simplify overlay
- use alternate lower-third position
- apply fix across template

## Template Behavior

When a creator chooses a safer readability fix, they should be able to keep it scoped appropriately:

- only this moment
- this episode
- future episodes that use the same template

Applying a broader fix should preserve viewer clarity without forcing every episode into the same caption size, motion level, or overlay density when the current problem is local to one moment.

## Maintainer Acceptance Notes

Accept work that makes final episodes clearer and more watchable across captions, layouts, and visual moments. Close work that buries creators in formal compliance language or treats readability as unrelated to export quality.
