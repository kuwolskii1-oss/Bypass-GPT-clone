/**
 * Structural style signals shared by the detector and the humanizer.
 *
 * Stock phrases ("delve", "tapestry") are easy to prompt away, and current
 * models rarely use them. What persists is structure: contrast framing
 * ("not X but Y", "It isn't X. It's Y."), participial tails (", highlighting
 * the need for..."), signpost sentences ("The real question is..."), em-dash
 * asides, paired abstractions ("clarity and focus") and markdown scaffolding
 * with bold-label bullets. These helpers find those patterns.
 */

/** Replaces every match with spaces of the same length so offsets stay valid. */
export function maskMatches(text: string, re: RegExp): string {
  return text.replace(re, (m) => m.replace(/[^\n]/g, " "));
}

/** Parenthetical or bracketed citations: (Turkle, 2011), (Lin et al., 2016, p. 4), [12], [3-5]. */
export const CITATION_RE =
  /\((?:[^()\n]{0,80}?\b(?:1[6-9]|20)\d{2}[a-z]?\b[^()\n]{0,40}?)\)|\[\d{1,3}(?:\s*[,–-]\s*\d{1,3})*\]/g;

/** Quoted speech or quotation on one line. */
export const QUOTE_RE = /["“][^"“”\n]{2,1200}["”]/g;

const HEADING_MARK_RE = /^[^\S\n]*#{1,6}[^\S\n]+/gm;
const LIST_MARK_RE = /^[^\S\n]*(?:[-*•]|\d{1,2}[.)])[^\S\n]+/gm;
const EMPHASIS_RE = /\*\*|__/g;
const BOLD_LABEL_RE = /^[^\S\n]*(?:[-*•]|\d{1,2}[.)])[^\S\n]+\*\*[^*\n]{2,60}\*\*[^\S\n]*[:—–-]/gm;
const MD_HEADING_RE = /^[^\S\n]*#{1,6}[^\S\n]+\S/gm;

export interface Structure {
  /** Markdown headings (# ...). */
  headings: number;
  /** List items that open with a bold label: "- **Label**: ...". */
  boldLabelBullets: number;
  listItems: number;
}

function count(text: string, re: RegExp): number {
  re.lastIndex = 0;
  let n = 0;
  while (re.exec(text) !== null) n++;
  re.lastIndex = 0;
  return n;
}

export function analyseStructure(text: string): Structure {
  return {
    headings: count(text, MD_HEADING_RE),
    boldLabelBullets: count(text, BOLD_LABEL_RE),
    listItems: count(text, LIST_MARK_RE),
  };
}

/** Text with markdown markers and citations blanked (same length as the input). */
export function maskMarkup(text: string): string {
  let out = maskMatches(text, HEADING_MARK_RE);
  out = maskMatches(out, LIST_MARK_RE);
  out = maskMatches(out, EMPHASIS_RE);
  return maskMatches(out, CITATION_RE);
}

