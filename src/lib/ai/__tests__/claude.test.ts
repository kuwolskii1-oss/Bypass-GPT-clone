import { describe, expect, it } from "vitest";
import { detectText } from "@/lib/engine";
import { SAMPLE_AI, SAMPLE_HUMAN } from "@/lib/engine/samples";
import { DEFAULT_HUMANIZE_OPTIONS } from "@/lib/engine/types";
import { buildRevisionPrompt, flaggedSentences, humanizeWithClaude, type Complete } from "../claude";

const options = { ...DEFAULT_HUMANIZE_OPTIONS, strength: "balanced" as const };

function scripted(replies: (string | null)[]): { run: Complete; calls: Parameters<Complete>[0][] } {
  const calls: Parameters<Complete>[0][] = [];
  const run: Complete = async (messages) => {
    calls.push(messages);
    return replies[calls.length - 1] ?? null;
  };
  return { run, calls };
}

describe("detector-guided Claude rewrite", () => {
  it("returns the first pass when it already reads as human", async () => {
    const { run, calls } = scripted([SAMPLE_HUMAN]);
    expect(await humanizeWithClaude(SAMPLE_AI, options, run)).toBe(SAMPLE_HUMAN);
    expect(calls).toHaveLength(1);
  });

  it("sends flagged sentences back once, with reasons, and keeps the better revision", async () => {
    const revision = `${SAMPLE_HUMAN}\n\n${SAMPLE_HUMAN}`;
    const { run, calls } = scripted([SAMPLE_AI, revision]);
    expect(await humanizeWithClaude(SAMPLE_AI, options, run)).toBe(revision);
    expect(calls).toHaveLength(2);
    expect(calls[1]).toHaveLength(3);
    expect(calls[1][1]).toEqual({ role: "assistant", content: SAMPLE_AI });
    const followUp = String(calls[1][2].content);
    expect(followUp).toMatch(/Reads as machine-written because/);
    expect(followUp).toMatch(/AI phrase|Opens with/);
  });

  it("keeps the first pass when the revision is worse, truncated or declined", async () => {
    const better = SAMPLE_AI.replace(/Furthermore, |Moreover, |Additionally, |Consequently, /g, "");
    expect(await humanizeWithClaude(SAMPLE_AI, options, scripted([better, SAMPLE_AI]).run)).toBe(better);
    expect(await humanizeWithClaude(SAMPLE_AI, options, scripted([better, "Too short."]).run)).toBe(better);
    expect(await humanizeWithClaude(SAMPLE_AI, options, scripted([better, null]).run)).toBe(better);
  });

  it("skips the revision pass for light rewrites and reports a refusal as null", async () => {
    const light = scripted([SAMPLE_AI]);
    await humanizeWithClaude(SAMPLE_AI, { ...options, strength: "light" }, light.run);
    expect(light.calls).toHaveLength(1);
    expect(await humanizeWithClaude(SAMPLE_AI, options, scripted([null]).run)).toBeNull();
  });

  it("lists the highest-scoring sentences first", () => {
    const flagged = flaggedSentences(detectText(SAMPLE_AI), 3);
    expect(flagged).toHaveLength(3);
    expect(buildRevisionPrompt(flagged)).toContain(flagged[0].text);
  });
});
