/**
 * Rule-based humanizer. Rewrites phrasing, rhythm and register while keeping
 * facts, structure and protected keywords intact. Deterministic for a given
 * input, options and seed.
 */
import { detectText } from "./detect";
import {
  AI_PHRASES,
  CASUAL_ALTERNATIVES,
  CONTRACTIONS,
  INTENSIFIER_RE,
  NOT_ONLY_REWRITE_RE,
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
import type { DetectionResult, HumanizeOptions, HumanizeResult, Strength } from "./types";

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
  /** Skip chatty alternatives ("Plus,", "folks") in formal registers. */
  formal: boolean;
}

const THRESHOLD: Record<Strength, PhraseWeight> = { light: 2, balanced: 1, aggressive: 1 };
const SPLIT_AT: Record<Strength, number> = { light: 0, balanced: 26, aggressive: 22 };
const VARY_CHANCE: Record<Strength, number> = { light: 0, balanced: 0.35, aggressive: 0.6 };
const FORMAL_PURPOSES: ReadonlySet<string> = new Set(["essay", "report", "business", "legal", "cover-letter"]);

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
    formal: o.readability === "doctorate" || FORMAL_PURPOSES.has(o.purpose),
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
    restore: (s) => s.replace(/QQKEEP(\d+)QQ/gi, (_, i: string) => vault[Number(i)] ?? ""),
  };
}

// ---------------------------------------------------------------------------
// Sentence-level transforms
// ---------------------------------------------------------------------------

/** Filters chatty alternatives out in formal registers; falls back to the full list. */
function alternatives(list: string[], formal: boolean): string[] {
  if (!formal) return list;
  const pool = list.filter((r) => !CASUAL_ALTERNATIVES.has(r.toLowerCase().replace(/[,:.]\s*$/, "")));
  return pool.length > 0 ? pool : list;
}

