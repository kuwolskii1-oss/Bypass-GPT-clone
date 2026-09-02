import { describe, expect, it } from "vitest";
import { detectText } from "../detect";
import { humanizeText } from "../humanize";
import { SAMPLE_AI } from "../samples";
import { splitParagraphs, splitSentences, tokenizeWords } from "../text";
import { DEFAULT_HUMANIZE_OPTIONS, type HumanizeOptions } from "../types";

const base: HumanizeOptions = { ...DEFAULT_HUMANIZE_OPTIONS };

describe("humanizeText calibration", () => {
  it("aggressive rewrite drops the AI score substantially", () => {
    const r = humanizeText(SAMPLE_AI, { ...base, strength: "aggressive" });
    expect(r.after.aiProbability).toBeLessThanOrEqual(45);
    expect(r.after.verdict).not.toBe("ai");
    expect(r.before.aiProbability - r.after.aiProbability).toBeGreaterThanOrEqual(45);
  });

  it("balanced rewrite drops the AI score", () => {
    const r = humanizeText(SAMPLE_AI, { ...base, strength: "balanced" });
    expect(r.before.aiProbability - r.after.aiProbability).toBeGreaterThanOrEqual(25);
  });

  it("light rewrite still helps", () => {
    const r = humanizeText(SAMPLE_AI, { ...base, strength: "light" });
    expect(r.before.aiProbability - r.after.aiProbability).toBeGreaterThanOrEqual(5);
  });
});

describe("humanizeText invariants", () => {
  const r = humanizeText(SAMPLE_AI, { ...base, strength: "aggressive", keepKeywords: ["Prosely", "remote work"] });
  const text = `${SAMPLE_AI}\n\nProsely helps with remote work at https://prosely.app and via hello@prosely.app.`;
  const kept = humanizeText(text, { ...base, strength: "aggressive", keepKeywords: ["Prosely", "remote work"] });

  it("preserves paragraph count", () => {
    expect(splitParagraphs(r.text).length).toBe(splitParagraphs(SAMPLE_AI).length);
  });

  it("keeps protected keywords, urls and emails verbatim", () => {
    expect(kept.text).toContain("Prosely");
    expect(kept.text).toContain("https://prosely.app");
    expect(kept.text).toContain("hello@prosely.app");
    const before = (text.match(/remote work/gi) ?? []).length;
    const after = (kept.text.match(/remote work/gi) ?? []).length;
    expect(after).toBe(before);
    expect(kept.text).not.toMatch(/QQKEEP/);
  });

  it("produces clean text", () => {
    expect(r.text).not.toMatch(/ {2}/);
    expect(r.text).not.toMatch(/\s[,.]/);
    expect(r.text).not.toMatch(/,,|\.\.(?!\.)/);
    for (const s of splitSentences(r.text)) {
      const first = s.text.replace(/^["“'‘(\[]+/, "").charAt(0);
      if (/\p{L}/u.test(first)) expect(first).toBe(first.toUpperCase());
    }
  });

  it("keeps length and sentence count in a sane range", () => {
    const inWords = tokenizeWords(SAMPLE_AI).length;
    const outWords = tokenizeWords(r.text).length;
    expect(outWords).toBeGreaterThanOrEqual(inWords * 0.75);
    expect(outWords).toBeLessThanOrEqual(inWords * 1.25);
    const inS = splitSentences(SAMPLE_AI).length;
    const outS = splitSentences(r.text).length;
    expect(outS).toBeGreaterThanOrEqual(Math.floor(inS * 0.6));
    expect(outS).toBeLessThanOrEqual(Math.ceil(inS * 1.4));
  });

  it("reports edits and both detections", () => {
    expect(r.edits).toBeGreaterThan(10);
    expect(r.engine).toBe("local");
    expect(r.before).toEqual(detectText(SAMPLE_AI));
    expect(r.after).toEqual(detectText(r.text));
  });

  it("is deterministic per seed and varies across seeds", () => {
    const a = humanizeText(SAMPLE_AI, { ...base, seed: 1 });
    const b = humanizeText(SAMPLE_AI, { ...base, seed: 1 });
    const c = humanizeText(SAMPLE_AI, { ...base, seed: 2 });
    expect(a.text).toBe(b.text);
    expect(c.text).not.toBe(a.text);
  });

  it("respects a formal register", () => {
    const text =
      "It is clear that we have not finished. They are late and we cannot wait. There is no plan, so I am going home. It is not ideal. We will try again tomorrow, and you are welcome to join.";
    const formal = humanizeText(text, { ...base, readability: "doctorate", purpose: "legal", strength: "balanced" });
    const casual = humanizeText(text, { ...base, readability: "marketing", purpose: "marketing", strength: "balanced" });
    const count = (t: string) => (t.match(/\b\w+(?:n't|'s|'re|'ve|'ll|'d|'m)\b/g) ?? []).length;
    expect(count(casual.text)).toBeGreaterThan(count(formal.text));
  });

  it("handles 10,000 words quickly", () => {
    const big = Array.from({ length: 40 }, () => SAMPLE_AI).join("\n\n");
    expect(tokenizeWords(big).length).toBeGreaterThan(9000);
    const started = Date.now();
    const out = humanizeText(big, { ...base, strength: "aggressive" });
    expect(Date.now() - started).toBeLessThan(1500);
    expect(out.text.length).toBeGreaterThan(1000);
  });
});
