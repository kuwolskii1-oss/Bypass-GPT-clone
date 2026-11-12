import { describe, expect, it } from "vitest";
import { detectText } from "../detect";
import { humanizeText } from "../humanize";
import { splitParagraphs, splitSentences } from "../text";
import { DEFAULT_HUMANIZE_OPTIONS, type HumanizeOptions } from "../types";
import { CHATGPT_FIXTURES } from "./fixtures";

const base: HumanizeOptions = { ...DEFAULT_HUMANIZE_OPTIONS };
const aggressive: HumanizeOptions = { ...base, strength: "aggressive" };

function byId(id: string): string {
  const f = CHATGPT_FIXTURES.find((x) => x.id === id);
  if (!f) throw new Error(`missing fixture ${id}`);
  return f.text;
}

describe("humanizer on ChatGPT-style outputs", () => {
  for (const f of CHATGPT_FIXTURES) {
    const before = detectText(f.text);
    it(`keeps ${f.id} clean and well-formed`, () => {
      const r = humanizeText(f.text, aggressive);
      expect(r.text).not.toMatch(/QQKEEP/);
      expect(r.text).not.toMatch(/ {2}/);
      expect(r.text).not.toMatch(/\s[,.]/);
      expect(r.text).not.toMatch(/,,|\.\.(?!\.)/);
      expect(splitParagraphs(r.text).length).toBe(splitParagraphs(f.text).length);
      for (const s of splitSentences(r.text)) {
        const first = s.text.replace(/^["“'‘(\[]+/, "").charAt(0);
        if (/\p{L}/u.test(first)) expect(first).toBe(first.toUpperCase());
      }
      // Opener replacements never leave a stray comma ("And, social media...").
      expect(r.text).not.toMatch(/\bAnd,\s+[a-z]/);
    });
    if (before.aiProbability >= 60) {
      it(`drops the score of ${f.id} (${before.aiProbability}%)`, () => {
        const r = humanizeText(f.text, aggressive);
        // Rules lower every formulaic text; how far depends on how much of it is structure they can reach.
        expect(before.aiProbability - r.after.aiProbability).toBeGreaterThanOrEqual(15);
      });
    }
  }
});

describe("rewrite rules that used to misfire", () => {
  it("does not flatten an inverted 'not only does it...'", () => {
    const r = humanizeText(byId("howto"), aggressive);
    expect(r.text).not.toMatch(/\bDoes it (?:provide|give|offer)\b/);
    expect(r.text).toMatch(/not only does it/i);
  });

  it("keeps verb agreement and does not split an embedded 'which' clause", () => {
    const r = humanizeText(byId("history-essay"), aggressive);
    expect(r.text).not.toMatch(/\bThis were\b|\bThat were\b/);
    expect(r.text).not.toMatch(/Industrial Revolution\. (?:This|That|It) began/);
    expect(r.text).toMatch(/coal and iron\. They were essential|coal and iron, which were essential/);
  });

  it("never joins a statement onto an instruction", () => {
    const r = humanizeText(byId("blog-headers"), aggressive);
    expect(r.text).not.toMatch(/works for you, and start small/i);
    const email = humanizeText(byId("email-reply"), aggressive);
    expect(email.text).not.toMatch(/attention, and I/);
  });

  it("keeps a semicolon sentence intact instead of splitting and re-joining it", () => {
    const r = humanizeText(byId("narrative"), aggressive);
    expect(r.text).not.toMatch(/building, and it was/);
    expect(r.text).toMatch(/a (?:source|symbol) of hope/);
  });

  it("replaces plural and singular 'key takeaway' with matching forms", () => {
    const r = humanizeText(byId("linkedin"), aggressive);
    expect(r.text).not.toMatch(/three what to remember/);
    expect(r.text).toMatch(/three (?:main points|lessons|things to remember)/);
  });

  it("leaves nouns alone when simplifying verbs", () => {
    const r = humanizeText(byId("email-reply"), aggressive);
    expect(r.text).not.toMatch(/next buy\b/);
  });

  it("handles sentence-initial transitions through the opener rules", () => {
    const text =
      "Furthermore, the team shipped the feature on time. Moreover, the customers noticed the difference right away. Additionally, support tickets dropped by half that month.";
    const r = humanizeText(text, { ...base, strength: "balanced" });
    expect(r.text).not.toMatch(/\bAnd,\s+[a-z]/);
    expect(r.text).not.toMatch(/^(?:Furthermore|Moreover|Additionally)/m);
  });

  it("avoids chatty alternatives in a formal register", () => {
    const text = byId("essay-social");
    const formal = humanizeText(text, { ...base, purpose: "essay", strength: "aggressive" });
    expect(formal.text).not.toMatch(/\bfolks\b|\bPlus,|\bWhat's more,|\bOn top of that,/);
  });

  it("picks the lowest-scoring of several candidates and stays deterministic", () => {
    const text = byId("tech-explainer");
    const a = humanizeText(text, { ...aggressive, seed: 3 });
    const b = humanizeText(text, { ...aggressive, seed: 3 });
    expect(a.text).toBe(b.text);
    expect(a.after).toEqual(detectText(a.text));
  });
});
