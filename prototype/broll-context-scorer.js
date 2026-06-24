"use strict";

// Scores a transcript segment's context strength on three dimensions:
// pronouns (grounded voice), known speaker name density, and metric
// density (numbers, percentages, version strings).
//
// A score below WEAK_THRESHOLD means the moment lacks enough specificity
// to appear on screen without confirmation; the B-roll surface routes
// these moments to social context intake.

const WEAK_THRESHOLD = 0.2;

function scoreMomentContext(transcript, options) {
  const speakerNames = (options && options.speakerNames) || [];
  const raw = transcript || "";
  const lower = raw.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  if (!words.length) {
    return { score: 0, strength: "weak" };
  }

  let score = 0;

  // Personal pronouns indicate a grounded first-person claim rather than
  // a vague third-party reference.
  const pronouns = (lower.match(/\b(i|we|my|our|me|us)\b/g) || []).length;
  score += Math.min(pronouns / words.length, 0.3);

  // Known speaker names (weighted double) are the strongest signal — a
  // moment grounded in a named person is far less likely to be noise.
  const nameHits = speakerNames.reduce(function (n, name) {
    const safe = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return n + ((lower.match(new RegExp("\\b" + safe + "\\b", "g")) || []).length);
  }, 0);
  score += Math.min((nameHits * 2) / words.length, 0.3);

  // Numbers, percentages, and version strings anchor moments to measurable
  // claims rather than generic filler.
  const metrics = (lower.match(/\b(v\d[\d.]*|\d[\d,.]*%?)\b/g) || []).length;
  score += Math.min(metrics / words.length, 0.4);

  const finalScore = parseFloat(Math.min(score, 1).toFixed(3));
  return {
    score: finalScore,
    strength: finalScore >= WEAK_THRESHOLD ? "strong" : "weak",
  };
}

if (typeof module !== "undefined") {
  module.exports = { scoreMomentContext, WEAK_THRESHOLD };
}
