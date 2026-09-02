import { Flag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ScoreGauge, VERDICT_TEXT_CLASS } from "@/components/workspace/ScoreGauge";
import type { DetectionResult } from "@/lib/engine/types";
import { VERDICT_TEXT, scoreNote } from "@/lib/report";
import { cn } from "@/lib/utils";

function wordShare(result: DetectionResult) {
  const totals = { human: 0, mixed: 0, ai: 0 };
  for (const s of result.sentences) {
    const w = s.text.trim().split(/\s+/).filter(Boolean).length;
    totals[s.verdict] += w;
  }
  const sum = totals.human + totals.mixed + totals.ai || 1;
  return {
    human: (totals.human / sum) * 100,
    mixed: (totals.mixed / sum) * 100,
    ai: (totals.ai / sum) * 100,
  };
}

export function SegmentBar({ result, className }: { result: DetectionResult; className?: string }) {
  const share = wordShare(result);
  return (
    <div className={cn("flex h-2 w-full overflow-hidden rounded-full bg-surface-2", className)} aria-hidden>
      <div className="bg-ai transition-[width] duration-700" style={{ width: `${share.ai}%` }} />
      <div className="bg-mixed transition-[width] duration-700" style={{ width: `${share.mixed}%` }} />
      <div className="bg-human/70 transition-[width] duration-700" style={{ width: `${share.human}%` }} />
    </div>
  );
}

export function Legend({ result, className }: { result: DetectionResult; className?: string }) {
  const rows = [
    { key: "ai", label: "AI-generated", dot: "bg-ai", count: result.breakdown.ai },
    { key: "mixed", label: "Mixed or AI-paraphrased", dot: "bg-mixed", count: result.breakdown.mixed },
    { key: "human", label: "Human-like", dot: "bg-human", count: result.breakdown.human },
  ];
  return (
    <ul className={cn("space-y-1.5 text-sm", className)}>
      {rows.map((r) => (
        <li key={r.key} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-ink-2">
            <span className={cn("size-2 rounded-full", r.dot)} aria-hidden />
            {r.label}
          </span>
          <span className="tabular-nums text-muted">
            {r.count} {r.count === 1 ? "sentence" : "sentences"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Flags({ result, className }: { result: DetectionResult; className?: string }) {
  const flags = result.flags.filter((f) => f.id !== "very-short");
  return (
    <div className={cn("text-sm", className)}>
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">
        <Flag className="size-3" aria-hidden /> Flags · {flags.length}
      </div>
      {flags.length === 0 ? (
        <p className="text-muted">No flags. A flag is not necessarily an indicator of a problem.</p>
      ) : (
        <ul className="space-y-1">
          {flags.map((f) => (
            <li key={f.id} className="flex items-start gap-2 text-ink-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-mixed" aria-hidden />
              <span>
                <span className="font-medium text-ink">{f.label}</span>
                {f.count ? ` (${f.count})` : ""} — {f.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MetricsStrip({ result, className }: { result: DetectionResult; className?: string }) {
  const m = result.metrics;
  const items = [
    { label: "Words", value: m.words.toLocaleString("en-US") },
    { label: "Avg sentence", value: `${Math.round(m.avgSentenceLength)} words` },
    { label: "Burstiness", value: m.burstiness.toFixed(2) },
    { label: "Vocabulary", value: `${Math.round(m.lexicalDiversity * 100)}%` },
    { label: "Reading grade", value: m.readingGrade.toFixed(1) },
  ];
  return (
    <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-5", className)}>
      {items.map((it) => (
        <div key={it.label}>
          <dt className="text-faint">{it.label}</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-ink">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Gauge + verdict + legend, used under the editor after a check or a rewrite. */
export function Breakdown({
  result,
  before,
  className,
}: {
  result: DetectionResult;
  /** Detection of the original text when `result` is for the humanized output. */
  before?: DetectionResult;
  className?: string;
}) {
  const note = scoreNote(result.aiProbability, result.tooShort);
  return (
    <section className={cn("min-w-0", className)} aria-label="Score breakdown">
      <div className="flex items-start gap-5">
        <ScoreGauge value={result.aiProbability} verdict={result.verdict} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn("text-lg font-medium tracking-[-0.01em]", VERDICT_TEXT_CLASS[result.verdict])}>
              {VERDICT_TEXT[result.verdict]}
            </h3>
            <Badge tone="outline">confidence {result.confidence}</Badge>
            {before && <Badge tone="neutral">was {before.aiProbability}% AI</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted">
            {result.aiProbability}% of qualifying text is likely AI-generated.
            {note ? ` ${note}` : ""}
          </p>
          <SegmentBar result={result} className="mt-4" />
          <Legend result={result} className="mt-3" />
        </div>
      </div>
      <MetricsStrip result={result} className="mt-5 border-t border-line pt-4" />
      <Flags result={result} className="mt-4" />
    </section>
  );
}
