/**
 * Prompts for model-based rewriting, shared by the server-side Claude engine
 * and the standalone page (which asks Claude through the artifact runtime).
 * Pure: no SDK imports, safe to bundle for the browser.
 */
import {
  PURPOSE_LABELS,
  READABILITY_LABELS,
  type DetectionResult,
  type HumanizeOptions,
} from "./types";

export const REWRITE_INSTRUCTIONS = `You are the rewriting engine inside Prosely, a writing tool that makes AI-assisted drafts read the way a thoughtful person writes.

Rewrite the text you are given so it reads as natural human prose. What makes a draft read as machine-written today is mostly structure, so change the structure as well as the words:

- Contrast framing. Drafts lean on "not X but Y", "It isn't X. It's Y.", "less about X and more about Y", and endings like "progress, not perfection". Say the positive claim directly; keep a contrast only where the text really argues against something.
- Tidy lists of three and paired abstractions ("clarity and focus"). Keep the items that carry information, in whatever number that is.
- Sentences that end by commenting on themselves (", highlighting the importance of ...") and sentences that announce a point before making it ("The real question is ...", "Here's the thing"). Make the point.
- Em-dash asides, stock transitions (Furthermore, Moreover, In conclusion) and filler vocabulary. Use plain connectives or none.
- Even rhythm. Let sentence length follow the content: some short, some long, as a person writing by hand would.
- Bold labels on list items and closing paragraphs that restate the piece.

Use contractions where the register allows. Prefer the concrete word the writer would actually use.

Keep every fact, claim, number, name, quotation and citation exactly as given. Keep the paragraph breaks, headings and lists. Keep the language and spelling variety of the input. Do not add information, opinions, examples or a title, and do not introduce errors to seem human.

Output only the rewritten text, with no preamble, notes or quotation marks around it.`;

const STRENGTH_GUIDE: Record<HumanizeOptions["strength"], string> = {
  light: "Light touch: change phrasing and rhythm only where it clearly helps; keep the author's structure and most of their wording.",
  balanced: "Balanced: reshape phrasing and sentence rhythm freely while keeping the argument and order of ideas intact.",
  aggressive:
    "Deep rewrite: restructure sentences, and paragraphs where needed, so the result reads as clearly human, while preserving meaning.",
};

export function buildUserPrompt(text: string, options: HumanizeOptions): string {
  const keep =
    options.keepKeywords && options.keepKeywords.length > 0
      ? `\nKeep these words and phrases exactly as written: ${options.keepKeywords.map((k) => `"${k}"`).join(", ")}.`
      : "";
  return `Target reading level: ${READABILITY_LABELS[options.readability]}.
Purpose: ${PURPOSE_LABELS[options.purpose]}.
${STRENGTH_GUIDE[options.strength]}${keep}

<text>
${text}
</text>`;
}

/** Sentences worth a second pass, with the reasons the detector gave. */
export function flaggedSentences(result: DetectionResult, limit = 12): { text: string; reasons: string[] }[] {
  return result.sentences
    .filter((s) => s.verdict !== "human" && s.text.trim().split(/\s+/).length >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ text: s.text.trim(), reasons: s.signals }));
}

export function buildRevisionPrompt(flagged: { text: string; reasons: string[] }[]): string {
  const list = flagged
    .map((f, i) => `${i + 1}. "${f.text}"${f.reasons.length ? `\n   Reads as machine-written because: ${f.reasons.join("; ")}.` : ""}`)
    .join("\n");
  return `A style check still reads these sentences from your rewrite as machine-written:

${list}

Revise the rewrite so these sentences read naturally, changing their structure where the reason is structural. Leave the rest as it is unless a change is needed for flow. Keep every fact, number, name, quotation and citation, and the same paragraph breaks, headings and lists. Output the complete revised text only.`;
}
