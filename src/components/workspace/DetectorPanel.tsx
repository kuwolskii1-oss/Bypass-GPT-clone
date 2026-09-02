import { Hint } from "@/components/ui/Hint";
import { DETECTORS, type DetectorEstimate, type Verdict } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const DOT: Record<Verdict, string> = {
  human: "bg-human",
  mixed: "bg-mixed",
  ai: "bg-ai",
};

const LABEL: Record<Verdict, string> = {
  human: "Human",
  mixed: "Unclear",
  ai: "AI",
};

const LABEL_CLASS: Record<Verdict, string> = {
  human: "text-human",
  mixed: "text-mixed",
  ai: "text-ai",
};

export function DetectorPanel({
  detectors,
  pending,
  className,
  dense = false,
}: {
  detectors: DetectorEstimate[] | null;
  pending: boolean;
  className?: string;
  dense?: boolean;
}) {
  const rows: DetectorEstimate[] =
    detectors ??
    DETECTORS.map((d) => ({ id: d.id, name: d.name, aiScore: 0, verdict: "human", unavailable: true, note: "" }));
  const idle = !detectors && !pending;
  return (
    <section className={cn("min-w-0", className)} aria-label="Detector estimates">
      <div className="mb-3 flex items-center gap-1.5">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Detector estimates</h3>
        <Hint>
          Estimates from our own model tuned to how each detector is known to behave. They are not live results from
          those services. Re-check with the detector your reader uses.
        </Hint>
      </div>
      <ul className={cn("grid gap-x-6", dense ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        {rows.map((d, i) => {
          const unavailable = Boolean(d.unavailable);
          return (
            <li key={d.id} className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    pending || idle || unavailable ? "bg-line-strong" : DOT[d.verdict],
                    pending && "animate-pulse-soft",
                  )}
                  style={pending ? { animationDelay: `${i * 90}ms` } : undefined}
                  aria-hidden
                />
                <span className={cn("truncate", idle ? "text-faint" : "text-ink")}>{d.name}</span>
              </span>
              <span className="shrink-0 text-right text-xs">
                {pending ? (
                  <span className="text-faint">Scanning…</span>
                ) : idle ? (
                  <span className="text-faint">—</span>
                ) : unavailable ? (
                  <span className="text-faint">{d.note || "Unavailable"}</span>
                ) : (
                  <>
                    <span className="mr-2 tabular-nums text-muted">{d.aiScore}% AI</span>
                    <span className={cn("font-medium", LABEL_CLASS[d.verdict])}>{LABEL[d.verdict]}</span>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
