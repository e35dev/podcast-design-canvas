# Caption Line Readability

Captions should break into lines a viewer can read at a glance and hold each line long enough to finish it, so an hour-plus episode stays comfortable to follow.

## User Goal

A creator should be able to make captions read cleanly — sensible line breaks, a calm number of words on screen, and enough time to read each line — without editing a raw transcript or learning subtitle timing tools.

## Relationship To Caption Style And Readability

How captions are split and paced is a distinct concern from how they look or whether they are accurate. Each neighbor keeps its own job:

- caption size, placement zone, emphasis, and motion mode from `docs/audio-caption-quality-review.md` Caption Style Presets
- wording accuracy and confident spellings from `docs/audio-caption-quality-review.md` Caption Confidence and `docs/transcript-glossary.md`
- contrast, size, and face-overlap flags from `docs/accessibility-readability-checks.md` Checks
- safe placement against lower-thirds from `docs/layout-safe-areas.md` Checks

Style review flags a long line as a problem; this spec owns the control that actually fixes how lines break and how long each one holds.

## What Gets Flagged

Surface lines that are hard to read in motion:

- a line with too many words to read before it changes
- a break that splits a name, number, or phrase awkwardly
- captions that change faster than a viewer can read
- a single word left dangling on its own line
- a line that lingers far longer than the speech it covers

Each flag should explain the reading problem in plain language and offer a direct fix.

## Readability Choices

Use plain-language choices, not subtitle timecodes or per-frame controls:

- comfortable, standard, or dense lines on screen at once
- shorter or longer hold per line for slower or faster reading
- break lines at natural phrase boundaries rather than mid-thought
- keep names, numbers, and show terms whole on one line

Choices should start from the chosen preset and preview on the episode's real caption lines, played at speaking speed rather than on a frozen frame.

## Review States

Use simple, creator-facing states that surface in caption review as a quiet note, not a blocking queue:

- reads cleanly — line length and hold are comfortable for this stretch
- adjust this moment — a specific line breaks or times poorly; link to the fix
- apply across episode — carry a calmer line-length or reading-speed choice to the whole episode
- kept as is — the creator accepted the current breaks on purpose

Issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Readability Warnings rather than as a separate queue, and should not block export unless a line is genuinely unreadable at the destination.

## Creator Controls

Offer simple actions:

- choose a comfortable line density for the episode
- lengthen or shorten how long lines hold
- rebreak a single awkward line at a natural phrase point
- keep a name or number whole on one line
- apply a calmer choice across the episode or scope it to one moment
- save the preferred line behavior to the show template through `docs/show-template-adaptation.md`

Avoid exposing subtitle timecodes, per-frame timing handles, or a raw transcript editor in the default path. Wording fixes belong in caption confidence review, not here.

## Maintainer Acceptance Notes

Accept work that makes captions break and pace comfortably for long-form viewing as plain-language creator choices previewed at speaking speed. Close work that duplicates caption styling, wording, or contrast review owned elsewhere, exposes subtitle timecode editing, or turns line readability into a raw transcript tool.
