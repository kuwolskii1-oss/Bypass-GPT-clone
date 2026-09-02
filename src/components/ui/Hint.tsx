import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Small info icon with a hover/focus tooltip. */
export function Hint({ children, className, align = "left" }: { children: ReactNode; className?: string; align?: "left" | "right" }) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <button
        type="button"
        aria-label="More information"
        className="inline-flex size-5 items-center justify-center rounded-full text-faint transition-colors hover:text-ink"
      >
        <Info className="size-3.5" aria-hidden />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-30 mt-1.5 w-60 rounded-lg border border-line bg-canvas p-3 text-xs leading-5 text-ink-2 opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          align === "left" ? "left-0" : "right-0",
        )}
      >
        {children}
      </span>
    </span>
  );
}
