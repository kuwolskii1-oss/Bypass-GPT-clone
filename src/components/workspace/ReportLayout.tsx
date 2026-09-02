"use client";

import { ArrowLeft, Download, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Flags, Legend, SegmentBar } from "@/components/workspace/Breakdown";
import { DetectorPanel } from "@/components/workspace/DetectorPanel";
import { HighlightedText } from "@/components/workspace/HighlightedText";
import { VERDICT_TEXT_CLASS } from "@/components/workspace/ScoreGauge";
import type { DetectionResult } from "@/lib/engine/types";
import { buildReportHtml, downloadTextFile, VERDICT_TEXT, scoreNote } from "@/lib/report";
import { cn } from "@/lib/utils";

export function ReportLayout({
  text,
  result,
  title,
  onBack,
  className,
}: {
  text: string;
  result: DetectionResult;
  title: string;
  onBack: () => void;
  className?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showLow, setShowLow] = useState(false);
  const lowRange = result.aiProbability > 0 && result.aiProbability < 20;
  const note = scoreNote(result.aiProbability, result.tooShort);
  const picked = selected != null ? result.sentences.find((s) => s.index === selected) : undefined;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="size-3.5" />}>
            Back to editor
          </Button>
          <span className="hidden text-sm text-muted sm:inline">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {lowRange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLow((v) => !v)}
              icon={showLow ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            >
              {showLow ? "Hide low-confidence highlights" : "Show highlights anyway"}
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="size-3.5" />}
            onClick={() => downloadTextFile("writing-report.html", buildReportHtml(text, result, title), "text/html")}
          >
            Download report
          </Button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="quiet-scroll max-h-[70vh] overflow-auto border-b border-line p-5 sm:p-8 lg:border-b-0 lg:border-r">
          <div className="mx-auto max-w-2xl">
            <HighlightedText
              text={text}
              result={result}
              showLowConfidence={showLow}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
        </div>

        <aside className="quiet-scroll max-h-[70vh] overflow-auto bg-surface/60 p-5 sm:p-6">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-faint">Submission breakdown</h3>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={cn("text-5xl font-semibold tracking-[-0.04em]", VERDICT_TEXT_CLASS[result.verdict])}>
              {result.tooShort ? "--" : lowRange ? "*" : `${result.aiProbability}%`}
            </span>
            {!result.tooShort && lowRange && (
              <span className="text-sm text-muted">{result.aiProbability}%</span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-2">
            {result.tooShort ? "Score unavailable" : `of qualifying text is likely AI-generated · ${VERDICT_TEXT[result.verdict]}`}
          </p>
          {note && <p className="mt-2 text-xs leading-5 text-muted">{note}</p>}
          <div className="mt-2">
            <Badge tone="outline">confidence {result.confidence}</Badge>
          </div>

          <SegmentBar result={result} className="mt-5" />
          <Legend result={result} className="mt-3" />

          <div className="mt-5 rounded-xl border border-line bg-canvas p-3.5 text-sm">
            {picked ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">Sentence {picked.index + 1}</span>
                  <Badge tone={picked.verdict === "ai" ? "ai" : picked.verdict === "mixed" ? "mixed" : "human"} dot>
                    {Math.round(picked.score * 100)}% AI
                  </Badge>
                </div>
                {picked.signals.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-ink-2">
                    {picked.signals.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-[7px] size-1 shrink-0 rounded-full bg-faint" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted">No specific tells. Reads naturally.</p>
                )}
              </>
            ) : (
              <p className="text-xs leading-5 text-muted">Click any sentence to see why it scored the way it did.</p>
            )}
          </div>

          <Flags result={result} className="mt-5" />
          <DetectorPanel detectors={result.detectors} pending={false} dense className="mt-6" />

          <p className="mt-6 text-[11px] leading-5 text-faint">
            This score is an estimate. Our model may misidentify human-written and AI-generated text, so it should not be
            the sole basis for a decision about authorship. It is data to support human judgement, not a determination
            of misconduct.
          </p>
        </aside>
      </div>
    </div>
  );
}
