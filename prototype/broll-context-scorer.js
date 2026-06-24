"use strict";

(function publishContextScorer(root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
    return;
  }
  root.BrollContextScorer = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function createContextScorer() {
  const STOP_WORDS = new Set([
    "about",
    "again",
    "also",
    "because",
    "before",
    "during",
    "from",
    "have",
    "just",
    "like",
    "that",
    "their",
    "then",
    "there",
    "thing",
    "this",
    "with",
    "would",
  ]);
  const DEFAULT_SPEAKERS = ["host", "guest", "speaker", "dana", "marcus", "priya"];
  const WEAK_THRESHOLD = 7;

  function textFor(segment) {
    return [segment?.speaker, segment?.summary, segment?.transcript, segment?.text]
      .filter((part) => typeof part === "string" && part.trim())
      .join(" ");
  }

  function wordTokens(text) {
    return (text || "").toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
  }

  function speakerReferenceCount(text, speakers = DEFAULT_SPEAKERS) {
    const haystack = ` ${String(text || "").toLowerCase()} `;
    return speakers.filter((speaker) => haystack.includes(` ${speaker.toLowerCase()} `)).length;
  }

  function topicTokenCount(text) {
    const unique = new Set(wordTokens(text).filter((word) => !STOP_WORDS.has(word)));
    return unique.size;
  }

  function namedEntityCount(text) {
    const matches = String(text || "").match(/\b[A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)?\b/g) || [];
    const unique = new Set(matches.filter((match) => !["Host", "Guest", "Speaker", "That"].includes(match)));
    return unique.size;
  }

  function scoreSegment(segment, options = {}) {
    const text = textFor(segment);
    const speakerRefs = speakerReferenceCount(text, options.speakers);
    const topicSpecificity = Math.min(5, topicTokenCount(text));
    const namedEntities = Math.min(3, namedEntityCount(text));
    const score = speakerRefs * 2 + topicSpecificity + namedEntities * 2;
    const missing = [];

    if (speakerRefs === 0) missing.push("speaker reference");
    if (topicSpecificity < 3) missing.push("specific topic");
    if (namedEntities === 0) missing.push("named entity");

    return {
      score,
      weak: score < (options.threshold || WEAK_THRESHOLD),
      missing,
      label: missing.length ? `Needs ${missing.join(" and ")}` : "Context is specific enough",
    };
  }

  function momentFromSegment(segment, index, options = {}) {
    const context = scoreSegment(segment, options);
    const topic = segment.topic || segment.summary || `Moment ${index + 1}`;
    const type = segment.visualType || (segment.kind === "transition" ? "title" : context.weak ? "web" : "product");
    return {
      id: segment.id || `m${index + 1}`,
      timestamp: segment.timestamp || "",
      reason: topic,
      type,
      strength: segment.strength || "standard",
      source: context.weak ? "weak-transcript" : "transcript",
      decision: segment.decision || "suggested",
      contextScore: context.score,
      contextReason: context.label,
      weakReason: context.missing.join(",") || "context",
    };
  }

  function classifySegments(segments, options = {}) {
    return (Array.isArray(segments) ? segments : []).map((segment, index) =>
      momentFromSegment(segment, index, options),
    );
  }

  function isLive(moment) {
    return moment?.decision === "approved" || moment?.decision === "adjusted";
  }

  function titleRepeatFlags(moments) {
    return (Array.isArray(moments) ? moments : []).map((moment, index, list) => {
      if (!isLive(moment) || index === 0) return false;
      const previous = list[index - 1];
      return isLive(previous) && previous.type === "title" && moment.type === "title";
    });
  }

  function socialContextHref(moment) {
    const params = new URLSearchParams();
    if (moment?.timestamp) params.set("moment", moment.timestamp);
    if (moment?.weakReason) params.set("reason", moment.weakReason);
    const query = params.toString();
    return `social-context-intake.html${query ? `?${query}` : ""}`;
  }

  return {
    classifySegments,
    scoreSegment,
    socialContextHref,
    titleRepeatFlags,
  };
});
