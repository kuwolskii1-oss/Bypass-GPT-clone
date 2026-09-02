import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const POINTS = [
  "Percentage of qualifying text that reads as AI-written, with a confidence level",
  "Every flagged sentence highlighted in place, with the signals that triggered it",
  "Flags for hidden characters, homoglyphs and irregular spacing that detectors treat as tampering",
];

const LEGEND = [
  { label: "AI-generated", pct: "22%", color: "bg-ai" },
  { label: "Mixed or AI-paraphrased", pct: "12%", color: "bg-mixed" },
  { label: "Human-like", pct: "66%", color: "bg-human" },
];

export function ReportPreview() {
  return (
    <section id="report" className="py-20 sm:py-28">
      <div className="wrap grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="max-w-xl">
          <p className="eyebrow">Writing report</p>
          <h2 className="h-section mt-3">A report your reader will recognise</h2>
          <p className="lede mt-4">
            The breakdown follows the layout that institutions and publishers already use, so what you see here is
            what they will see there.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3 text-sm leading-6 text-ink-2">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Check className="size-3" aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <Button href="/ai-detector" variant="secondary" className="mt-8">
            Try the detector
          </Button>
        </div>

        {/* CSS mockup of the report — no images */}
        <div aria-hidden className="card overflow-hidden shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
            </div>
            <span className="text-xs text-faint">essay-draft.docx · 612 words</span>
          </div>
          <div className="grid sm:grid-cols-[1.5fr_1fr]">
            <div className="p-5 text-[13px] leading-6 text-ink-2 sm:p-6">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Highlighted text</p>
              <p>
                Cities are planting more trees than at any time in the last fifty years.{" "}
                <span className="hl hl-ai">
                  In today&rsquo;s rapidly evolving urban landscape, green infrastructure plays a pivotal role in
                  fostering resilience.
                </span>{" "}
                My street got six new maples in March, and the difference on a hot afternoon is real.{" "}
                <span className="hl hl-mixed">
                  Studies consistently show that tree canopy reduces surface temperatures by several degrees.
                </span>{" "}
                The catch is water: young trees need it for three summers before they can fend for themselves.
              </p>
            </div>
            <aside className="border-t border-line bg-surface/70 p-5 sm:border-l sm:border-t-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Submission breakdown</p>
              <p className="mt-3 text-4xl font-medium tracking-[-0.03em] text-ink">
                34%<span className="ml-1.5 text-sm font-normal text-muted">AI</span>
              </p>
              <p className="mt-1 text-xs text-muted">of qualifying text</p>
              <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-surface-2">
                <span className="w-[22%] bg-ai" />
                <span className="w-[12%] bg-mixed" />
                <span className="w-[66%] bg-human" />
              </div>
              <ul className="mt-4 space-y-2">
                {LEGEND.map((l) => (
                  <li key={l.label} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-ink-2">
                      <span className={`size-2 rounded-full ${l.color}`} />
                      {l.label}
                    </span>
                    <span className="font-mono text-muted">{l.pct}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="text-ink-2">Flags</span>
                <span className="font-mono text-muted">0</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
