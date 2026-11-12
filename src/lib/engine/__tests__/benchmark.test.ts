import { describe, expect, it } from "vitest";
import { detectText } from "../detect";
import { humanizeText } from "../humanize";
import { DEFAULT_HUMANIZE_OPTIONS, type Strength } from "../types";
import { CORPUS } from "./corpus";

const score = (text: string) => detectText(text).aiProbability;
const byId = (id: string) => {
  const item = CORPUS.find((c) => c.id === id);
  if (!item) throw new Error(`missing corpus item ${id}`);
  return item.text;
};

/** Probability that a random AI text outscores a random human text. */
function auroc(items: typeof CORPUS): number {
  const ai = items.filter((c) => c.label === "ai").map((c) => score(c.text));
  const human = items.filter((c) => c.label === "human").map((c) => score(c.text));
  let wins = 0;
  for (const a of ai) for (const h of human) wins += a > h ? 1 : a === h ? 0.5 : 0;
  return wins / (ai.length * human.length);
}

describe("detector benchmark", () => {
  const tuning = CORPUS.filter((c) => !c.holdout);
  const holdout = CORPUS.filter((c) => c.holdout);

  it("separates AI from human text on the tuning set", () => {
    expect(auroc(tuning)).toBeGreaterThanOrEqual(0.97);
  });

  it("never calls a human text AI, and rarely calls AI text human, on the tuning set", () => {
    for (const c of tuning.filter((x) => x.label === "human")) expect(score(c.text), c.id).toBeLessThan(65);
    const missed = tuning.filter((c) => c.label === "ai" && score(c.text) < 35);
    expect(missed.map((c) => c.id)).toEqual([]);
  });

  it("holds up on texts written after the weights were frozen", () => {
    expect(auroc(holdout)).toBeGreaterThanOrEqual(0.85);
    for (const c of holdout) {
      if (c.label === "human") expect(score(c.text), c.id).toBeLessThan(65);
      else expect(score(c.text), c.id).toBeGreaterThanOrEqual(35);
    }
  });
});

describe("detector regressions", () => {
  it("does not treat ordinary discourse markers as AI glue", () => {
    const plain =
      "We ran the survey twice because the first batch of responses came back with the wrong date field. The second run took three weeks longer than planned. Participation was lower than we had hoped, at 412 of the 900 invited, and the age skew is obvious in the raw counts. Results should be read with that in mind. The main effect held up in both runs, which surprised us. Effect sizes were small but consistent across sites.";
    const marked = plain
      .replace("The second run", "However, the second run")
      .replace("Participation was", "For instance, participation was")
      .replace("Results should", "Finally, results should");
    expect(score(marked) - score(plain)).toBeLessThanOrEqual(8);
    expect(score(marked)).toBeLessThan(35);
  });

  it("reads markdown scaffolding with bold-label bullets as a model habit", () => {
    expect(score(byId("ai-markdown-explainer"))).toBeGreaterThanOrEqual(65);
    // A plain human bullet list is not penalised.
    expect(score(byId("human-meeting-notes"))).toBeLessThan(20);
  });

  it("does not credit quoted speech or citations to the author", () => {
    const body = byId("ai-academic-polished");
    const quoted = `${body}\n\nOne resident put it differently. "I don't care what the studies say, I just know my kids won't play out front since they cut the trees down. It's hotter, it's louder, and honestly? I'm not sure anyone's listening to us," she said.`;
    expect(score(quoted)).toBeGreaterThanOrEqual(65);
    expect(score(byId("ai-reflective-first-person"))).toBeGreaterThanOrEqual(50);
  });

  it("flags text that is mostly dialogue as low confidence", () => {
    const dialogue = `"Did you lock the door?" she asked. "I thought you did," he said. "No, I asked you to do it before we left the house." "You never said that." "I did, twice, while you were looking at your phone." "Well, I don't remember it." "That's my point," she said. "Fine. I'll go back." "Don't bother, it's forty minutes." "Then why bring it up?"`;
    const r = detectText(dialogue);
    expect(r.flags.some((f) => f.id === "mostly-quoted")).toBe(true);
    expect(r.confidence).toBe("low");
  });

  it("does not let one formal word decide a short note", () => {
    const note =
      "Quick update on the shed. The frame is up and it feels robust enough, though I ran out of screws on Sunday. Roofing felt arrives Thursday. If the weather holds I should have it watertight by the weekend, which would be a first for me.";
    expect(score(note)).toBeLessThan(40);
  });

  it("names the structural signal on the sentence that carries it", () => {
    const r = detectText(byId("ai-emdash-blog"));
    const signals = r.sentences.flatMap((s) => s.signals).join(" | ");
    expect(signals).toMatch(/Contrast framing/);
    expect(signals).toMatch(/Signpost sentence/);
    expect(r.metrics.dashRate).toBeGreaterThan(1);
  });
});

describe("humanizer strength ladder", () => {
  const ai = CORPUS.filter((c) => c.label === "ai");
  const run = (strength: Strength) => ai.map((c) => humanizeText(c.text, { ...DEFAULT_HUMANIZE_OPTIONS, strength }));
  const light = run("light");
  const balanced = run("balanced");
  const aggressive = run("aggressive");
  const mean = (rs: typeof light) => rs.reduce((s, r) => s + r.after.aiProbability, 0) / rs.length;

  it("lowers the score more at each strength", () => {
    expect(mean(balanced)).toBeLessThan(mean(light) - 8);
    expect(mean(aggressive)).toBeLessThan(mean(balanced));
  });

  it("makes aggressive a different rewrite from balanced", () => {
    const same = aggressive.filter((r, i) => r.text === balanced[i].text).length;
    expect(same).toBeLessThanOrEqual(1);
    const moreEdits = aggressive.filter((r, i) => r.edits > balanced[i].edits).length;
    expect(moreEdits).toBeGreaterThanOrEqual(Math.ceil(ai.length * 0.6));
  });

  it("rewrites contrast framing, dashes and participial tails without breaking grammar", () => {
    const blog = humanizeText(byId("ai-emdash-blog"), { ...DEFAULT_HUMANIZE_OPTIONS, strength: "aggressive" }).text;
    expect(blog).not.toMatch(/—/);
    expect(blog).toMatch(/a design problem rather than a personal failing/);
    expect(blog).not.toMatch(/This's|That's is|, and [^.]*, and /);
    const advice = humanizeText(byId("ai-advice-second-person"), { ...DEFAULT_HUMANIZE_OPTIONS, strength: "aggressive" }).text;
    expect(advice).toMatch(/This is about making sure/);
    expect(advice).toMatch(/thirty, sixty, and ninety days/);
    const memo = humanizeText(byId("ai-strategy-memo"), { ...DEFAULT_HUMANIZE_OPTIONS, strength: "aggressive" }).text;
    expect(memo).toMatch(/without risk, but they position/);
  });
});
