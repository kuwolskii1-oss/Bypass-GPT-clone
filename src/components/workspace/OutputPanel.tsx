"use client";

import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HighlightedText } from "@/components/workspace/HighlightedText";
import { diffWords } from "@/lib/diff";
import type { HumanizeResult } from "@/lib/engine/types";
import { downloadTextFile } from "@/lib/report";
import { cn } from "@/lib/utils";

export type OutputTab = "text" | "highlights" | "compare";

const TABS: { id: OutputTab; label: string }[] = [
  { id: "text", label: "Humanized" },
  { id: "highlights", label: "Highlights" },
  { id: "compare", label: "Compare" },
];

export function OutputPanel({
  result,
  tab,
  onTab,
  onRehumanize,
  busy,
  embedded,
  className,
}: {
  result: HumanizeResult;
  tab: OutputTab;
  onTab: (t: OutputTab) => void;
  onRehumanize: () => void;
  busy: boolean;
  embedded?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const diff = useMemo(() => (tab === "compare" ? diffWords(result.original, result.text) : []), [tab, result]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked; the text is selectable */
    }
  };

  const drop = result.before.aiProbability - result.after.aiProbability;
  const verdict = result.after.verdict;
  const nextStep =
    verdict === "human"
      ? "Reads as human-written. Copy it, or re-humanize for another take."
      : result.options.strength !== "aggressive"
        ? "Still has AI signals. Try Aggressive strength or re-humanize."
        : "Still has AI signals. Re-humanize for a new variant, or edit the amber sentences in Highlights.";

  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div role="tablist" aria-label="Output view" className="flex gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => onTab(t.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                tab === t.id ? "bg-surface text-ink" : "text-muted hover:text-ink",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs text-ink-2 transition-colors hover:bg-surface hover:text-ink"
            aria-label="Copy humanized text"
          >
            {copied ? <Check className="size-3.5 text-human" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile("humanized.txt", result.text)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs text-ink-2 transition-colors hover:bg-surface hover:text-ink"
            aria-label="Download humanized text"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "quiet-scroll flex-1 overflow-auto px-5 py-4",
          embedded ? "max-h-[320px] min-h-[220px] sm:min-h-[260px]" : "max-h-[520px] min-h-[260px] sm:min-h-[300px]",
        )}
      >
        {tab === "text" && (
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-ink">{result.text}</div>
        )}
        {tab === "highlights" && (
          <>
            <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-ai/40" aria-hidden /> Reads as AI
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-mixed/50" aria-hidden /> Mixed
              </span>
              <span>Plain text reads as human</span>
            </p>
            <HighlightedText text={result.text} result={result.after} showLowConfidence />
          </>
        )}
        {tab === "compare" && (
          <div className="whitespace-pre-wrap text-[15px] leading-7 text-ink">
            <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
              <span className="rounded-[3px] bg-human-soft px-1 text-human">added</span>
              <span className="rounded-[3px] bg-ai-soft px-1 text-ai/80 line-through">removed</span>
            </p>
            {diff.map((op, i) =>
              op.type === "equal" ? (
                <span key={i}>{op.text}</span>
              ) : op.type === "insert" ? (
                <ins key={i} className="rounded-[3px] bg-human-soft text-human no-underline">
                  {op.text}
                </ins>
              ) : (
                <del key={i} className="rounded-[3px] bg-ai-soft text-ai/80">
                  {op.text}
                </del>
              ),
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-line px-4 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
          <Badge tone={verdict === "human" ? "human" : verdict === "mixed" ? "mixed" : "ai"} dot>
            {result.after.aiProbability}% AI
          </Badge>
          <span className="text-xs text-muted">
            {drop > 0 ? `down from ${result.before.aiProbability}%` : `was ${result.before.aiProbability}%`} · {result.edits} words changed
            {result.engine === "claude" ? " · rewritten with Claude" : ""}
          </span>
          <span className="basis-full text-xs text-ink-2">{nextStep}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRehumanize} loading={busy} icon={<RefreshCw className="size-3.5" />}>
          Re-humanize
        </Button>
      </div>
    </div>
  );
}
