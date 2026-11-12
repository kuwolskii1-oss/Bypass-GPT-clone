/**
 * Claude-backed rewrite. Enabled when ANTHROPIC_API_KEY is set (or
 * PROSELY_ENGINE=claude); disable with PROSELY_ENGINE=local.
 *
 * The rewrite is detector-guided: after the first pass the local detector
 * scores the result, and if sentences still read as machine-written they are
 * sent back once with the specific reasons, so the model revises what was
 * actually flagged instead of rewriting blind.
 */
import Anthropic from "@anthropic-ai/sdk";
import { detectText } from "@/lib/engine";
import {
  PURPOSE_LABELS,
  READABILITY_LABELS,
  type DetectionResult,
  type HumanizeOptions,
} from "@/lib/engine/types";

const MODEL = process.env.PROSELY_CLAUDE_MODEL ?? "claude-opus-5-5";
const EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
type Effort = (typeof EFFORTS)[number];

function effort(): Effort {
  const v = process.env.PROSELY_CLAUDE_EFFORT;
  return (EFFORTS as ReadonlyArray<string>).includes(v ?? "") ? (v as Effort) : "medium";
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

export function claudeAvailable(): boolean {
  const engine = process.env.PROSELY_ENGINE;
  if (engine === "local") return false;
  return engine === "claude" || Boolean(process.env.ANTHROPIC_API_KEY);
}

export const SYSTEM_PROMPT = `You are the rewriting engine inside Prosely, a writing tool that makes AI-assisted drafts read the way a thoughtful person writes.

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

/** One model call; returns the reply text, or null when the model declined or returned nothing. */
export type Complete = (messages: Anthropic.Beta.BetaMessageParam[]) => Promise<string | null>;

const complete: Complete = async (messages) => {
  const stream = getClient().beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: effort() },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages,
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal" || message.stop_reason === "max_tokens") return null;
  const out = message.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
  return out.length > 0 ? out : null;
};

/** Scores at or above this still read as mixed, so a revision pass is worth its cost. */
const REVISE_AT = 35;

/**
 * Returns the rewritten text, or null if the model declined. `run` is
 * injectable so the two-pass flow can be tested without the network.
 */
export async function humanizeWithClaude(
  text: string,
  options: HumanizeOptions,
  run: Complete = complete,
): Promise<string | null> {
  const prompt = buildUserPrompt(text, options);
  const first = await run([{ role: "user", content: prompt }]);
  if (!first) return null;
  if (options.strength === "light") return first;

  const firstScore = detectText(first);
  const flagged = flaggedSentences(firstScore);
  if (firstScore.aiProbability < REVISE_AT || flagged.length === 0) return first;

  try {
    const revised = await run([
      { role: "user", content: prompt },
      { role: "assistant", content: first },
      { role: "user", content: buildRevisionPrompt(flagged) },
    ]);
    // Keep the revision only if it is a full text and scores better.
    if (revised && revised.length > first.length * 0.6 && detectText(revised).aiProbability < firstScore.aiProbability) {
      return revised;
    }
  } catch (e) {
    console.error("[prosely] Claude revision pass failed, keeping the first rewrite", e);
  }
  return first;
}
