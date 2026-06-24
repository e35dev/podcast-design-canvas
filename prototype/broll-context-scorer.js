"use strict";

(function (global) {
  const topicWords = new Set([
    "launch",
    "product",
    "demo",
    "company",
    "customer",
    "feature",
    "workflow",
    "episode",
    "segment",
    "case",
    "study",
  ]);

  function words(text) {
    return String(text || "").match(/[A-Za-z][A-Za-z'-]*/g) || [];
  }

  function namedEntities(text) {
    const seen = new Set();
    return words(text)
      .filter((word) => /^[A-Z][a-z]+/.test(word))
      .filter((word) => !["Host", "Guest", "The", "This", "That"].includes(word))
      .filter((word) => {
        if (seen.has(word)) {
          return false;
        }
        seen.add(word);
        return true;
      });
  }

  function scoreContext(text) {
    const allWords = words(text);
    const lower = allWords.map((word) => word.toLowerCase());
    const entities = namedEntities(text);
    const topicHits = lower.filter((word) => topicWords.has(word)).length;
    const speakerRefs = lower.filter((word) => word === "host" || word === "guest" || word === "speaker").length;
    const score = Math.min(100, topicHits * 18 + entities.length * 16 + speakerRefs * 10);
    const weak = score < 42;
    const reason = weak
      ? "Add a clearer speaker, topic, or named reference before showing this visual."
      : "Enough speaker, topic, or named context is present for the visual suggestion.";
    return {
      score,
      weak,
      reason,
      entities,
      topicHits,
      speakerRefs,
    };
  }

  function annotateMoments(moments, transcriptById) {
    return (moments || []).map((moment) => {
      const context = scoreContext(transcriptById && transcriptById[moment.id]);
      return Object.assign({}, moment, {
        contextScore: context.score,
        contextWeak: context.weak,
        contextReason: context.reason,
      });
    });
  }

  function socialContextHref(moment) {
    const params = new URLSearchParams();
    params.set("moment", moment.timecode || moment.id || "");
    params.set("reason", moment.contextReason || "Add clearer context for this visual moment.");
    return `social-context-intake.html?${params.toString()}`;
  }

  const api = { annotateMoments, scoreContext, socialContextHref };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    return;
  }

  global.PodcastBrollContextScorer = api;
}(typeof window !== "undefined" ? window : globalThis));
