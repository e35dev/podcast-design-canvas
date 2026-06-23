# Start From Previous Episode

A recurring show should be able to start a new episode from the last one, keeping its look and structure while swapping in new recordings.

## User Goal

A creator producing a series should be able to begin a new episode pre-filled from a recent episode of the same show, then replace the speakers, topic, and media without rebuilding the design.

## What Carries Forward

Starting from a previous episode should bring over the reusable parts of that episode:

- layout, preset style, and pacing
- brand kit and on-screen identity
- segment order and recurring title moments
- recurring host roles and lower-third styling
- sponsor placement rules
- export destination defaults

It should not carry forward the previous episode's guests, topic, recordings, or one-off moments unless the creator keeps them on purpose.

## Difference From Templates

A saved show template in `docs/show-template-adaptation.md` is the durable, curated identity for a show. Starting from a previous episode is a faster convenience that clones a specific recent episode as a draft. When the creator wants the change to stick for every future episode, they should save it back to the template rather than only into the next clone.

## Creator Controls

The creator should be able to:

- start a new episode from a recent episode of the same show
- choose what carries over before the new episode opens
- clear the previous guests and topic while keeping the design
- import the new recordings into the existing speaker buckets
- save any refinements back to the show template for future episodes

## Boundaries

Starting from a previous episode should stay a draft starting point, not a link to the finished episode. Editing the new episode must never change the already exported episode it started from.

## Maintainer Acceptance Notes

Accept work that makes recurring episodes faster to start while keeping each episode distinct. Close work that copies guests or recordings across episodes by default, links a new episode back to a finished export, or duplicates the saved-template workflow.
