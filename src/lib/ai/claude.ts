/**
 * Claude-backed rewrite. Enabled when ANTHROPIC_API_KEY is set (or
 * PROSELY_ENGINE=claude); disable with PROSELY_ENGINE=local.
 */
import Anthropic from "@anthropic-ai/sdk";
import {
  PURPOSE_LABELS,
  READABILITY_LABELS,
  type HumanizeOptions,
} from "@/lib/engine/types";

const MODEL = process.env.PROSELY_CLAUDE_MODEL ?? "claude-opus-5";
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

const SYSTEM_PROMPT = `You are the rewriting engine inside Prosely, a writing tool that makes AI-assisted drafts read the way a thoughtful person writes.

Rewrite the text you are given so it reads naturally: vary sentence length and rhythm, prefer concrete plain words over stock phrasing, drop filler and formulaic transitions, and use contractions where the register allows. Keep every fact, claim, number, name, quotation and citation exactly as given. Keep the paragraph structure, headings and lists. Keep the language of the input. Do not add information, commentary or a title.

Output only the rewritten text, with no preamble, notes or quotation marks around it.`;

const STRENGTH_GUIDE: Record<HumanizeOptions["strength"], string> = {
  light: "Light touch: change phrasing and rhythm only where it clearly helps; keep the author's structure and most of their wording.",
  balanced: "Balanced: reshape phrasing and sentence rhythm freely while keeping the argument and order of ideas intact.",
  aggressive:
    "Deep rewrite: restructure sentences and paragraphs as needed so the result reads as clearly human, while preserving meaning.",
};

function buildUserPrompt(text: string, options: HumanizeOptions): string {
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

/** Returns the rewritten text, or null if the model declined. */
export async function humanizeWithClaude(text: string, options: HumanizeOptions): Promise<string | null> {
  const stream = getClient().beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: effort() },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserPrompt(text, options) }],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") return null;
  const out = message.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
  return out.length > 0 ? out : null;
}
