/**
 * Per-detector estimates.
 *
 * IMPORTANT: these are estimates produced by our own model, re-weighting the
 * same evidence the way each public detector is known to behave. They are not
 * live results from GPTZero, Turnitin, Originality.ai or any other service,
 * and the app labels them as estimates everywhere they are shown.
 */
import { hashString, lin, sigmoid } from "./text";
import { DETECTORS, LIMITS, type DetectorEstimate, type SentenceScore, type TextMetrics, type Verdict } from "./types";

interface Profile {
  /** Multiplier on the document logit. */
  a: number;
  /** Weight on the burstiness term (-1 bursty … +1 uniform). */
  b: number;
  /** Weight on the phrase-density term (-1 clean … +1 phrase-heavy). */
  c: number;
  /** Weight on the sentence-mean logit (sentence-level detectors). */
  s: number;
  bias: number;
  /** Jitter amplitude in points. */
  noise: number;
}

const PROFILES: Record<string, Profile> = {
  gptzero: { a: 1.0, b: 1.2, c: 0.2, s: 0.2, bias: 0, noise: 6 },
  turnitin: { a: 1.1, b: 0.4, c: 0.4, s: 0.3, bias: -0.2, noise: 5 },
  originality: { a: 1.3, b: 0.3, c: 0.9, s: 0.2, bias: 0.4, noise: 5 },
  copyleaks: { a: 0.9, b: 0.3, c: 0.3, s: 0.2, bias: -0.4, noise: 6 },
  zerogpt: { a: 0.8, b: 0.5, c: 0.3, s: 0.1, bias: 0.6, noise: 12 },
  winston: { a: 1.0, b: 0.5, c: 0.5, s: 0.2, bias: 0, noise: 6 },
  sapling: { a: 0.6, b: 0.2, c: 0.4, s: 0.9, bias: 0.1, noise: 7 },
  writer: { a: 0.8, b: 0.2, c: 0.4, s: 0.1, bias: -0.3, noise: 8 },
  quillbot: { a: 0.9, b: 0.4, c: 0.4, s: 0.2, bias: 0, noise: 6 },
  grammarly: { a: 0.8, b: 0.3, c: 0.3, s: 0.1, bias: -0.2, noise: 7 },
  crossplag: { a: 1.0, b: 0.6, c: 0.3, s: 0.1, bias: 0.2, noise: 8 },
  contentatscale: { a: 0.9, b: 0.4, c: 0.5, s: 0.2, bias: -0.1, noise: 7 },
};

const DEFAULT_PROFILE: Profile = { a: 1, b: 0.4, c: 0.4, s: 0.2, bias: 0, noise: 6 };

function logit(p: number): number {
  const q = Math.min(0.98, Math.max(0.02, p));
  return Math.log(q / (1 - q));
}

function verdictFor(score: number): Verdict {
  return score < 30 ? "human" : score < 60 ? "mixed" : "ai";
}

export function estimateDetectors(
  text: string,
  base: { aiProbability: number; metrics: TextMetrics; sentences: SentenceScore[] },
): DetectorEstimate[] {
  const docLogit = logit(base.aiProbability / 100);
  const burstTerm = (1 - lin(base.metrics.burstiness, 0.2, 0.75)) * 2 - 1;
  const phraseTerm = lin(base.metrics.aiPhraseDensity, 0.5, 5) * 2 - 1;
  const sentenceMean =
    base.sentences.length > 0 ? base.sentences.reduce((a, s) => a + s.score, 0) / base.sentences.length : 0.5;
  const sentenceLogit = logit(sentenceMean);
  const tooShort = base.metrics.words < LIMITS.minWords;

  return DETECTORS.map((spec) => {
    if (spec.longFormOnly && base.metrics.words < LIMITS.longFormMinWords) {
      return {
        id: spec.id,
        name: spec.name,
        aiScore: 0,
        verdict: "human",
        unavailable: true,
        note: `Needs ${LIMITS.longFormMinWords}+ words`,
      };
    }
    if (tooShort) {
      return { id: spec.id, name: spec.name, aiScore: 0, verdict: "human", unavailable: true, note: "Too short" };
    }
    const p = PROFILES[spec.id] ?? DEFAULT_PROFILE;
    const z = p.a * docLogit + p.b * burstTerm + p.c * phraseTerm + p.s * sentenceLogit + p.bias;
    const jitter = ((hashString(`${spec.id}:${text}`) % 2001) / 1000 - 1) * p.noise;
    const aiScore = Math.max(0, Math.min(100, Math.round(100 * sigmoid(z) + jitter)));
    const estimate: DetectorEstimate = { id: spec.id, name: spec.name, aiScore, verdict: verdictFor(aiScore) };
    if (spec.id === "turnitin" && aiScore > 0 && aiScore < 20) estimate.note = "Below 20%: less reliable";
    return estimate;
  });
}
