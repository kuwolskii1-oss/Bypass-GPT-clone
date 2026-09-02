/**
 * Humanizer provider. Uses Claude when configured, otherwise the built-in
 * rule-based engine. Detection is always local so results are deterministic.
 */
import { claudeAvailable, humanizeWithClaude } from "@/lib/ai/claude";
import { diffWords } from "@/lib/diff";
import { detectText, humanizeText } from "@/lib/engine";
import type { HumanizeOptions, HumanizeResult } from "@/lib/engine/types";
import { countWords } from "@/lib/utils";

function countEdits(before: string, after: string): number {
  let inserted = 0;
  let deleted = 0;
  for (const op of diffWords(before, after)) {
    if (op.type === "insert") inserted += countWords(op.text);
    else if (op.type === "delete") deleted += countWords(op.text);
  }
  return Math.max(inserted, deleted);
}

export async function humanize(text: string, options: HumanizeOptions): Promise<HumanizeResult> {
  if (claudeAvailable()) {
    try {
      const rewritten = await humanizeWithClaude(text, options);
      if (rewritten) {
        return {
          text: rewritten,
          original: text,
          edits: countEdits(text, rewritten),
          options,
          before: detectText(text),
          after: detectText(rewritten),
          engine: "claude",
        };
      }
    } catch (e) {
      console.error("[prosely] Claude rewrite failed, using local engine", e);
    }
  }
  return humanizeText(text, options);
}
