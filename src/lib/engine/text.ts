/**
 * Low-level text utilities shared by the detector and the humanizer.
 *
 * Everything here is pure, dependency-free and safe to run in both Node route
 * handlers and the browser (no `fs`, no `crypto`).
 */

/** A slice of the original text with character offsets into that text. */
export interface TextSpan {
  text: string;
  /** Inclusive start offset into the original string. */
  start: number;
  /** Exclusive end offset into the original string. */
  end: number;
}

/** Counts of suspicious or invisible characters found in a text. */
export interface HiddenCharacterReport {
  /** Zero-width characters (U+200B/200C/200D/2060/FEFF). */
  zeroWidth: number;
  /** Soft hyphens (U+00AD). */
  softHyphens: number;
  /** Cyrillic/Greek letters mixed into otherwise Latin words. */
  homoglyphs: number;
  /** Runs of multiple spaces or non-breaking/unusual space characters. */
  irregularSpacing: number;
  /** Sum of the above. */
  total: number;
}

// ---------------------------------------------------------------------------
// Sentence splitting
// ---------------------------------------------------------------------------

const ABBREVIATIONS = new Set([
  "dr", "mr", "mrs", "ms", "prof", "sr", "jr", "st", "mt", "vs", "etc",
  "e.g", "i.e", "u.s", "u.s.a", "u.k", "u.n", "ph.d", "m.d", "b.a", "m.a", "b.sc", "m.sc",
  "fig", "figs", "vol", "vols", "no", "nos", "pp", "inc", "ltd", "co", "corp",
  "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec",
  "approx", "dept", "a.m", "p.m", "cf", "al", "eds", "univ", "assn", "ave", "blvd",
  "hon", "rev", "capt", "col", "lt", "sgt", "messrs", "mme", "bros", "govt", "misc",
]);

const TERMINALS = new Set([".", "!", "?", "…"]);
const CLOSERS = new Set(['"', "'", "”", "’", ")", "]", "»"]);

