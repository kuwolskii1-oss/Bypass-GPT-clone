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
import { REWRITE_INSTRUCTIONS, buildRevisionPrompt, buildUserPrompt, flaggedSentences } from "@/lib/engine/prompts";
import type { HumanizeOptions } from "@/lib/engine/types";

export { buildRevisionPrompt, buildUserPrompt, flaggedSentences };

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

/** One model call; returns the reply text, or null when the model declined or returned nothing. */
export type Complete = (messages: Anthropic.Beta.BetaMessageParam[]) => Promise<string | null>;

const complete: Complete = async (messages) => {
  const stream = getClient().beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: effort() },
    system: [{ type: "text", text: REWRITE_INSTRUCTIONS, cache_control: { type: "ephemeral" } }],
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