/** A heading, list label or other line fragment that is not a prose sentence. */
export function isHeadingLike(sentence: string, words: number): boolean {
  const s = sentence.trim();
  if (/^#{1,6}\s/.test(s)) return true;
  return words <= 12 && !/[.!?…]["”'’)\]]*$/.test(s);
}

// ---------------------------------------------------------------------------
// Contrast framing
// ---------------------------------------------------------------------------

const NEG = "(?:(?:is|are|was|were|does|do|did)(?:[^\\S\\n]+not|n['’]t)|['’]s[^\\S\\n]+not|['’]re[^\\S\\n]+not)";

/** Patterns that set up one idea only to replace it with another. */
export const CONTRAST_PATTERNS: ReadonlyArray<{ re: RegExp; label: string }> = [
  // "It isn't about speed — it's about focus." / "That's not a failing. It's a design problem."
  {
    re: new RegExp(
      `\\b${NEG}\\b[^.!?\\n]{1,70}?(?:[.;—–]|[^\\S\\n]-)[^\\S\\n]*(?:it|they|that|this)(?:['’]s|['’]re|[^\\S\\n]+(?:is|are|was))\\b`,
      "gi",
    ),
    label: "“It isn't X. It's Y.”",
  },
  // "The goal isn't to squeeze more in. The goal is to protect..."
  { re: /\b(the [a-z]+) (?:is not|isn['’]t|was not|wasn['’]t)\b[^.!?\n]{1,70}[.;—–]\s*\1 (?:is|was)\b/gi, label: "“The goal isn't X. The goal is Y.”" },
  // "not where people work but how they decide"
  { re: /\bnot\b(?![^\S\n]+only\b)[^.!?,;:\n]{2,60}?[^\S\n]but\b(?![^\S\n]+also\b)/gi, label: "“not X but Y”" },
  // "did not invent the desire, but it has industrialised it"
  { re: /\b(?:did|does|do|has|have)(?: not|n['’]t) [a-z]+\b[^.!?;:\n]{2,50}?,[^\S\n]but (?:it|they|we|he|she) (?:has|have|did|does|do)\b/gi, label: "“did not X, but did Y”" },
  // "not just a building", "isn't merely"
  { re: /\b(?:not|n['’]t) (?:just|merely|simply|only about)\b/gi, label: "“not just X”" },
  // "less about proving yourself and more about learning"
  { re: /\b(?:less|more) about\b[^.!?\n]{2,60}?\b(?:than|and more|and less)\b/gi, label: "“less about X than Y”" },
  // "progress, not perfection."
  { re: /,[^\S\n]not[^\S\n][^.!?,;\n]{2,40}[.!?]/g, label: "“X, not Y.”" },
  // "rather than defaulting to habit"
  { re: /\b(?:something|someone|somewhere) [^.!?,\n]{1,30} rather than (?:something|someone|somewhere)\b/gi, label: "“X rather than Y”" },
];

export interface StyleHit {
  label: string;
  index: number;
  length: number;
}

export function findContrasts(text: string): StyleHit[] {
  const hits: StyleHit[] = [];
  for (const p of CONTRAST_PATTERNS) {
    p.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = p.re.exec(text)) !== null) {
      // One construction often matches two patterns; keep the first for that span.
      if (!hits.some((h) => m!.index < h.index + h.length && h.index < m!.index + m![0].length)) {
        hits.push({ label: p.label, index: m.index, length: m[0].length });
      }
      if (m[0].length === 0) p.re.lastIndex++;
    }
    p.re.lastIndex = 0;
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Participial tails, signposts, doublets, em dashes
// ---------------------------------------------------------------------------

const NOT_VERBS = new Set([
  "including", "according", "during", "regarding", "being", "depending", "assuming", "following", "considering",
  "something", "nothing", "anything", "everything", "morning", "evening", "building", "meaning", "feeling",
  "beginning", "ceiling", "wedding", "clothing", "excluding", "concerning", "notwithstanding", "king", "thing",
]);

/** ", highlighting the need for..." at the end of a sentence. Returns the -ing word. */
export const PARTICIPIAL_TAIL_RE =
  /,[^\S\n]+(?:(?:thereby|thus|ultimately|often|further|effectively)[^\S\n]+)?([a-z]{3,}ing)\b[^,.!?;\n]{6,}[.!?]["”’']?[^\S\n]*$/i;

export function participialTail(sentence: string): string | null {
  const m = PARTICIPIAL_TAIL_RE.exec(sentence);
  if (!m) return null;
  const word = m[1].toLowerCase();
  return NOT_VERBS.has(word) ? null : word;
}

/** Sentences that announce their own point: "The real question is...", "Here's the thing". */
export const SIGNPOST_RE =
  /^["“(]*(?:(?:but|and|so|yet)[^\S\n]+)?(?:(?:the|my|our|this|that|one|another)[^\S\n]+(?:[\w-]+[^\S\n]+){0,2}(?:problem|picture|point|question|answer|result|conclusion|lesson|reality|truth|challenge|goal|difference|irony|catch|trade-?off|upshot|implication|takeaway|key|issue|risk|task|shift|idea|aim|secret|trick|solution|mechanisms?|consequences?|benefits?|drawbacks?|discomfort|companies|subject)[^\S\n]+(?:(?:underlying|behind|for|of|that)[^\S\n]+[^.!?,\n]{2,40}[^\S\n]+)?(?:is|was|are|were|will|remains?|lies|happens)\b|(?:here|that)['’]s[^\S\n]+(?:the thing|why|how|what|where)\b|none of this means\b|taken together\b|(?:so|but)[^\S\n]+(?:where|what|how|why)\b[^.!?\n]*\?)/i;

export function isSignpost(sentence: string): boolean {
  return SIGNPOST_RE.test(sentence.trim());
}

const DOUBLET_RE = /\b([a-z]{5,})[^\S\n]+and[^\S\n]+([a-z]{5,})\b/gi;
const DOUBLET_STOP = new Set([
  "there", "their", "these", "those", "which", "where", "while", "would", "could", "should", "about", "after",
  "before", "other", "being", "again", "still", "every", "never", "always", "maybe", "between", "because", "under",
  "until", "since", "three", "seven", "eight", "first", "second", "third", "thing", "things", "people", "today",
  "started", "looked", "asked", "there's",
]);

/** Paired abstractions joined by "and" ("clarity and focus", "trust and accountability"). */
export function countDoublets(text: string): number {
  DOUBLET_RE.lastIndex = 0;
  let n = 0;
  let m: RegExpExecArray | null;
  while ((m = DOUBLET_RE.exec(text)) !== null) {
    if (!DOUBLET_STOP.has(m[1].toLowerCase()) && !DOUBLET_STOP.has(m[2].toLowerCase())) n++;
  }
  DOUBLET_RE.lastIndex = 0;
  return n;
}

/** Em dashes, spaced en dashes and double hyphens used as dashes. */
export const DASH_RE = /—|[^\S\n]–[^\S\n]|(?<=\w)[^\S\n]?--[^\S\n]?(?=\w)/g;

export function countDashes(text: string): number {
  return count(text, DASH_RE);
}

export interface StyleSignal {
  id: string;
  label: string;
  /** Short plain-language explanation shown on hover. */
  detail: string;
}

/** The structural signals present in a text, strongest first, for display next to the score. */
export function styleSignals(m: {
  sentences: number;
  contrastRate: number;
  participialRate: number;
  signpostRate: number;
  doubletRate: number;
  dashRate: number;
  structureMarks: number;
  transitionRate: number;
  aiPhraseHits: number;
  burstiness: number;
}): StyleSignal[] {
  const n = Math.max(1, m.sentences);
  const times = (rate: number) => Math.max(1, Math.round(rate * n));
  const out: (StyleSignal & { weight: number })[] = [];
  if (m.aiPhraseHits >= 2)
    out.push({ id: "phrases", weight: m.aiPhraseHits / n, label: `Stock phrases ×${m.aiPhraseHits}`, detail: "Wording models reach for by default, such as “plays a crucial role” or “a testament to”." });
  if (m.contrastRate >= 0.08)
    out.push({ id: "contrast", weight: m.contrastRate * 2, label: `Contrast framing ×${times(m.contrastRate)}`, detail: "Setting up one idea to replace it with another: “not X but Y”, “It isn't X. It's Y.”" });
  if (m.signpostRate >= 0.08)
    out.push({ id: "signpost", weight: m.signpostRate * 1.5, label: `Signpost sentences ×${times(m.signpostRate)}`, detail: "Sentences that announce a point before making it: “The real question is…”" });
  if (m.participialRate >= 0.08)
    out.push({ id: "tails", weight: m.participialRate * 1.5, label: `Trailing “-ing” clauses ×${times(m.participialRate)}`, detail: "Sentences that end by commenting on themselves: “…, highlighting the need for…”" });
  if (m.dashRate >= 0.6)
    out.push({ id: "dashes", weight: m.dashRate / 2, label: "Em-dash asides", detail: `${m.dashRate.toFixed(1)} em dashes per 100 words. Current models use them far more than most writers.` });
  if (m.transitionRate >= 0.12)
    out.push({ id: "transitions", weight: m.transitionRate * 2, label: "Formulaic transitions", detail: "Sentences opening with Furthermore, Moreover, Additionally, In conclusion." });
  if (m.structureMarks >= 2)
    out.push({ id: "structure", weight: m.structureMarks / 4, label: "Markdown scaffolding", detail: "Headings and list items with bold labels, the layout chat assistants produce by default." });
  if (m.doubletRate >= 0.45)
    out.push({ id: "doublets", weight: m.doubletRate / 2, label: "Paired abstractions", detail: "Frequent pairs like “clarity and focus” or “trust and accountability”." });
  if (m.sentences >= 6 && m.burstiness < 0.3)
    out.push({ id: "rhythm", weight: 0.3, label: "Even rhythm", detail: "Sentences are close to the same length throughout." });
  return out.sort((a, b) => b.weight - a.weight).map(({ id, label, detail }) => ({ id, label, detail }));
}
