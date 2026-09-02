import { describe, expect, it } from "vitest";
import { detectText } from "../detect";
import { SAMPLE_AI, SAMPLE_HUMAN, SAMPLE_MIXED } from "../samples";
import { DETECTORS } from "../types";

describe("detectText calibration", () => {
  it("scores the AI-style essay high", () => {
    const r = detectText(SAMPLE_AI);
    expect(r.aiProbability).toBeGreaterThanOrEqual(80);
    expect(r.verdict).toBe("ai");
    expect(r.confidence).toBe("high");
    expect(r.tooShort).toBe(false);
  });

  it("scores the casual human post low", () => {
    const r = detectText(SAMPLE_HUMAN);
    expect(r.aiProbability).toBeLessThanOrEqual(30);
    expect(r.verdict).toBe("human");
  });

  it("scores the mixed piece in the middle", () => {
    const r = detectText(SAMPLE_MIXED);
    expect(r.aiProbability).toBeGreaterThanOrEqual(35);
    expect(r.aiProbability).toBeLessThanOrEqual(75);
    expect(r.breakdown.ai + r.breakdown.mixed).toBeGreaterThan(0);
    expect(r.breakdown.human).toBeGreaterThan(0);
  });
});

describe("detectText shape", () => {
  it("returns sentence offsets into the original text", () => {
    const r = detectText(SAMPLE_AI);
    for (const s of r.sentences) expect(SAMPLE_AI.slice(s.start, s.end)).toBe(s.text);
    expect(r.sentences.map((s) => s.index)).toEqual(r.sentences.map((_, i) => i));
  });

  it("returns every detector in display order", () => {
    const r = detectText(SAMPLE_AI);
    expect(r.detectors.map((d) => d.id)).toEqual(DETECTORS.map((d) => d.id));
    for (const d of r.detectors) {
      expect(d.aiScore).toBeGreaterThanOrEqual(0);
      expect(d.aiScore).toBeLessThanOrEqual(100);
    }
  });

  it("marks Turnitin unavailable under 300 words", () => {
    const r = detectText(SAMPLE_HUMAN);
    const turnitin = r.detectors.find((d) => d.id === "turnitin");
    expect(turnitin?.unavailable).toBe(true);
  });

  it("handles a single sentence and empty input", () => {
    const one = detectText("This is a short sentence about nothing much at all.");
    expect(one.tooShort).toBe(true);
    expect(one.confidence).toBe("low");
    const empty = detectText("");
    expect(empty.aiProbability).toBe(0);
    expect(empty.sentences).toHaveLength(0);
    expect(() => detectText("   \n\n  ")).not.toThrow();
  });

  it("flags hidden characters", () => {
    const r = detectText(`${SAMPLE_HUMAN.slice(0, 200)}​​ rest of the text goes here for length.`);
    expect(r.flags.some((f) => f.id === "hidden-characters")).toBe(true);
  });

  it("is deterministic", () => {
    expect(detectText(SAMPLE_MIXED)).toEqual(detectText(SAMPLE_MIXED));
  });
});
