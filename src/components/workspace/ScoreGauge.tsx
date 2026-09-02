import type { Verdict } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

export const VERDICT_COLOR: Record<Verdict, string> = {
  human: "var(--color-human)",
  mixed: "var(--color-mixed)",
  ai: "var(--color-ai)",
};

export const VERDICT_TEXT_CLASS: Record<Verdict, string> = {
  human: "text-human",
  mixed: "text-mixed",
  ai: "text-ai",
};

export function ScoreGauge({
  value,
  verdict,
  size = 116,
  caption = "AI",
  className,
}: {
  value: number;
  verdict: Verdict;
  size?: number;
  caption?: string;
  className?: string;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${value}% ${caption}`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={VERDICT_COLOR[verdict]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-semibold leading-none tracking-[-0.03em] text-ink">{value}%</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-faint">{caption}</span>
      </div>
    </div>
  );
}