function replacePhrases(s: string, profile: Profile, rng: Rng): string {
  let out = s;
  // A sentence-initial transition ("Furthermore, ...") is left to replaceOpener,
  // which handles the comma and avoids repeating the same alternative.
  const lead = /^["“'‘(\[]+/.exec(s)?.[0].length ?? 0;
  const hasOpener = Boolean(findOpener(s));
  for (const p of AI_PHRASES) {
    if (p.weight < profile.minWeight || p.replacements.length === 0) continue;
    p.pattern.lastIndex = 0;
    if (!p.pattern.test(out)) {
      p.pattern.lastIndex = 0;
      continue;
    }
    p.pattern.lastIndex = 0;
    const pool = alternatives(p.replacements, profile.formal);
    out = out.replace(p.pattern, (m: string, ...rest: unknown[]) => {
      const offset = rest.find((v): v is number => typeof v === "number") ?? -1;
      if (hasOpener && offset <= lead) return m;
      const rep = pick(rng, pool);
      return rep === undefined ? m : matchCase(m, rep);
    });
  }
  return out;
}

function replaceOpener(s: string, tier: PhraseWeight, rng: Rng, avoid: { last: string }, formal: boolean): string {
  const opener = findOpener(s);
  if (!opener || opener.tier < tier) return s;
  const lead = /^["“'‘(\[]+/.exec(s)?.[0] ?? "";
  const body = s.slice(lead.length);
  const pool = alternatives(opener.alternatives, formal);
  let alt = pick(rng, pool) ?? "";
  if (alt && alt === avoid.last && pool.length > 1) {
    alt = pool.find((a) => a !== alt) ?? alt;
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

/** Words that can open a clause as its grammatical subject. */
const CLAUSE_SUBJECT =
  /^(?:the|this|these|those|it|its|it's|they|we|i|you|he|she|there|a|an|our|their|my|your|his|her|many|most|some|each|every|people|companies|teams|students|that|one|no|all|both|several|few|everyone|everything|nothing|nobody|someone|something|when|if)\b/i;
const NO_MERGE_STARTS =
  /^(?:but|and|so|then|also|plus|still|yet|besides|however|that said|what's more|on top of that|all in all|in the end|in short|first|second|third|finally|lastly|for example|say|like|rather than|whether|although|though|while|because|if|when|since|unless|instead of|despite|without|[^\p{L}])/iu;
/** Greetings, thanks and instructions read oddly with a clause tacked on. */
const NO_JOIN_HEAD = /^(?:thank|thanks|please|dear|hi|hello|hey|note|remember|imagine|consider|welcome|congratulations|let's)\b/i;
/** A comma followed by a finite verb means a relative clause sits in the middle of the main clause. */
const EMBEDDED_CLAUSE_RE = /,\s+(?:was|were|is|are|has|have|had|can|could|will|would|should|may|might|must|does|did|do)\b/i;

/** Lowercases a sentence's first word unless it looks like a proper noun. */
function lowerFirst(b: string, proper: Set<string>): string {
  const first = /^[\p{L}'’-]+/u.exec(b)?.[0] ?? "";
  if (/^I(?:['’](?:m|ve|ll|d))?$/.test(first) || /^QQKEEP\d+QQ/.test(b) || proper.has(first)) return b;
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

/** Common instruction openers; a clause that starts with one is an imperative, not a statement. */
const IMPERATIVE_STARTS = new Set([
  "start", "be", "make", "keep", "try", "use", "take", "consider", "remember", "avoid", "ensure", "check", "follow",
  "choose", "select", "add", "remove", "click", "go", "get", "let", "think", "imagine", "note", "see", "look", "read",
  "write", "focus", "set", "put", "give", "ask", "stop", "learn", "build", "create", "find", "plan", "prepare", "water",
  "plant", "mix", "stir", "apply", "visit", "call", "contact", "sign", "join", "share", "download", "install", "run",
  "open", "close", "turn", "press", "hold", "wait", "watch", "listen", "pick", "cut", "fill", "place", "leave", "bring",
  "send", "pay", "buy", "order", "book", "compare", "review", "treat", "aim", "allow", "always", "never", "just",
  "simply", "please", "do", "don't", "do not", "thank", "thanks", "enjoy", "explore", "discover", "experience", "say",
  "tell", "show", "help", "save", "spend", "invest", "measure", "test", "track", "report", "describe", "explain",
  "include", "combine", "replace", "repeat", "rinse", "serve", "cover", "bake", "cook", "heat", "cool", "store",
  "boost", "upgrade", "improve", "transform", "unlock", "meet", "picture", "grab", "unleash", "elevate", "introducing",
]);

/** True when a clause reads as an instruction ("Start small.") rather than a statement. */
function looksImperative(b: string): boolean {
  const first = /^[\p{L}'’-]+/u.exec(b)?.[0] ?? "";
  if (first === "I") return false;
  const two = /^[\p{L}'’-]+\s+[\p{L}'’-]+/u.exec(b)?.[0].toLowerCase() ?? "";
  return IMPERATIVE_STARTS.has(first.toLowerCase()) || IMPERATIVE_STARTS.has(two);
}

/** Pronoun that stands in for a "which" clause once it becomes its own sentence. */
function whichPronoun(next: string, rng: Rng): string {
  if (/^(?:were|are|have)$/i.test(next)) return "They";
  if (/^(?:was|is|has)$/i.test(next)) return "It";
  return pick(rng, ["This", "That"]) ?? "This";
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
  // A trailing "which" clause makes a natural short sentence at any length, as long
  // as it is not embedded in the middle of the main clause.
  push(/,\s+which\s+(?=([\p{L}'’]+))/gu, (m) => {
    if (tokenizeWords(s.slice(0, m.index)).length < 6) return null;
    if (EMBEDDED_CLAUSE_RE.test(s.slice(m.index + m[0].length))) return null;
    return `. ${whichPronoun(m[1] ?? "", rng)} `;
  });
  if (long) {
    // Semicolons are a human touch; only break them in very long sentences.
    if (words >= splitAt + 8) push(/;\s+/g, () => ". ");
    push(/,\s+(and|but|so|yet)\s+(?=([\p{L}'’]+))/gu, (m) => {
      if (!CLAUSE_SUBJECT.test(m[2] ?? "")) return null;
      return m[1] === "and" ? ". " : `. ${capitalize(m[1])} `;
    });
    push(/,\s+(although|though|even though|whereas|while)\s+(?=([\p{L}'’]+))/gu, (m) => {
      if (!CLAUSE_SUBJECT.test(m[2] ?? "")) return null;
      return m[1] === "whereas" || m[1] === "while" ? ". Meanwhile, " : ". That said, ";
    });
  }
  if (candidates.length === 0) return [s];
  // Prefer the most uneven split that leaves a few words on each side: a long
  // sentence followed by a short one reads more like a person than two halves.
  const viable = candidates.filter(
    (c) => tokenizeWords(s.slice(0, c.index)).length >= 5 && tokenizeWords(s.slice(c.index + c.length)).length >= 4,
  );
  if (viable.length === 0) return [s];
  const mid = s.length / 2;
  viable.sort((a, b) => Math.abs(b.index - mid) - Math.abs(a.index - mid));
  const c = viable[0];
  const head = s.slice(0, c.index).replace(/[,;\s]+$/, "");
  const tail = s.slice(c.index + c.length);
  const sep = c.replacement.trim();
  // Only capitalise when the tail starts the new sentence; after a pronoun it stays lowercase.
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
  if (NO_JOIN_HEAD.test(a) || looksImperative(a)) return null;
  const head = a.replace(/\.$/, "");
  for (const [re, joiner] of CONNECTOR_JOIN) {
    const m = re.exec(b);
    if (m) return `${head}${joiner}${lowerFirst(b.slice(m[0].length), proper)}`;
  }
  // Without a connector an instruction must stay its own sentence, or "..., and start small" slips through.
  if (NO_MERGE_STARTS.test(b) || looksImperative(b)) return null;
  return `${head}, and ${lowerFirst(b, proper)}`;
}

/**
 * Joins some neighbouring sentences so lengths vary more, the way human prose
 * does. `chance` controls how often a candidate pair is merged; a sentence that
 * was just split off its neighbour is never glued back on.
 */
function varyRhythm(sentences: string[], rng: Rng, proper: Set<string>, chance: number, fromSplit: boolean[]): string[] {
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
    const commas = (a.match(/,/g)?.length ?? 0) + (b.match(/,/g)?.length ?? 0);
    const eligible =
      !fromSplit[i] &&
      !fromSplit[i + 1] &&
      la >= 4 &&
      la <= 20 &&
      lb >= 4 &&
      lb <= 20 &&
      la + lb <= 34 &&
      commas <= 3 &&
      /\.$/.test(a) &&
      /^\p{L}/u.test(b);
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

function rewriteSegment(
  segment: string,
  profile: Profile,
  rng: Rng,
  proper: Set<string>,
  avoid: { last: string },
): string {
  const spans = splitSentences(segment);
  if (spans.length === 0) return segment;

  const rewritten = spans.map((sp) => {
    let out = replacePhrases(sp.text, profile, rng);
    if (profile.notOnly) out = out.replace(NOT_ONLY_REWRITE_RE, (_, x: string) => `${x.trim()} and `);
    out = replaceOpener(out, profile.openerTier, rng, avoid, profile.formal);
    out = applyContractions(out, profile.contractionRate, rng);
    if (profile.dropIntensifiers) out = out.replace(INTENSIFIER_RE, (m) => (rng() < 0.7 ? "" : m));
    if (profile.simplify) out = simplifyWords(out);
    return out;
  });

  let sentences: string[] = [];
  const fromSplit: boolean[] = [];
  for (const s of rewritten) {
    splitLong(s, rng, profile.splitAt).forEach((part, i) => {
      sentences.push(part);
      fromSplit.push(i > 0);
    });
  }
  if (profile.varyChance > 0) sentences = varyRhythm(sentences, rng, proper, profile.varyChance, fromSplit);

  return sentences.map(tidySentence).filter((s) => s.length > 0).join(" ");
}

const LINE_PREFIX_RE = /^(\s*(?:[-*•]|\d+[.)]|#{1,6})\s+)/;

function rewriteText(text: string, profile: Profile, rng: Rng): string {
  const proper = collectProperNouns(text);
  const avoid = { last: "" };
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
      return prefix + rewriteSegment(body, profile, rng, proper, avoid);
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

/** Texts up to this many words get several candidate rewrites; the lowest-scoring one wins. */
const BEST_OF_MAX_WORDS = 3000;
const BEST_OF = 5;

function rewriteOnce(normalized: string, options: HumanizeOptions, profile: Profile, seed: number): string {
  const rng = createRng((hashString(normalized) ^ Math.imul(seed, 2654435761)) >>> 0);
  const { masked, restore } = protect(normalized, options.keepKeywords ?? []);
  const rewritten = capitalizeSentenceStarts(restore(rewriteText(masked, profile, rng)));
  return rewritten.replace(/[^\S\n]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Rewrite `text` according to `options`. Deterministic for the same input,
 * options and seed. Because the rule engine makes random choices (which
 * alternative, which sentences to join), a few variants are generated and the
 * one our detector scores lowest is returned; "Re-humanize" changes the seed
 * and so the set of variants.
 */
export function humanizeText(text: string, options: HumanizeOptions): HumanizeResult {
  const original = text;
  const normalized = normalizeText(text);
  const profile = buildProfile(options);
  const seed = options.seed ?? 1;
  const tries = tokenizeWords(normalized).length <= BEST_OF_MAX_WORDS ? BEST_OF : 1;
  let best: { text: string; after: DetectionResult } | null = null;
  for (let i = 0; i < tries; i++) {
    const candidate = rewriteOnce(normalized, options, profile, seed + i * 7919);
    const after = detectText(candidate);
    if (!best || after.aiProbability < best.after.aiProbability) best = { text: candidate, after };
  }
  const result = best?.text ?? normalized;
  return {
    text: result,
    original,
    edits: countEdits(original, result),
    options,
    before: detectText(original),
    after: best?.after ?? detectText(result),
    engine: "local",
  };
}
