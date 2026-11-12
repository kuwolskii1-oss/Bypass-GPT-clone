/**
 * Shared contract for the text-analysis engine.
 * Everything in the UI, the API routes and the engine itself builds against these types.
 */

export const READABILITY_LEVELS = [
  "high-school",
  "university",
  "doctorate",
  "journalist",
  "marketing",
] as const;
export type Readability = (typeof READABILITY_LEVELS)[number];

export const PURPOSES = [
  "general",
  "essay",
  "article",
  "marketing",
  "story",
  "cover-letter",
  "report",
  "business",
  "legal",
] as const;
export type Purpose = (typeof PURPOSES)[number];

export const STRENGTHS = ["light", "balanced", "aggressive"] as const;
export type Strength = (typeof STRENGTHS)[number];

export const READABILITY_LABELS: Record<Readability, string> = {
  "high-school": "High school",
  university: "University",
  doctorate: "Doctorate",
  journalist: "Journalist",
  marketing: "Marketing",
};

export const PURPOSE_LABELS: Record<Purpose, string> = {
  general: "General writing",
  essay: "Essay",
  article: "Article",
  marketing: "Marketing copy",
  story: "Story",
  "cover-letter": "Cover letter",
  report: "Report",
  business: "Business",
  legal: "Legal",
};

export const STRENGTH_LABELS: Record<Strength, { label: string; hint: string }> = {
  light: { label: "Light", hint: "Minimal edits, keeps your structure" },
  balanced: { label: "Balanced", hint: "Natural rhythm with meaning intact" },
  aggressive: { label: "Aggressive", hint: "Deep rewrite for the toughest detectors" },
};

export interface HumanizeOptions {
  readability: Readability;
  purpose: Purpose;
  strength: Strength;
  /** Words or phrases that must be preserved verbatim (case-insensitive match). */
  keepKeywords?: string[];
  /** Optional seed so "Re-humanize" can produce a different but reproducible variant. */
  seed?: number;
}

export const DEFAULT_HUMANIZE_OPTIONS: HumanizeOptions = {
  readability: "university",
  purpose: "general",
  strength: "balanced",
};

/** Word-count limits enforced by the UI and the API. */
export const LIMITS = {
  /** Below this the detector cannot produce a meaningful score. */
  minWords: 30,
  /** Free tier cap per request. */
  freeMaxWords: 500,
  /** Hard cap per request for any plan. */
  maxWords: 10000,
  /** Turnitin-style estimates need this many words before they report. */
  longFormMinWords: 300,
} as const;

export type Verdict = "human" | "mixed" | "ai";

export interface SentenceScore {
  index: number;
  text: string;
  /** Character offsets into the original text. */
  start: number;
  end: number;
  /** Probability (0..1) that the sentence is AI-generated. */
  score: number;
  verdict: Verdict;
  /** Short human-readable reasons, e.g. "AI phrase: delve into". */
  signals: string[];
}

export interface TextMetrics {
  words: number;
  sentences: number;
  paragraphs: number;
  characters: number;
  avgSentenceLength: number;
  sentenceLengthStdDev: number;
  /** Coefficient of variation of sentence length. Human writing is bursty (higher). */
  burstiness: number;
  /** Length-adjusted type/token ratio, 0..1. */
  lexicalDiversity: number;
  avgWordLength: number;
  /** Contractions per 100 words. */
  contractionRate: number;
  /** Share of sentences that open with a transitional adverb (Furthermore, Moreover, ...). */
  transitionRate: number;
  aiPhraseHits: number;
  /** AI-phrase hits per 100 words. */
  aiPhraseDensity: number;
  /** First-person pronouns per 100 words. */
  firstPersonRate: number;
  /** Flesch-Kincaid grade level. */
  readingGrade: number;
  /** Number of distinct punctuation kinds used (?, !, ;, :, —, (), quotes). */
  punctuationVariety: number;  /** Contrast framings ("not X but Y", "It isn't X. It's Y.") per sentence. */
  contrastRate: number;
  /** Share of sentences ending in a participial tail (", highlighting ..."). */
  participialRate: number;
  /** Share of sentences that announce their own point ("The real question is..."). */
  signpostRate: number;
  /** Paired abstractions ("clarity and focus") per sentence. */
  doubletRate: number;
  /** Em dashes per 100 words. */
  dashRate: number;
  /** Share of words inside quotation marks, 0..1. */
  quotedShare: number;
  /** Markdown headings and bold-label bullets found. */
  structureMarks: number;
}

export interface DetectorEstimate {
  id: string;
  name: string;
  /** Estimated AI score 0..100 as this detector would likely report it. */
  aiScore: number;
  verdict: Verdict;
  /** Shown when the detector can't score (e.g. too short). */
  unavailable?: boolean;
  note?: string;
}

export interface TextFlag {
  id: "hidden-characters" | "homoglyphs" | "irregular-spacing" | "very-short" | "mostly-quoted";
  label: string;
  description: string;
  count?: number;
}

export interface DetectionResult {
  /** 0..100 */
  aiProbability: number;
  /** 0..100, always 100 - aiProbability */
  humanProbability: number;
  verdict: Verdict;
  confidence: "low" | "medium" | "high";
  sentences: SentenceScore[];
  /** Sentence counts by verdict. */
  breakdown: { human: number; mixed: number; ai: number };
  detectors: DetectorEstimate[];
  metrics: TextMetrics;
  flags: TextFlag[];
  /** True when the text is under LIMITS.minWords; scores are then low-confidence. */
  tooShort: boolean;
}

export interface HumanizeResult {
  text: string;
  original: string;
  /** Number of edited tokens (rough diff count) — shown as "N edits". */
  edits: number;
  options: HumanizeOptions;
  before: DetectionResult;
  after: DetectionResult;
  /** Which engine produced the rewrite. */
  engine: "local" | "claude";
}

export interface DetectorSpec {
  id: string;
  name: string;
  /** Short blurb for the marketing grid. */
  blurb: string;
  /** Needs LIMITS.longFormMinWords words before it can report. */
  longFormOnly?: boolean;
}

/** The detectors we estimate against. Order is the display order. */
export const DETECTORS: DetectorSpec[] = [
  { id: "gptzero", name: "GPTZero", blurb: "Perplexity and burstiness based" },
  { id: "turnitin", name: "Turnitin", blurb: "Institutional AI writing indicator", longFormOnly: true },
  { id: "originality", name: "Originality.ai", blurb: "Popular with publishers and SEO teams" },
  { id: "copyleaks", name: "Copyleaks", blurb: "Enterprise plagiarism and AI checks" },
  { id: "zerogpt", name: "ZeroGPT", blurb: "Free consumer detector" },
  { id: "winston", name: "Winston AI", blurb: "Education and publishing focused" },
  { id: "sapling", name: "Sapling", blurb: "Sentence-level classifier" },
  { id: "writer", name: "Writer.com", blurb: "Marketing content detector" },
  { id: "quillbot", name: "QuillBot", blurb: "Built into the paraphrasing suite" },
  { id: "grammarly", name: "Grammarly", blurb: "Bundled with the grammar checker" },
  { id: "crossplag", name: "Crossplag", blurb: "Academic integrity tool" },
  { id: "contentatscale", name: "Content at Scale", blurb: "Long-form content detector" },
];
