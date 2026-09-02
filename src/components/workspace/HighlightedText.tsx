"use client";

import { useMemo } from "react";
import type { DetectionResult, SentenceScore } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

type Segment = { kind: "gap"; text: string } | { kind: "sentence"; text: string; sentence: SentenceScore };

function buildSegments(text: string, sentences: SentenceScore[]): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  let consistent = true;
  for (const s of sentences) {
    if (s.start < cursor || s.end > text.length || text.slice(s.start, s.end) !== s.text) {
      consistent = false;
      break;
    }
    if (s.start > cursor) segments.push({ kind: "gap", text: text.slice(cursor, s.start) });
    segments.push({ kind: "sentence", text: s.text, sentence: s });
    cursor = s.end;
  }
  if (!consistent) {
    // Offsets don't line up with this text (e.g. it was normalised); fall back to sequential rendering.
    return sentences.flatMap((s, i) => {
      const out: Segment[] = [{ kind: "sentence", text: s.text, sentence: s }];
      if (i < sentences.length - 1) out.push({ kind: "gap", text: " " });
      return out;
    });
  }
  if (cursor < text.length) segments.push({ kind: "gap", text: text.slice(cursor) });
  return segments;
}

export function HighlightedText({
  text,
  result,
  showLowConfidence = false,
  selected,
  onSelect,
  className,
}: {
  text: string;
  result: DetectionResult;
  /** Force highlights even when the document score is under 20%. */
  showLowConfidence?: boolean;
  selected?: number | null;
  onSelect?: (index: number | null) => void;
  className?: string;
}) {
  const segments = useMemo(() => buildSegments(text, result.sentences), [text, result.sentences]);
  const dim = result.aiProbability < 20 && !showLowConfidence;
  return (
    <div className={cn("whitespace-pre-wrap text-[15px] leading-7 text-ink", className)}>
      {segments.map((seg, i) => {
        if (seg.kind === "gap") return <span key={i}>{seg.text}</span>;
        const v = seg.sentence.verdict;
        const isSelected = selected === seg.sentence.index;
        const interactive = Boolean(onSelect);
        const toggle = () => onSelect?.(isSelected ? null : seg.sentence.index);
        return (
          <span
            key={i}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            title={seg.sentence.signals.length ? seg.sentence.signals.join(" · ") : undefined}
            onClick={interactive ? toggle : undefined}
            onKeyDown={
              interactive
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle();
                    }
                  }
                : undefined
            }
            className={cn(
              "hl",
              !dim && v === "ai" && "hl-ai",
              !dim && v === "mixed" && "hl-mixed",
              interactive && "cursor-pointer",
              isSelected && "ring-2 ring-accent-ring",
            )}
          >
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}
