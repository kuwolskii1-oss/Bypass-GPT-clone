/**
 * Heuristic AI-writing detector. Deterministic, dependency-free, and fast
 * enough to run on every keystroke if needed.
 *
 * It measures the statistical fingerprints language models tend to leave
 * behind (uniform rhythm, formulaic transitions, stock phrases, no
 * contractions, no first person) and the small irregularities people write
 * with, then combines them into a document score and a per-sentence score.
 */
import { estimateDetectors } from "./detectors";
import {
  AI_PHRASES,
  CASUAL_MARKER_RE,
  CONTRACTION_DETECT,
  FIRST_PERSON_RE,
  NOT_ONLY_RE,
  findOpener,
} from "./lexicon";
import {
  countSyllables,
  findHiddenCharacters,
  fleschKincaidGrade,
  lin,
  mean,
  sigmoid,
  splitParagraphs,
  splitSentences,
  stdDev,
  tokenizeWords,
  type TextSpan,
} from "./text";
import {
  LIMITS,
  type DetectionResult,
  type SentenceScore,
  type TextFlag,
  type TextMetrics,
  type Verdict,
} from "./types";

const TRIPLET_RE = /\b[\p{L}-]+,\s+[\p{L}-]+,?\s+(?:and|or)\s+[\p{L}-]+\b/giu;
const NUMBER_RE = /\b\d[\d,.:%]*\b/g;
const LOWER_I_RE = /(^|\s)i(?=\s|'|’)/g;
const PAREN_RE = /\([^)]{3,}\)|\s[—–]\s|\s-\s/g;
const PUNCT_KINDS: RegExp[] = [/\?/, /!/, /;/, /:/, /[—–]/, /\(/, /["“”]/, /['’](?![a-z])/];
const MIN_SENTENCE_WORDS = 4;

function countMatches(text: string, re: RegExp): number {
  re.lastIndex = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    n++;
    if (m[0].length === 0) re.lastIndex++;
  }
  re.lastIndex = 0;
  return n;
}

/** Moving-average type/token ratio (window 50), 0..1. Shown as "Vocabulary"; not used for scoring. */
function lexicalDiversity(tokens: string[]): number {
  const w = 50;
  if (tokens.length === 0) return 0;
  if (tokens.length <= w) return new Set(tokens).size / tokens.length;
  const counts = new Map<string, number>();
  let types = 0;
  let sum = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const c = counts.get(t) ?? 0;
    if (c === 0) types++;
    counts.set(t, c + 1);
    if (i >= w) {
      const out = tokens[i - w];
      const oc = counts.get(out) ?? 0;
      if (oc === 1) types--;
      counts.set(out, oc - 1);
    }
    if (i >= w - 1) sum += types / w;
  }
  return sum / (tokens.length - w + 1);
}

interface PhraseHit {
  label: string;
  weight: number;
}

function phraseHits(text: string): PhraseHit[] {
  const hits: PhraseHit[] = [];
  for (const p of AI_PHRASES) {
    const n = countMatches(text, p.pattern);
    for (let i = 0; i < n; i++) hits.push({ label: p.label, weight: p.weight });
  }
  return hits;
}

function emptyMetrics(characters: number): TextMetrics {
  return {
    words: 0,
    sentences: 0,
    paragraphs: 0,
    characters,
    avgSentenceLength: 0,
    sentenceLengthStdDev: 0,
    burstiness: 0,
    lexicalDiversity: 0,
    avgWordLength: 0,
    contractionRate: 0,
    transitionRate: 0,
    aiPhraseHits: 0,
    aiPhraseDensity: 0,
    firstPersonRate: 0,
    readingGrade: 0,
    punctuationVariety: 0,
  };
}

function verdictFor(score: number, lo = 0.35, hi = 0.65): Verdict {
  return score < lo ? "human" : score < hi ? "mixed" : "ai";
}

function buildFlags(text: string, tooShort: boolean): TextFlag[] {
  const hidden = findHiddenCharacters(text);
  const flags: TextFlag[] = [];
  if (hidden.zeroWidth + hidden.softHyphens > 0) {
    flags.push({
      id: "hidden-characters",
      label: "Hidden characters",
      description: "Zero-width or invisible characters were found. They are sometimes used to confuse detectors.",
      count: hidden.zeroWidth + hidden.softHyphens,
    });
  }
  if (hidden.homoglyphs > 0) {
    flags.push({
      id: "homoglyphs",
      label: "Replaced characters",
      description: "Letters from another alphabet that look like Latin letters were mixed into words.",
      count: hidden.homoglyphs,
    });
  }
  if (hidden.irregularSpacing > 0) {
    flags.push({
      id: "irregular-spacing",
      label: "Irregular spacing",
      description: "Unusual space characters or repeated spaces were found.",
      count: hidden.irregularSpacing,
    });
  }
  if (tooShort) {
    flags.push({
      id: "very-short",
      label: "Very short text",
      description: `Fewer than ${LIMITS.minWords} words. Scores are low confidence.`,
    });
  }
  return flags;
}

/** Analyse a text and return a full detection result. Never throws. */
export function detectText(text: string): DetectionResult {
  const spans = splitSentences(text);
  const allTokens = tokenizeWords(text);
  const words = allTokens.length;
  const tooShort = words < LIMITS.minWords;

  if (words === 0) {
    const metrics = emptyMetrics(text.length);
    return {
      aiProbability: 0,
      humanProbability: 100,
      verdict: "human",
      confidence: "low",
      sentences: [],
      breakdown: { human: 0, mixed: 0, ai: 0 },
      detectors: estimateDetectors(text, { aiProbability: 0, metrics, sentences: [] }),
      metrics,
      flags: buildFlags(text, true),
      tooShort: true,
    };
  }

  // ---- Document-level features -------------------------------------------
  const sentenceTokens = spans.map((s) => tokenizeWords(s.text));
  const qualifying: { span: TextSpan; tokens: string[] }[] = [];
  spans.forEach((span, i) => {
    if (sentenceTokens[i].length >= MIN_SENTENCE_WORDS) qualifying.push({ span, tokens: sentenceTokens[i] });
  });
  const lengths = qualifying.map((q) => q.tokens.length);
  const avgLen = mean(lengths);
  const sd = stdDev(lengths);
  const burstiness = avgLen > 0 ? sd / avgLen : 0;

  const paragraphs = splitParagraphs(text);
  const paraLengths = paragraphs.map((p) => tokenizeWords(p).length).filter((n) => n > 0);
  const paraCv = paraLengths.length >= 3 ? stdDev(paraLengths) / Math.max(1, mean(paraLengths)) : null;

  const lower = allTokens.map((t) => t.toLowerCase());
  const diversity = lexicalDiversity(lower);
  const avgWordLength = mean(allTokens.map((t) => t.length));
  const contractions = countMatches(text, CONTRACTION_DETECT);
  const contractionRate = (contractions / words) * 100;
  const firstPerson = countMatches(text, FIRST_PERSON_RE);
  const firstPersonRate = (firstPerson / words) * 100;
  const casual = countMatches(text, CASUAL_MARKER_RE);
  const openers = qualifying.filter((q) => findOpener(q.span.text)).length;
  const transitionRate = qualifying.length > 0 ? openers / qualifying.length : 0;
  const docHits = phraseHits(text);
  const weightedHits = docHits.reduce((s, h) => s + h.weight, 0);
  const aiPhraseDensity = (weightedHits / words) * 100;
  const triplets = countMatches(text, TRIPLET_RE);
  const tripletRate = qualifying.length > 0 ? triplets / qualifying.length : 0;
  const notOnly = countMatches(text, NOT_ONLY_RE);
  const numbers = countMatches(text, NUMBER_RE);
  const numberRate = (numbers / words) * 100;
  const lowerI = countMatches(text, LOWER_I_RE);
  const questions = spans.filter((s) => /\?["”')]*$/.test(s.text.trim())).length;
  const exclaims = spans.filter((s) => /!["”')]*$/.test(s.text.trim())).length;
  const asides = countMatches(text, PAREN_RE);
  const syllables = allTokens.reduce((s, t) => s + countSyllables(t), 0);
  const readingGrade = fleschKincaidGrade(words, Math.max(1, qualifying.length), syllables);
  const punctuationVariety = PUNCT_KINDS.filter((re) => re.test(text)).length;

  let z = 0;
  z += 2.6 * (1 - lin(burstiness, 0.2, 0.75)) - 1.3;
  z += 2.6 * lin(transitionRate, 0.05, 0.4);
  z += 2.8 * lin(aiPhraseDensity, 0.5, 6);
  z -= 1.8 * lin(contractionRate, 0, 2.5);
  z -= 1.4 * lin(firstPersonRate, 0.5, 5);
  z -= 1.2 * lin(casual, 0, 3);
  z -= 0.5 * lin(questions + exclaims, 0, 2);
  z -= 0.4 * lin(asides, 0, 2);
  z += 1.0 * lin(avgWordLength, 4.6, 5.8) - 0.3;
  z += 0.5 * lin(tripletRate, 0.05, 0.3);
  z += 0.6 * Math.min(notOnly, 2) / 2;
  z -= 0.6 * lin(numberRate, 0.5, 3);
  if (paraCv !== null) z += 0.7 * (1 - lin(paraCv, 0.15, 0.6)) - 0.35;
  z -= 0.8 * lin(lowerI, 0, 2);
  z += 0.5 * lin(avgLen, 14, 24) - 0.25;
  z -= 1.6;
  const docProb = sigmoid(z);

  // ---- Sentence-level scores ----------------------------------------------
  const sentences: SentenceScore[] = [];
  spans.forEach((span, i) => {
    const tokens = sentenceTokens[i];
    if (tokens.length === 0) return;
    const s = span.text;
    const signals: string[] = [];
    let l = 0;

    const hits = phraseHits(s);
    if (hits.length > 0) {
      const w = Math.min(3, hits.reduce((a, h) => a + h.weight, 0));
      l += 0.9 * w;
      const labels = Array.from(new Set(hits.map((h) => h.label))).slice(0, 3);
      signals.push(`AI phrase: ${labels.join(", ")}`);
    }
    const opener = findOpener(s);
    if (opener) {
      l += 0.6 * opener.tier;
      if (opener.tier >= 2) signals.push(`Opens with “${opener.word}”`);
    }
    const hasContraction = CONTRACTION_DETECT.test(s);
    CONTRACTION_DETECT.lastIndex = 0;
    if (hasContraction) l -= 0.9;
    else if (tokens.length >= 8) {
      l += 0.35;
      if (tokens.length >= 16) signals.push("No contractions");
    }
    const fp = countMatches(s, FIRST_PERSON_RE);
    if (fp > 0) l -= 0.8;
    const cas = countMatches(s, CASUAL_MARKER_RE);
    if (cas > 0) l -= 1.0;
    if (/[?!]["”')]*$/.test(s.trim())) l -= 0.6;
    if (countMatches(s, PAREN_RE) > 0) l -= 0.3;
    if (avgLen > 12 && tokens.length >= MIN_SENTENCE_WORDS) {
      const dev = Math.abs(tokens.length - avgLen) / avgLen;
      if (dev < 0.2 && burstiness < 0.4) {
        l += 0.3;
        signals.push("Uniform length");
      }
    }
    if (tokens.length < 6) l -= 0.4;
    if (tokens.length < MIN_SENTENCE_WORDS) l -= 0.5;
    if (countMatches(s, TRIPLET_RE) > 0) {
      l += 0.5;
      signals.push("Three-item list");
    }
    if (countMatches(s, NOT_ONLY_RE) > 0) {
      l += 0.5;
      signals.push("“Not only … but also”");
    }
    if (countMatches(s, NUMBER_RE) > 0) l -= 0.3;

    const score = sigmoid(0.55 * z + 0.45 * l);
    sentences.push({
      index: sentences.length,
      text: span.text,
      start: span.start,
      end: span.end,
      score: Math.round(score * 1000) / 1000,
      verdict: verdictFor(score),
      signals,
    });
  });

  const totalWeight = sentences.reduce((a, s) => a + tokenizeWords(s.text).length, 0) || 1;
  const sentenceMean = sentences.reduce((a, s) => a + s.score * tokenizeWords(s.text).length, 0) / totalWeight;

  let prob = 100 * (0.7 * docProb + 0.3 * sentenceMean);
  if (tooShort) prob = 50 + (prob - 50) * 0.4;
  const aiProbability = Math.max(0, Math.min(100, Math.round(prob)));

  const breakdown = { human: 0, mixed: 0, ai: 0 };
  for (const s of sentences) breakdown[s.verdict]++;

  const metrics: TextMetrics = {
    words,
    sentences: qualifying.length,
    paragraphs: paragraphs.length,
    characters: text.length,
    avgSentenceLength: Math.round(avgLen * 10) / 10,
    sentenceLengthStdDev: Math.round(sd * 10) / 10,
    burstiness: Math.round(burstiness * 100) / 100,
    lexicalDiversity: Math.round(diversity * 100) / 100,
    avgWordLength: Math.round(avgWordLength * 100) / 100,
    contractionRate: Math.round(contractionRate * 10) / 10,
    transitionRate: Math.round(transitionRate * 100) / 100,
    aiPhraseHits: docHits.length,
    aiPhraseDensity: Math.round(aiPhraseDensity * 10) / 10,
    firstPersonRate: Math.round(firstPersonRate * 10) / 10,
    readingGrade: Math.round(readingGrade * 10) / 10,
    punctuationVariety,
  };

  const confidence: DetectionResult["confidence"] = tooShort || words < 60 ? "low" : words < 200 ? "medium" : "high";

  return {
    aiProbability,
    humanProbability: 100 - aiProbability,
    verdict: verdictFor(aiProbability / 100),
    confidence,
    sentences,
    breakdown,
    detectors: estimateDetectors(text, { aiProbability, metrics, sentences }),
    metrics,
    flags: buildFlags(text, tooShort),
    tooShort,
  };
}
