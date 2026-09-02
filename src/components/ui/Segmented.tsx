"use client";

import { cn } from "@/lib/utils";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SegmentedProps<T extends string> {
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Pill-style segmented control (radio semantics). */
export function Segmented<T extends string>({ value, options, onChange, label, size = "sm", className }: SegmentedProps<T>) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">{label}</span>}
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-surface p-0.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              title={o.hint}
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-[6px] font-medium transition-all duration-200",
                size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-sm",
                active ? "bg-canvas text-ink shadow-card" : "text-muted hover:text-ink",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
