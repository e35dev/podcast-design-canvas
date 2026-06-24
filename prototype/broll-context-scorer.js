"use strict";

// Weak-context moment scoring engine (#757).
//
// The B-roll review surface used to flag "weak context" with a static source stub. This
// engine reads the text of each moment (a transcript-derived segment) and rates its
// context strength from three signals, so the weak-context flag — and the reason shown
// to the creator — is computed rather than hard-coded:
//
//   1. speaker-reference density — does the moment ground itself in who is speaking
//      or being referred to (host, guest, names)?
//   2. topic specificity — concrete subject matter vs. vague filler ("something", "stuff").
//   3. named-entity presence — a proper noun (product, company, person) to anchor b-roll.
//
// A moment scoring below THRESHOLD is "weak context" and carries the single weakest
// signal as its reason, so routing to social context intake can explain *why*.

(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.BrollContextScorer = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const THRESHOLD = 0.5;

  // Pronouns / role words that reference a speaker or participant.
  const SPEAKER_REFERENCES = new Set([
    "host", "hosts", "guest", "guests", "co-host", "cohost", "caller", "panel",
    "they", "he", "she", "we", "i", "you", "their", "our",
  ]);

  // Vague filler that signals low topic specificity.
  const VAGUE_TERMS = new Set([
    "thing", "things", "stuff", "something", "someone", "anything", "everything",
    "topic", "moment", "part", "kind", "sort", "whatever", "etc",
  ]);

  const REASONS = {
    reference: "few speaker references",
    specificity: "a vague topic with no clear subject",
    entity: "no named person, product, or place",
  };

  function words(text) {
    return String(text == null ? "" : text)
      .toLowerCase()
      .match(/[a-z][a-z'-]*/g) || [];
  }

  // Count capitalized multi-letter tokens that are not the first word of the text — a
  // light proxy for proper nouns (named entities) without a full NER model.
  function namedEntityCount(text) {
    const raw = String(text == null ? "" : text).trim().split(/\s+/);
    let count = 0;
    raw.forEach((token, index) => {
      if (index === 0) {
        return;
      }
      if (/^[A-Z][A-Za-z][A-Za-z'-]*$/.test(token)) {
        count += 1;
      }
    });
    return count;
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  // Score a single moment. Returns the overall context strength (0..1), the three
  // component signals, whether it is weak, and the reason (weakest signal) when weak.
  function scoreMoment(moment) {
    const text = moment && (moment.reason || moment.text || "");
    const toks = words(text);
    const length = Math.max(toks.length, 1);

    const speakerRefs = toks.filter((t) => SPEAKER_REFERENCES.has(t)).length;
    const vague = toks.filter((t) => VAGUE_TERMS.has(t)).length;
    const entities = namedEntityCount(text);

    const referenceDensity = clamp01(speakerRefs / 2);
    const topicSpecificity = clamp01(1 - vague / Math.max(length / 3, 1));
    const entityPresence = entities > 0 ? 1 : 0;

    const signals = {
      reference: referenceDensity,
      specificity: topicSpecificity,
      entity: entityPresence,
    };

    const score = clamp01(
      referenceDensity * 0.3 + topicSpecificity * 0.4 + entityPresence * 0.3,
    );
    const weak = score < THRESHOLD;

    let reason = null;
    if (weak) {
      // The single weakest signal explains the routing.
      const weakest = Object.keys(signals).sort((a, b) => signals[a] - signals[b])[0];
      reason = REASONS[weakest];
    }

    return { score, weak, reason, signals };
  }

  // Classify a list of moments, attaching score/weak/reason to each.
  function classifyMoments(moments) {
    return (moments || []).map((moment) => ({ ...moment, ...scoreMoment(moment) }));
  }

  // Flag back-to-back title-card moments (a repeat) so a route to the title cards screen
  // can dedupe them. A moment is a repeat when the immediately preceding moment is also a
  // title card.
  function detectRepeatTitles(moments) {
    return (moments || []).map((moment, index) => {
      const previous = index > 0 ? moments[index - 1] : null;
      const repeat =
        moment.type === "title" && !!previous && previous.type === "title";
      return { ...moment, repeatTitle: repeat };
    });
  }

  return {
    THRESHOLD,
    REASONS,
    scoreMoment,
    classifyMoments,
    detectRepeatTitles,
  };
});
