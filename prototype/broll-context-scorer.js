"use strict";

// Weak-context moment scoring engine for the contextual b-roll review surface (#757,
// build target #583, label: contextual-visuals).
//
// The b-roll review screen previously flagged "weak context" with a single static
// boolean on the suggestion source. This module replaces that stub with a real,
// transcript-driven score so the screen can explain WHY a moment is weak and hand a
// structured payload to social context intake.
//
// Pure and dependency-free. Dual CommonJS + browser-global module so the page can
// load it with a plain <script src> and the test can require() it directly. No DOM,
// no network, no timers.
(function (root) {
  // Generic conversational filler that carries no specific visual context on its own.
  // A moment built mostly from these words has low topic specificity.
  const STOPWORDS = new Set([
    "a", "an", "the", "and", "or", "but", "so", "then", "well", "yeah", "yes", "no",
    "um", "uh", "like", "just", "really", "kind", "sort", "of", "to", "in", "on",
    "at", "for", "with", "about", "that", "this", "these", "those", "it", "its",
    "i", "you", "we", "they", "he", "she", "them", "us", "is", "am", "are", "was",
    "were", "be", "been", "being", "do", "does", "did", "have", "has", "had", "will",
    "would", "can", "could", "should", "thing", "things", "stuff", "anyway", "okay",
    "ok", "right", "mean", "know", "going", "gonna", "want", "get", "got", "as", "if",
    "what", "when", "where", "how", "why", "there", "here", "now", "up", "out", "back",
  ]);

  function clamp01(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(1, value));
  }

  function round2(value) {
    return Math.round(clamp01(value) * 100) / 100;
  }

  // Split into word tokens, preserving original case so entity detection can see
  // capitalization. Apostrophes are kept inside words (e.g. "we're").
  function tokenize(text) {
    return String(text || "")
      .split(/[^A-Za-z0-9'’:.-]+/)
      .map((token) => token.replace(/^[.'’:-]+|[.'’:-]+$/g, ""))
      .filter(Boolean);
  }

  function isStopword(token) {
    return STOPWORDS.has(token.toLowerCase());
  }

  // Named-entity presence: proper nouns and product-like tokens are the strongest
  // signal that a moment refers to something concrete enough to visualize. We count
  //  - capitalized tokens that are NOT the first word of a sentence (real proper nouns,
  //    not just sentence-start capitalization), and
  //  - tokens with internal capitals or digits (Helio, re:Invent, GPT-4, iOS).
  function namedEntityScore(text) {
    const tokens = tokenize(text);
    if (!tokens.length) {
      return 0;
    }
    // Track sentence-start positions so a leading capital does not count as an entity.
    const sentenceStart = new Set([0]);
    const raw = String(text || "");
    let sawTerminator = false;
    let cursor = 0;
    const starts = [];
    raw.split(/\s+/).forEach((word) => {
      if (sawTerminator) {
        starts.push(cursor);
        sawTerminator = false;
      }
      if (/[.!?]$/.test(word)) {
        sawTerminator = true;
      }
      cursor += 1;
    });
    starts.forEach((index) => sentenceStart.add(index));

    let entities = 0;
    tokens.forEach((token, index) => {
      const internalCapOrDigit = /[A-Za-z][A-Z]/.test(token) || /[A-Za-z]+\d|\d+[A-Za-z]/.test(token) || token.includes(":");
      const leadingCap = /^[A-Z][a-z'’.-]+$/.test(token);
      if (internalCapOrDigit) {
        entities += 1;
      } else if (leadingCap && !sentenceStart.has(index) && !isStopword(token)) {
        entities += 1;
      }
    });
    // Two distinct entities already make a moment clearly groundable.
    return clamp01(entities / 2);
  }

  // Topic specificity: the share of content words (non-stopword, length >= 4) among all
  // tokens. A line that is mostly filler scores low; a line dense with specific nouns
  // scores high.
  function topicSpecificity(text) {
    const tokens = tokenize(text);
    if (!tokens.length) {
      return 0;
    }
    const content = tokens.filter((token) => !isStopword(token) && token.replace(/[^A-Za-z0-9]/g, "").length >= 4);
    return clamp01(content.length / tokens.length / 0.5);
  }

  // Speaker-reference density: how often a known speaker name or handle is referenced in
  // the moment. Only applied when the caller supplies references (e.g. approved social
  // handles); otherwise it is excluded from the score rather than dragging it down.
  function referenceDensity(text, references) {
    const list = (references || []).map((r) => String(r || "").replace(/^@/, "").toLowerCase()).filter(Boolean);
    if (!list.length) {
      return 0;
    }
    const haystack = String(text || "").toLowerCase();
    const hits = list.filter((name) => name && haystack.includes(name)).length;
    return clamp01(hits / Math.min(list.length, 2));
  }

  const WEAK_THRESHOLD = 0.4;
  const STRONG_THRESHOLD = 0.7;

  function classifyConfidence(score) {
    if (score >= STRONG_THRESHOLD) {
      return "strong";
    }
    if (score >= WEAK_THRESHOLD) {
      return "medium";
    }
    return "weak";
  }

  // Pick the human-facing reason a moment reads as weak/medium context: name the
  // signal(s) that are missing, so the b-roll screen can show a specific label rather
  // than a generic "low confidence" string.
  function weakReason(signals) {
    const missing = [];
    if ((signals.namedEntityPresence || 0) < 0.5) {
      missing.push("no clear names or brands");
    }
    if ((signals.topicSpecificity || 0) < 0.5) {
      missing.push("no specific topic");
    }
    if ("referenceDensity" in signals && (signals.referenceDensity || 0) <= 0) {
      missing.push("no approved speaker reference");
    }
    if (!missing.length) {
      return "context is borderline";
    }
    return missing.join(", ");
  }

  // Score one moment's transcript on the three context-strength signals and return a
  // structured result the UI can route on. When references are supplied the reference
  // signal is included and weighted; otherwise the score is the renormalized blend of
  // entity presence and topic specificity.
  function scoreMoment(moment, options) {
    const text = (moment && moment.transcript) || "";
    const references = (options && options.references) || [];

    const signals = {
      namedEntityPresence: round2(namedEntityScore(text)),
      topicSpecificity: round2(topicSpecificity(text)),
    };
    let weights = { namedEntityPresence: 0.5, topicSpecificity: 0.3 };
    if (references.length) {
      signals.referenceDensity = round2(referenceDensity(text, references));
      weights = { namedEntityPresence: 0.45, topicSpecificity: 0.25, referenceDensity: 0.3 };
    }

    let weighted = 0;
    let total = 0;
    Object.keys(weights).forEach((key) => {
      weighted += signals[key] * weights[key];
      total += weights[key];
    });
    const score = total ? round2(weighted / total) : 0;
    const confidence = classifyConfidence(score);
    return {
      score,
      confidence,
      isWeak: confidence === "weak",
      signals,
      reason: confidence === "strong" ? null : weakReason(signals),
    };
  }

  // Back-to-back title-card repeat detection (#757 acceptance #4). Flags each title
  // moment whose immediately-preceding moment is also a title card, so the screen can
  // route the repeat to the title-cards screen before it ships two cards in a row.
  function detectTitleRepeats(moments) {
    const list = Array.isArray(moments) ? moments : [];
    return list.map((moment, index) => {
      if (index === 0 || !moment || moment.type !== "title") {
        return false;
      }
      const prev = list[index - 1];
      return Boolean(prev) && prev.type === "title";
    });
  }

  // Structured hand-off payload to social context intake (#757 acceptance #3): the
  // moment timestamp and the weak-context reason, so intake can pre-populate.
  function buildIntakePayload(moment, scored) {
    return {
      at: (moment && moment.at) || "",
      reason: (scored && scored.reason) || (moment && moment.reason) || "",
      moment: (moment && moment.id) || "",
    };
  }

  // Encode the payload as a query string for the intake screen link. Uses
  // URLSearchParams so values are escaped; only non-empty fields are included, plus a
  // fixed from=broll marker the intake screen keys on.
  function encodeIntakeQuery(payload) {
    const params = new URLSearchParams();
    if (payload && payload.at) {
      params.set("at", payload.at);
    }
    if (payload && payload.reason) {
      params.set("reason", payload.reason);
    }
    if (payload && payload.moment) {
      params.set("moment", payload.moment);
    }
    params.set("from", "broll");
    return params.toString();
  }

  // Parse an intake query string back into a payload (used by social-context-intake).
  function parseIntakeQuery(search) {
    const params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
    return {
      at: params.get("at") || "",
      reason: params.get("reason") || "",
      moment: params.get("moment") || "",
      from: params.get("from") || "",
    };
  }

  const api = {
    WEAK_THRESHOLD,
    STRONG_THRESHOLD,
    tokenize,
    namedEntityScore,
    topicSpecificity,
    referenceDensity,
    classifyConfidence,
    scoreMoment,
    detectTitleRepeats,
    buildIntakePayload,
    encodeIntakeQuery,
    parseIntakeQuery,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.BrollContextScorer = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