function isSpace(ch: string): boolean {
  return ch === " " || ch === "\t" || ch === "\r" || ch === "\u00A0" || ch === "\n";
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isLowerLetter(ch: string): boolean {
  return ch !== "" && ch.toLowerCase() === ch && ch.toUpperCase() !== ch;
}

function isUpperLetter(ch: string): boolean {
  return ch !== "" && ch.toUpperCase() === ch && ch.toLowerCase() !== ch;
}

function isTokenChar(ch: string): boolean {
  return /[\p{L}\p{N}.&]/u.test(ch);
}

/** Collects the token (letters, digits, dots) that ends right before `index`. */
function precedingToken(text: string, index: number, floor: number): string {
  let i = index;
  while (i > floor && isTokenChar(text[i - 1])) i--;
  return text.slice(i, index).replace(/^\.+/, "");
}

function isAbbreviation(token: string, nextCh: string): boolean {
  const t = token.toLowerCase();
  if (t === "no" || t === "nos") return isDigit(nextCh);
  if (t === "etc") return !isUpperLetter(nextCh);
  return ABBREVIATIONS.has(t);
}

function splitLine(text: string, from: number, to: number, out: TextSpan[]): void {
  let segStart = from;
  while (segStart < to && isSpace(text[segStart])) segStart++;
  if (segStart >= to) return;

  const push = (start: number, end: number): void => {
    let e = end;
    while (e > start && isSpace(text[e - 1])) e--;
    if (e > start) out.push({ text: text.slice(start, e), start, end: e });
  };

  let i = segStart;
  while (i < to) {
    const ch = text[i];
    if (!TERMINALS.has(ch)) {
      i++;
      continue;
    }
    let j = i;
    while (j < to && TERMINALS.has(text[j])) j++;
    const run = text.slice(i, j);
    let k = j;
    while (k < to && CLOSERS.has(text[k])) k++;
    const hasClosers = k > j;
    let m = k;
    while (m < to && isSpace(text[m])) m++;
    const atEnd = m >= to;
    const nextCh = atEnd ? "" : text[m];

    let boundary: boolean;
    if (k < to && !isSpace(text[k])) {
      // "3.14", "e.g.", "U.S." — punctuation glued to the next token.
      boundary = false;
    } else if (atEnd) {
      boundary = true;
    } else if (run.length >= 3 || run.includes("…")) {
      // Ellipsis: only a boundary when the next word looks like a new sentence.
      boundary = !isLowerLetter(nextCh);
    } else if (run.includes("?") || run.includes("!")) {
      boundary = !(hasClosers && isLowerLetter(nextCh));
    } else {
      const token = precedingToken(text, i, segStart);
      const atLineStart = i - token.length <= segStart;
      if (token.length === 0) {
        boundary = true;
      } else if (isAbbreviation(token, nextCh)) {
        boundary = false;
      } else if (token.length === 1 && (isUpperLetter(token) || atLineStart)) {
        // Initials ("J. K. Rowling") and lettered list markers ("a. first").
        boundary = false;
      } else if (atLineStart && /^\d+$/.test(token)) {
        // Numbered list marker ("1. Introduction").
        boundary = false;
      } else if (hasClosers && isLowerLetter(nextCh)) {
        // '"Stop." he said' — dialogue continues.
        boundary = false;
      } else {
        boundary = true;
      }
    }

    if (boundary) {
      push(segStart, k);
      segStart = m;
      i = m;
    } else {
      i = k > i ? k : i + 1;
    }
  }
  if (segStart < to) push(segStart, to);
}

/**
 * Splits text into sentence-like segments with character offsets into the
 * original string. Every line (heading, bullet, blank-line separated
 * paragraph) is segmented on its own; segments never overlap and the gaps
 * between them are whitespace only, so concatenating segments plus the skipped
 * whitespace reproduces the original text exactly.
 */
export function splitSentences(text: string): TextSpan[] {
  const out: TextSpan[] = [];
  const n = text.length;
  let lineStart = 0;
  while (lineStart <= n) {
    let lineEnd = text.indexOf("\n", lineStart);
    if (lineEnd === -1) lineEnd = n;
    splitLine(text, lineStart, lineEnd, out);
    if (lineEnd >= n) break;
    lineStart = lineEnd + 1;
  }
  return out;
}

/** Splits text into non-empty paragraphs separated by blank lines. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n[ \t\r]*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

// ---------------------------------------------------------------------------
// Words & syllables
// ---------------------------------------------------------------------------

const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

/** Tokenizes words (unicode letters/digits with inner apostrophes and hyphens). */
export function tokenizeWords(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

/** Number of word tokens in the text. */
export function countWords(text: string): number {
  return tokenizeWords(text).length;
}

/** Heuristic English syllable count for a single word. Always >= 1. */
export function countSyllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 1;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  w = w.replace(/^y/, "");
  const groups = w.match(/[aeiouy]{1,2}/g);
  const count = groups ? groups.length : 0;
  return Math.max(1, count);
}

/** Flesch–Kincaid grade level; returns 0 when there is nothing to measure. */
export function fleschKincaidGrade(words: number, sentences: number, syllables: number): number {
  if (words === 0 || sentences === 0) return 0;
  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

// ---------------------------------------------------------------------------
// Hidden characters
// ---------------------------------------------------------------------------

const ZERO_WIDTH_RE = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
const SOFT_HYPHEN_RE = /\u00AD/g;
const UNUSUAL_SPACE_RE = /[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g;
const MULTI_SPACE_RE = /(^|[^\s])[ \t]{2,}(?=\S)/gm;
const MIXED_WORD_RE = /[\p{L}]+/gu;
const NON_LATIN_LETTER_RE = /[\u0370-\u03FF\u0400-\u04FF]/g;
const LATIN_LETTER_RE = /[A-Za-z\u00C0-\u024F]/;

/** Cyrillic/Greek look-alikes mapped to the Latin letters they imitate. */
const HOMOGLYPH_MAP: Record<string, string> = {
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "х": "x",
  "у": "y", "і": "i", "ј": "j", "ѕ": "s", "һ": "h", "ԁ": "d",
  "ԛ": "q", "ѡ": "w", "А": "A", "В": "B", "С": "C", "Е": "E",
  "Н": "H", "К": "K", "М": "M", "О": "O", "Р": "P", "Т": "T",
  "Х": "X", "Ѕ": "S", "І": "I", "Ј": "J", "ο": "o", "α": "a",
  "ε": "e", "ι": "i", "κ": "k", "ν": "v", "ρ": "p", "υ": "u",
  "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I",
  "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T",
  "Υ": "Y", "Χ": "X",
};

function countMatches(text: string, re: RegExp): number {
  const m = text.match(re);
  return m ? m.length : 0;
}

/** Counts homoglyph letters inside words that also contain Latin letters. */
function countHomoglyphs(text: string): number {
  let count = 0;
  for (const word of text.match(MIXED_WORD_RE) ?? []) {
    if (!LATIN_LETTER_RE.test(word)) continue;
    count += countMatches(word, NON_LATIN_LETTER_RE);
  }
  return count;
}

/** Finds zero-width characters, soft hyphens, homoglyphs and irregular spacing. */
export function findHiddenCharacters(text: string): HiddenCharacterReport {
  const zeroWidth = countMatches(text, ZERO_WIDTH_RE);
  const softHyphens = countMatches(text, SOFT_HYPHEN_RE);
  const homoglyphs = countHomoglyphs(text);
  const irregularSpacing = countMatches(text, UNUSUAL_SPACE_RE) + countMatches(text, MULTI_SPACE_RE);
  return {
    zeroWidth,
    softHyphens,
    homoglyphs,
    irregularSpacing,
    total: zeroWidth + softHyphens + homoglyphs + irregularSpacing,
  };
}

/**
 * Strips hidden characters, maps homoglyphs back to Latin, normalizes line
 * endings, collapses 3+ newlines to 2 and trims trailing spaces per line.
 * Everything else (including double spaces and list markers) is kept.
 */
export function normalizeText(text: string): string {
  let out = text.replace(/\r\n?/g, "\n");
  out = out.replace(ZERO_WIDTH_RE, "").replace(SOFT_HYPHEN_RE, "");
  out = out.replace(UNUSUAL_SPACE_RE, " ");
  out = out.replace(MIXED_WORD_RE, (word) => {
    if (!LATIN_LETTER_RE.test(word) || !NON_LATIN_LETTER_RE.test(word)) return word;
    return word.replace(NON_LATIN_LETTER_RE, (ch) => HOMOGLYPH_MAP[ch] ?? ch);
  });
  out = out.replace(/[ \t]+$/gm, "");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out;
}

// ---------------------------------------------------------------------------
// Deterministic randomness
// ---------------------------------------------------------------------------

/** A seeded pseudo-random generator returning numbers in [0, 1). */
export type Rng = () => number;

/** Creates a mulberry32 generator seeded with a 32-bit integer. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a 32-bit string hash (unsigned). Stable across runtimes. */
export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Picks a uniformly random element; returns `undefined` for an empty array. */
export function pick<T>(rng: Rng, arr: readonly T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))];
}

// ---------------------------------------------------------------------------
// Small numeric helpers
// ---------------------------------------------------------------------------

/** Arithmetic mean (0 for an empty list). */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/** Population standard deviation (0 for fewer than two values). */
export function stdDev(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let acc = 0;
  for (const v of values) acc += (v - m) * (v - m);
  return Math.sqrt(acc / values.length);
}

/** Logistic function. */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Linearly maps `x` from [lo, hi] onto [0, 1], clamped. */
export function lin(x: number, lo: number, hi: number): number {
  if (hi === lo) return x >= hi ? 1 : 0;
  const t = (x - lo) / (hi - lo);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Copies the capitalization of `source`'s first letter onto `target`. */
export function matchCase(source: string, target: string): string {
  if (target.length === 0) return target;
  const first = source.charAt(0);
  if (isUpperLetter(first)) return target.charAt(0).toUpperCase() + target.slice(1);
  return target;
}

/** Uppercases the first letter of a string. */
export function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
