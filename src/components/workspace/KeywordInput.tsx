"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

const MAX_KEYWORDS = 20;

export function KeywordInput({
  value,
  onChange,
  disabled,
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const p of parts) {
      if (next.length >= MAX_KEYWORDS) break;
      if (!next.some((k) => k.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Keep these words unchanged</span>
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-canvas px-2 py-1 transition-colors focus-within:border-accent-ring",
          disabled && "opacity-60",
        )}
      >
        {value.map((k) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-strong"
          >
            {k}
            <button
              type="button"
              aria-label={`Remove ${k}`}
              disabled={disabled}
              onClick={() => onChange(value.filter((v) => v !== k))}
              className="rounded-sm text-accent-strong/70 hover:text-accent-strong"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? "Names, brands, citations… press Enter" : "Add another"}
          className="min-w-[8rem] flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-faint focus:outline-none"
          aria-label="Keywords to keep unchanged"
        />
      </div>
    </div>
  );
}
