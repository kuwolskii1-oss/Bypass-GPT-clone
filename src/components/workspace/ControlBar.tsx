"use client";

import { Lock, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { Select } from "@/components/ui/Select";
import { KeywordInput } from "@/components/workspace/KeywordInput";
import {
  PURPOSES,
  PURPOSE_LABELS,
  READABILITY_LABELS,
  READABILITY_LEVELS,
  STRENGTHS,
  STRENGTH_LABELS,
  type HumanizeOptions,
} from "@/lib/engine/types";
import { cn } from "@/lib/utils";

const readabilityOptions = READABILITY_LEVELS.map((v) => ({ value: v, label: READABILITY_LABELS[v] }));
const purposeOptions = PURPOSES.map((v) => ({ value: v, label: PURPOSE_LABELS[v] }));
const strengthOptions = STRENGTHS.map((v) => ({ value: v, label: STRENGTH_LABELS[v].label, hint: STRENGTH_LABELS[v].hint }));

export function ControlBar({
  options,
  onChange,
  disabled,
  className,
}: {
  options: HumanizeOptions;
  onChange: (next: HumanizeOptions) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [showKeywords, setShowKeywords] = useState((options.keepKeywords?.length ?? 0) > 0);
  const keywordCount = options.keepKeywords?.length ?? 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <span className="hidden items-center gap-1.5 self-center text-xs text-faint sm:flex">
          <SlidersHorizontal className="size-3.5" aria-hidden />
          Settings
        </span>
        <Select
          label="Readability"
          value={options.readability}
          options={readabilityOptions}
          onChange={(readability) => onChange({ ...options, readability })}
          disabled={disabled}
          className="w-[calc(50%-0.5rem)] sm:w-[10.5rem]"
        />
        <Select
          label="Purpose"
          value={options.purpose}
          options={purposeOptions}
          onChange={(purpose) => onChange({ ...options, purpose })}
          disabled={disabled}
          className="w-[calc(50%-0.5rem)] sm:w-[10.5rem]"
        />
        <Segmented
          label="Strength"
          value={options.strength}
          options={strengthOptions}
          onChange={(strength) => onChange({ ...options, strength })}
        />
        <button
          type="button"
          onClick={() => setShowKeywords((v) => !v)}
          aria-expanded={showKeywords}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 self-end rounded-lg border px-3 text-[13px] font-medium transition-colors",
            showKeywords || keywordCount > 0
              ? "border-accent-ring bg-accent-soft text-accent-strong"
              : "border-line bg-canvas text-ink-2 hover:border-line-strong",
          )}
        >
          <Lock className="size-3.5" aria-hidden />
          Keep keywords{keywordCount > 0 ? ` · ${keywordCount}` : ""}
        </button>
      </div>
      {showKeywords && (
        <KeywordInput
          value={options.keepKeywords ?? []}
          onChange={(keepKeywords) => onChange({ ...options, keepKeywords })}
          disabled={disabled}
          className="max-w-2xl"
        />
      )}
    </div>
  );
}
