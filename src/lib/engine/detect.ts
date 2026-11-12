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
  QUOTE_RE,
  analyseStructure,
  countDashes,
  countDoublets,
  findContrasts,
  isHeadingLike,
  isSignpost,
  maskMarkup,
  maskMatches,
  participialTail,
} from "./style";
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
/** Parenthetical asides and typed " - " dashes. Em dashes are counted separately: models overuse them. */
const PAREN_RE = /\([^)]{3,}\)|[^\S\n]-[^\S\n]/g;
const PUNCT_KINDS: RegExp[] = [/\?/, /!/, /;/, /:/, /[—–]/, /\(/, /["“”]/, /['’](?![a-z])/];
const MIN_SENTENCE_WORDS = 4;

/** Weights of the structural signals and the prior toward "human". */
const W = {
  contrast: 2.2,
  tail: 1.0,
  signpost: 1.3,
  doublet: 0.6,
  dash: 1.0,
  boldBullets: 1.2,
  headings: 0.5,
  base: 1.6,
};

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
    contrastRate: 0,
    participialRate: 0,
    signpostRate: 0,
    doubletRate: 0,
    dashRate: 0,
    quotedShare: 0,
    structureMarks: 0,
  };
}

function verdictFor(score: number, lo = 0.35, hi = 0.65): Verdict {
  return score < lo ? "human" : score < hi ? "mixed" : "ai";
}

function buildFlags(text: string, tooShort: boolean, mostlyQuoted = false): TextFlag[] {
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
  if (mostlyQuoted) {
    flags.push({
      id: "mostly-quoted",
      label: "Mostly dialogue or quotation",
      description: "Over half the words sit inside quotation marks. Our signals are tuned for prose, so this score is low confidence.",
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
  // `prose` blanks markdown markers and citations; `voice` also blanks quoted
  // speech, so a quotation's contractions and first person are not credited to
  // the author. Both keep the original length, so sentence offsets still apply.
  const structure = analyseStructure(text);
  const prose = maskMarkup(text);
  const voice = maskMatches(prose, QUOTE_RE);
  const voiceWords = Math.max(1, tokenizeWords(voice).length);
  const quotedShare = Math.max(0, 1 - voiceWords / Math.max(1, tokenizeWords(prose).length));
  const mostlyQuoted = quotedShare >= 0.5 && words >= LIMITS.minWords;

  const sentenceTokens = spans.map((s) => tokenizeWords(prose.slice(s.start, s.end)));
  const headingLike = spans.map((s, i) => isHeadingLike(s.text, sentenceTokens[i].length));
  const qualifying: { span: TextSpan; tokens: string[]; prose: string }[] = [];
  spans.forEach((span, i) => {
    if (sentenceTokens[i].length >= MIN_SENTENCE_WORDS && !headingLike[i]) {
      qualifying.push({ span, tokens: sentenceTokens[i], prose: prose.slice(span.start, span.end) });
    }
  });
  const nq = qualifying.length;
  const lengths = qualifying.map((q) => q.tokens.length);
  const avgLen = mean(lengths);
  const sd = stdDev(lengths);
  const burstiness = avgLen > 0 ? sd / avgLen : 0;

  const paragraphs = splitParagraphs(text);
  const paraLengths = paragraphs.map((p) => tokenizeWords(p).length).filter((n) => n >= 12);
  const paraCv = paraLengths.length >= 3 ? stdDev(paraLengths) / Math.max(1, mean(paraLengths)) : null;

  const lower = allTokens.map((t) => t.toLowerCase());
  const diversity = lexicalDiversity(lower);
  const avgWordLength = mean(allTokens.map((t) => t.length));
  const contractions = countMatches(voice, CONTRACTION_DETECT);
  const contractionRate = (contractions / voiceWords) * 100;
  const firstPerson = countMatches(voice, FIRST_PERSON_RE);
  const firstPersonRate = (firstPerson / voiceWords) * 100;
  const casual = countMatches(voice, CASUAL_MARKER_RE);
  // Openers common in human prose (However, Finally, For instance) count for nothing; glue like Furthermore counts fully.
  const openerWeight = qualifying.reduce((sum, q) => {
    const o = findOpener(q.prose.trim());
    return sum + (o ? (o.tier - 1) / 2 : 0);
  }, 0);
  const transitionRate = nq > 0 ? openerWeight / nq : 0;
  const docHits = phraseHits(prose);
  const weightedHits = docHits.reduce((s, h) => s + h.weight, 0);
  // Per 100 words, but never on fewer than 100: one formal word must not saturate a short note.
  const aiPhraseDensity = (weightedHits / Math.max(words, 100)) * 100;
  const triplets = countMatches(prose, TRIPLET_RE);
  const tripletRate = nq > 0 ? triplets / nq : 0;
  const notOnly = countMatches(prose, NOT_ONLY_RE);
  const numbers = countMatches(prose, NUMBER_RE);
  const numberRate = (numbers / words) * 100;
  const lowerI = countMatches(voice, LOWER_I_RE);
  const questions = spans.filter((s) => /\?["”')]*$/.test(voice.slice(s.start, s.end).trim())).length;
  const exclaims = spans.filter((s) => /!["”')]*$/.test(voice.slice(s.start, s.end).trim())).length;
  const asides = countMatches(prose, PAREN_RE);
  const syllables = allTokens.reduce((s, t) => s + countSyllables(t), 0);
  const readingGrade = fleschKincaidGrade(words, Math.max(1, nq), syllables);
  const punctuationVariety = PUNCT_KINDS.filter((re) => re.test(text)).length;

  // Structural signals of current model prose.
  const contrasts = findContrasts(prose);
  const contrastRate = nq > 0 ? contrasts.length / nq : 0;
  const tails = qualifying.filter((q) => participialTail(q.prose)).length;
  const participialRate = nq > 0 ? tails / nq : 0;
  const signposts = qualifying.filter((q) => isSignpost(q.prose)).length;
  const signpostRate = nq > 0 ? signposts / nq : 0;
  const doubletRate = nq > 0 ? countDoublets(prose) / nq : 0;
  const dashRate = (countDashes(prose) / words) * 100;
  const structureMarks = structure.headings + structure.boldLabelBullets;

  // Rhythm needs a handful of sentences before it means anything.
  const rhythmTrust = lin(nq, 3, 8);
  // First person only reads as a personal voice when the register is relaxed too.
  const relaxed = 0.35 + 0.65 * lin(contractionRate + casual * 0.5, 0, 1.2);

  let z = 0;
  z += rhythmTrust * (2.6 * (1 - lin(burstiness, 0.2, 0.75)) - 1.3);
  z += 2.6 * lin(transitionRate, 0.05, 0.4);
  z += 2.8 * lin(aiPhraseDensity, 0.5, 6) + 0.8 * lin(aiPhraseDensity, 6, 14);
  z -= 1.5 * lin(contractionRate, 0, 2.5);
  z -= 1.4 * lin(firstPersonRate, 0.5, 5) * relaxed;
  z -= 1.2 * lin(casual, 0, 3);
  z -= 0.5 * lin(questions + exclaims, 0, 2) * relaxed;
  z -= 0.4 * lin(asides, 0, 2);
  z += 1.0 * lin(avgWordLength, 4.6, 5.8) - 0.3;
  z += 0.5 * lin(tripletRate, 0.05, 0.3);
  z += (0.6 * Math.min(notOnly, 2)) / 2;
  z -= 0.6 * lin(numberRate, 0.5, 3);
  if (paraCv !== null) z += 0.7 * (1 - lin(paraCv, 0.15, 0.6)) - 0.35;
  z -= 0.8 * lin(lowerI, 0, 2);
  z += 0.5 * lin(avgLen, 14, 24) - 0.25;
  z += W.contrast * lin(contrastRate, 0.03, 0.25);
  z += W.tail * lin(participialRate, 0.04, 0.22);
  z += W.signpost * lin(signpostRate, 0.03, 0.2);
  z += W.doublet * lin(doubletRate, 0.3, 0.8);
  z += W.dash * lin(dashRate, 0.4, 1.8);
  z += W.boldBullets * lin(structure.boldLabelBullets, 0, 3) + W.headings * lin(structure.headings, 0, 3);
  z -= W.base;
  const docProb = sigmoid(z);

  // ---- Sentence-level scores ----------------------------------------------
  const sentences: SentenceScore[] = [];
  spans.forEach((span, i) => {
    const tokens = sentenceTokens[i];
    if (tokens.length === 0) return;
    const s = prose.slice(span.start, span.end);
    const own = voice.slice(span.start, span.end);
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
    const hasContraction = CONTRACTION_DETECT.test(own);
    CONTRACTION_DETECT.lastIndex = 0;
    if (hasContraction) l -= 0.9;
    else if (tokens.length >= 8) {
      l += 0.35;
      if (tokens.length >= 16) signals.push("No contractions");
    }
    const fp = countMatches(own, FIRST_PERSON_RE);
    if (fp > 0) l -= hasContraction ? 0.8 : 0.3;
    const cas = countMatches(own, CASUAL_MARKER_RE);
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
    const contrast = findContrasts(s)[0];
    if (contrast) {
      l += 0.9;
      signals.push(`Contrast framing: ${contrast.label}`);
    }
    const tail = participialTail(s);
    if (tail) {
      l += 0.6;
      signals.push(`Trailing “, ${tail} …” clause`);
    }
    if (isSignpost(s)) {
      l += 0.6;
      signals.push("Signpost sentence");
    }
    if (countDashes(s) > 0) {
      l += 0.3;
      if (dashRate >= 0.8) signals.push("Em-dash aside");
    }
    if (headingLike[i]) l -= 0.4;

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
  // Pull uncertain cases toward the middle instead of reporting false precision.
  const trust = tooShort ? 0.4 : (0.65 + 0.35 * lin(words, 30, 120)) * (mostlyQuoted ? 0.5 : 1);
  prob = 50 + (prob - 50) * trust;
  const aiProbability = Math.max(0, Math.min(100, Math.round(prob)));

  const breakdown = { human: 0, mixed: 0, ai: 0 };
  for (const s of sentences) breakdown[s.verdict]++;

  const metrics: TextMetrics = {
    words,
    sentences: nq,
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
    contrastRate: Math.round(contrastRate * 100) / 100,
    participialRate: Math.round(participialRate * 100) / 100,
    signpostRate: Math.round(signpostRate * 100) / 100,
    doubletRate: Math.round(doubletRate * 100) / 100,
    dashRate: Math.round(dashRate * 100) / 100,
    quotedShare: Math.round(quotedShare * 100) / 100,
    structureMarks,
  };

  const confidence: DetectionResult["confidence"] =
    tooShort || words < 60 || mostlyQuoted ? "low" : words < 200 ? "medium" : "high";

  return {
    aiProbability,
    humanProbability: 100 - aiProbability,
    verdict: verdictFor(aiProbability / 100),
    confidence,
    sentences,
    breakdown,
    detectors: estimateDetectors(text, { aiProbability, metrics, sentences }),
    metrics,
    flags: buildFlags(text, tooShort, mostlyQuoted),
    tooShort,
  };
}
