/**
 * Rule-based humanizer. Rewrites phrasing, rhythm and register while keeping
 * facts, structure and protected keywords intact. Deterministic for a given
 * input, options and seed.
 */
import { detectText } from "./detect";
import {
  AI_PHRASES,
  CONTRACTIONS,
  INTENSIFIER_RE,
  NOT_ONLY_RE,
  SIMPLIFY,
  findOpener,
} from "./lexicon";
import {
  capitalize,
  createRng,
  hashString,
  matchCase,
  normalizeText,
  pick,
  splitSentences,
  tokenizeWords,
  type Rng,
} from "./text";
import type { PhraseWeight } from "./lexicon";
import type { HumanizeOptions, HumanizeResult, Strength } from "./types";

interface Profile {
  minWeight: PhraseWeight;
  openerTier: PhraseWeight;
  contractionRate: number;
  dropIntensifiers: boolean;
  simplify: boolean;
  /** Split sentences longer than this many words (0 = never). */
  splitAt: number;
  /** Probability of joining an eligible pair of neighbouring sentences (0 = never). */
  varyChance: number;
  notOnly: boolean;
}

const THRESHOLD: Record<Strength, PhraseWeight> = { light: 2, balanced: 1, aggressive: 1 };
const SPLIT_AT: Record<Strength, number> = { light: 0, balanced: 26, aggressive: 22 };
const VARY_CHANCE: Record<Strength, number> = { light: 0, balanced: 0.3, aggressive: 0.5 };

function buildProfile(o: HumanizeOptions): Profile {
  let contractionRate = { "high-school": 0.85, university: 0.5, doctorate: 0.15, journalist: 0.8, marketing: 0.9 }[
    o.readability
  ];
  if (["story", "marketing", "cover-letter", "general"].includes(o.purpose)) contractionRate = Math.min(0.95, contractionRate + 0.1);
  if (["legal", "report"].includes(o.purpose)) contractionRate = Math.min(contractionRate, 0.15);
  if (["essay", "business", "article"].includes(o.purpose)) contractionRate = Math.min(contractionRate, 0.55);
  const simpleReader = ["high-school", "journalist", "marketing"].includes(o.readability);
  return {
    minWeight: THRESHOLD[o.strength],
    openerTier: THRESHOLD[o.strength],
    contractionRate,
    dropIntensifiers: o.strength !== "light" && o.purpose !== "marketing",
    simplify:
      o.readability !== "doctorate" &&
      o.purpose !== "legal" &&
      (o.strength === "aggressive" || (o.strength === "balanced" && simpleReader)),
    splitAt: SPLIT_AT[o.strength],
    varyChance: VARY_CHANCE[o.strength],
    notOnly: o.strength !== "light",
  };
}

// ---------------------------------------------------------------------------
// Protected spans (keywords, URLs, emails, inline code) are swapped for
// placeholders that no rule matches, then restored verbatim at the end.
// ---------------------------------------------------------------------------

const URL_RE = /\bhttps?:\/\/[^\s<>)\]]+|\b[\w.+-]+@[\w-]+\.[\w.-]+\b|`[^`\n]+`/g;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protect(text: string, keywords: string[]): { masked: string; restore: (s: string) => string } {
  const vault: string[] = [];
  const stash = (m: string) => {
    vault.push(m);
    return `QQKEEP${vault.length - 1}QQ`;
  };
  let masked = text.replace(URL_RE, stash);
  const sorted = [...new Set(keywords.map((k) => k.trim()).filter(Boolean))].sort((a, b) => b.length - a.length);
  for (const k of sorted) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(k)}(?![\\p{L}\\p{N}])`, "giu");
    masked = masked.replace(re, stash);
  }
  return {
    masked,
    restore: (s) => s.replace(/QQKEEP(\d+)QQ/g, (_, i: string) => vault[Number(i)] ?? ""),
  };
}

// ---------------------------------------------------------------------------
// Sentence-level transforms
// ---------------------------------------------------------------------------

function replacePhrases(s: string, minWeight: PhraseWeight, rng: Rng): string {
  let out = s;
  for (const p of AI_PHRASES) {
    if (p.weight < minWeight || p.replacements.length === 0) continue;
    p.pattern.lastIndex = 0;
    if (!p.pattern.test(out)) {
      p.pattern.lastIndex = 0;
      continue;
    }
    p.pattern.lastIndex = 0;
    out = out.replace(p.pattern, (m) => {
      const rep = pick(rng, p.replacements);
      return rep === undefined ? m : matchCase(m, rep);
    });
  }
  return out;
}

