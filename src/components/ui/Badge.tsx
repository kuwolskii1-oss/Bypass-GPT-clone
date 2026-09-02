import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "accent" | "human" | "mixed" | "ai" | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  accent: "bg-accent-soft text-accent-strong",
  human: "bg-human-soft text-human",
  mixed: "bg-mixed-soft text-mixed",
  ai: "bg-ai-soft text-ai",
  outline: "border border-line bg-canvas text-ink-2",
};

const dots: Record<BadgeTone, string> = {
  neutral: "bg-faint",
  accent: "bg-accent",
  human: "bg-human",
  mixed: "bg-mixed",
  ai: "bg-ai",
  outline: "bg-faint",
};

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden />}
      {children}
    </span>
  );
}
