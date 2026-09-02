import { describe, expect, it } from "vitest";
import { findHiddenCharacters, normalizeText, splitSentences, tokenizeWords } from "../text";

describe("splitSentences", () => {
  it("keeps offsets that map back to the original text", () => {
    const text = "Dr. Smith arrived at 3.5 p.m. on Jan. 4! He said \"hello.\" Then he left? Yes.\n\n- A bullet line\nAnother line.";
    const spans = splitSentences(text);
    expect(spans.length).toBeGreaterThanOrEqual(5);
    for (const s of spans) expect(text.slice(s.start, s.end)).toBe(s.text);
    const rebuilt = spans.map((s) => s.text).join("");
    const stripped = text.replace(/\s+/g, "");
    expect(rebuilt.replace(/\s+/g, "")).toBe(stripped);
  });

  it("does not split on common abbreviations or decimals", () => {
    const spans = splitSentences("We met Mr. Jones at 10.30 a.m. yesterday. It went well.");
    expect(spans).toHaveLength(2);
  });
});

describe("hidden characters", () => {
  it("counts zero-width characters and normalises them away", () => {
    const text = "Hel​lo wo­rld";
    const report = findHiddenCharacters(text);
    expect(report.zeroWidth).toBe(1);
    expect(report.softHyphens).toBe(1);
    expect(normalizeText(text)).toBe("Hello world");
  });
});

describe("tokenizeWords", () => {
  it("keeps apostrophes and hyphens inside words", () => {
    expect(tokenizeWords("It's a well-known fact.")).toEqual(["It's", "a", "well-known", "fact"]);
  });
});