function replaceOpener(s: string, tier: PhraseWeight, rng: Rng, avoid: { last: string }): string {
  const opener = findOpener(s);
  if (!opener || opener.tier < tier) return s;
  const lead = /^["“'‘(\[]+/.exec(s)?.[0] ?? "";
  const body = s.slice(lead.length);
  let alt = pick(rng, opener.alternatives) ?? "";
  if (alt && alt === avoid.last && opener.alternatives.length > 1) {
    alt = opener.alternatives.find((a) => a !== alt) ?? alt;
  }
  avoid.last = alt;
  const rest = body.replace(opener.pattern, "");
  const joined = alt ? `${alt} ${rest}` : rest;
  return lead + capitalize(joined.replace(/^[\s,;:]+/, ""));
}

function applyContractions(s: string, rate: number, rng: Rng): string {
  if (rate <= 0) return s;
  let out = s;
  for (const [re, rep] of CONTRACTIONS) {
    out = out.replace(re, (m) => (rng() < rate ? matchCase(m, rep) : m));
  }
  return out;
}

function simplifyWords(s: string): string {
  let out = s;
  for (const rule of SIMPLIFY) {
    out = out.replace(rule.pattern, (m) => {
      const idx = rule.from.indexOf(m.toLowerCase());
      return idx < 0 ? m : matchCase(m, rule.to[idx]);
    });
  }
  return out;
}

function tidySentence(s: string): string {
  let out = s.replace(/[^\S\n]{2,}/g, " ").trim();
  out = out.replace(/\s+([,.;:!?])/g, "$1");
  out = out.replace(/([,;:])\1+/g, "$1");
  out = out.replace(/,\s*([.!?])/g, "$1");
  out = out.replace(/^[,;:.\s]+/, "");
  out = out.replace(/\(\s+/g, "(").replace(/\s+\)/g, ")");
  out = out.replace(/\b([Aa])(?=\s+[aeiouAEIOU])/g, "$1n").replace(/\b([Aa])n(?=\s+[^aeiouAEIOU\s\d])/g, "$1");
  return capitalize(out);
}

const SUBJECT_STARTS =
  /^(?:the|this|these|those|it|its|it's|they|we|i|you|he|she|there|a|an|our|their|my|your|many|most|some|each|every|people|companies|teams|students|that)\b/i;
const NO_MERGE_STARTS =
  /^(?:but|and|so|then|also|plus|still|yet|besides|however|that said|what's more|on top of that|all in all|in the end|in short|first|second|third|finally|lastly|for example|say|like|[^\p{L}])/iu;

/** Lowercases a sentence's first word unless it looks like a proper noun. */
function lowerFirst(b: string, proper: Set<string>): string {
  const first = /^[\p{L}'’-]+/u.exec(b)?.[0] ?? "";
  if (first === "I" || proper.has(first)) return b;
  return b.charAt(0).toLowerCase() + b.slice(1);
}

/** Words that appear capitalised somewhere other than a sentence start. */
function collectProperNouns(text: string): Set<string> {
  const set = new Set<string>();
  for (const span of splitSentences(text)) {
    const tokens = tokenizeWords(span.text);
    for (const t of tokens.slice(1)) if (/^\p{Lu}/u.test(t) && t !== "I") set.add(t);
  }
  return set;
}

function splitLong(s: string, rng: Rng, splitAt: number): string[] {
  const words = tokenizeWords(s).length;
  if (splitAt <= 0 || words < splitAt - 6) return [s];
  const long = words >= splitAt;
  const candidates: { index: number; length: number; replacement: string }[] = [];
  const push = (re: RegExp, make: (m: RegExpExecArray) => string | null) => {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s)) !== null) {
      const rep = make(m);
      if (rep !== null) candidates.push({ index: m.index, length: m[0].length, replacement: rep });
    }
  };
  // A trailing "which" clause makes a natural short sentence at any length.
  push(/,\s+which\s+/g, () => `. ${pick(rng, ["This", "That"]) ?? "This"} `);
  if (long) {
    push(/;\s+/g, () => ". ");
    push(/,\s+(and|but|so|yet)\s+(?=([\p{L}'’]+))/gu, (m) => {
      const next = m[2] ?? "";
      if (!SUBJECT_STARTS.test(next)) return null;
      return m[1] === "and" ? ". " : `. ${capitalize(m[1])} `;
    });
  }
  if (candidates.length === 0) return [s];
  const mid = s.length / 2;
  candidates.sort((a, b) => Math.abs(a.index - mid) - Math.abs(b.index - mid));
  const c = candidates[0];
  if (c.index < 20 || s.length - (c.index + c.length) < 16) return [s];
  const head = s.slice(0, c.index).replace(/[,;\s]+$/, "");
  const tail = s.slice(c.index + c.length);
  const sep = c.replacement.trim();
  // Only capitalise when the tail starts the new sentence; after "This"/"That" it stays lowercase.
  return [`${head}.`, sep === "." ? capitalize(tail) : `${sep} ${tail}`.replace(/\s+/g, " ")];
}

const CONNECTOR_JOIN: ReadonlyArray<readonly [RegExp, string]> = [
  [/^(?:so|because of (?:that|this)|as a result|that's why|this way|consequently|therefore)[,:]?\s+/i, ", so "],
  [/^(?:still|but|even so|that said|then again|by contrast|on the flip side|however|yet)[,:]?\s+/i, ", but "],
  [/^(?:also|and|plus|what's more|on top of that|besides|likewise|in the same way|similarly)[,:]?\s+/i, ", and "],
  [/^(?:then|after that|next|later)[,:]?\s+/i, ", then "],
];

/** Joins two sentences into one clause pair, folding a leading connector into the join. */
function joinPair(a: string, b: string, proper: Set<string>): string | null {
  const head = a.replace(/\.$/, "");
  for (const [re, joiner] of CONNECTOR_JOIN) {
    const m = re.exec(b);
    if (m) return `${head}${joiner}${lowerFirst(b.slice(m[0].length), proper)}`;
  }
  if (NO_MERGE_STARTS.test(b)) return null;
  return `${head}, and ${lowerFirst(b, proper)}`;
}

/**
 * Joins some neighbouring sentences so lengths vary more, the way human prose
 * does. `chance` controls how often a candidate pair is merged.
 */
function varyRhythm(sentences: string[], rng: Rng, proper: Set<string>, chance: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const a = sentences[i];
    const b = sentences[i + 1];
    if (b === undefined) {
      out.push(a);
      continue;
    }
    const la = tokenizeWords(a).length;
    const lb = tokenizeWords(b).length;
    const eligible = la >= 4 && la <= 18 && lb >= 4 && lb <= 18 && la + lb <= 34 && /\.$/.test(a) && /^\p{L}/u.test(b);
    const joined = eligible && rng() < chance ? joinPair(a, b, proper) : null;
    if (joined) {
      out.push(joined);
      i++;
    } else {
      out.push(a);
    }
  }
  return out;
}

function rewriteSegment(segment: string, profile: Profile, rng: Rng, proper: Set<string>): string {
  const spans = splitSentences(segment);
  if (spans.length === 0) return segment;
  let sentences = spans.map((sp) => sp.text);
  const avoid = { last: "" };

  sentences = sentences.map((s) => {
    let out = replacePhrases(s, profile.minWeight, rng);
    if (profile.notOnly) out = out.replace(NOT_ONLY_RE, (_, x: string) => `${x.trim()} and `);
    out = replaceOpener(out, profile.openerTier, rng, avoid);
    out = applyContractions(out, profile.contractionRate, rng);
    if (profile.dropIntensifiers) out = out.replace(INTENSIFIER_RE, (m) => (rng() < 0.7 ? "" : m));
    if (profile.simplify) out = simplifyWords(out);
    return out;
  });

  sentences = sentences.flatMap((s) => splitLong(s, rng, profile.splitAt));
  if (profile.varyChance > 0) sentences = varyRhythm(sentences, rng, proper, profile.varyChance);

  return sentences.map(tidySentence).filter((s) => s.length > 0).join(" ");
}

const LINE_PREFIX_RE = /^(\s*(?:[-*•]|\d+[.)]|#{1,6})\s+)/;

function rewriteText(text: string, profile: Profile, rng: Rng): string {
  const proper = collectProperNouns(text);
  let inCode = false;
  return text
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) {
        inCode = !inCode;
        return line;
      }
      if (inCode || line.trim().length === 0) return line;
      const prefix = LINE_PREFIX_RE.exec(line)?.[1] ?? "";
      const body = line.slice(prefix.length);
      return prefix + rewriteSegment(body, profile, rng, proper);
    })
    .join("\n");
}

/** Capitalises sentence starts whose first word is entirely lowercase (leaves "iPhone"-style words alone). */
function capitalizeSentenceStarts(text: string): string {
  return text.replace(/(^|[.!?]["”')\]]*[^\S\n]+|\n[^\S\n]*(?:[-*•]|\d+[.)]|#{1,6})?[^\S\n]*)([a-z])(?=[a-z'’-]*\b)/g, (_, pre: string, ch: string) => pre + ch.toUpperCase());
}

/** Approximate number of changed words between two texts (bag-of-words diff). */
export function countEdits(before: string, after: string): number {
  const bag = new Map<string, number>();
  for (const t of tokenizeWords(before)) bag.set(t.toLowerCase(), (bag.get(t.toLowerCase()) ?? 0) + 1);
  let added = 0;
  for (const t of tokenizeWords(after)) {
    const k = t.toLowerCase();
    const n = bag.get(k) ?? 0;
    if (n > 0) bag.set(k, n - 1);
    else added++;
  }
  let removed = 0;
  for (const n of bag.values()) removed += n;
  return Math.max(added, removed);
}

/** Rewrite `text` according to `options`. Deterministic for the same input, options and seed. */
export function humanizeText(text: string, options: HumanizeOptions): HumanizeResult {
  const original = text;
  const normalized = normalizeText(text);
  const rng = createRng((hashString(normalized) ^ Math.imul(options.seed ?? 1, 2654435761)) >>> 0);
  const profile = buildProfile(options);
  const { masked, restore } = protect(normalized, options.keepKeywords ?? []);
  const rewritten = capitalizeSentenceStarts(restore(rewriteText(masked, profile, rng)));
  const result = rewritten.replace(/[^\S\n]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return {
    text: result,
    original,
    edits: countEdits(original, result),
    options,
    before: detectText(original),
    after: detectText(result),
    engine: "local",
  };
}
