"use client";

import { FileText, ScanSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Breakdown } from "@/components/workspace/Breakdown";
import { ControlBar } from "@/components/workspace/ControlBar";
import { DetectorPanel } from "@/components/workspace/DetectorPanel";
import { Editor } from "@/components/workspace/Editor";
import { HighlightedText } from "@/components/workspace/HighlightedText";
import { OutputPanel, type OutputTab } from "@/components/workspace/OutputPanel";
import { ReportLayout } from "@/components/workspace/ReportLayout";
import { ApiRequestError, detect as apiDetect, humanize as apiHumanize } from "@/lib/api";
import {
  DEFAULT_HUMANIZE_OPTIONS,
  LIMITS,
  type DetectionResult,
  type HumanizeOptions,
  type HumanizeResult,
} from "@/lib/engine/types";
import { addHistoryEntry, addUsage, type HistoryEntry } from "@/lib/history";
import { PLANS } from "@/lib/site";
import { useUsage } from "@/lib/use-storage";
import { cn, countWords, formatNumber } from "@/lib/utils";

export interface WorkspaceProps {
  /** Which action is primary. */
  mode?: "humanize" | "detect";
  /** Tighter layout for embedding in the landing hero. */
  embedded?: boolean;
}

type Mode = NonNullable<WorkspaceProps["mode"]>;
type Busy = "detect" | "humanize" | null;

/** sessionStorage key the dashboard uses to hand an old entry back to the editor. */
export const OPEN_ENTRY_KEY = "prosely.open";
const FREE_PLAN = PLANS[0];

function excerpt(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 96 ? `${t.slice(0, 96)}…` : t;
}

export function Workspace({ mode: initialMode = "humanize", embedded = false }: WorkspaceProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [text, setText] = useState("");
  const [options, setOptions] = useState<HumanizeOptions>(DEFAULT_HUMANIZE_OPTIONS);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputTab, setOutputTab] = useState<OutputTab>("text");
  const [layout, setLayout] = useState<"editor" | "report">("editor");
  const usage = useUsage();
  const seedRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  const words = countWords(text);
  const tooShort = words < LIMITS.minWords;
  const tooLong = words > LIMITS.freeMaxWords;
  const remaining = Math.max(0, FREE_PLAN.wordsPerMonth - usage.wordsUsed);
  const outOfWords = words > remaining;
  const canRun = !busy && !tooShort && !tooLong && text.trim().length > 0;

  useEffect(() => {
    // Re-open an entry handed over by the dashboard. Deferred so hydration renders the empty editor first.
    const timer = window.setTimeout(() => {
      try {
        const raw = window.sessionStorage.getItem(OPEN_ENTRY_KEY);
        if (!raw) return;
        window.sessionStorage.removeItem(OPEN_ENTRY_KEY);
        const entry = JSON.parse(raw) as HistoryEntry;
        if (entry.input) setText(entry.input);
        if (entry.options) setOptions(entry.options);
      } catch {
        /* ignore */
      }
    }, 0);
    const controller = abortRef;
    return () => {
      window.clearTimeout(timer);
      controller.current?.abort();
    };
  }, []);

  const clearResults = () => {
    setDetection(null);
    setResult(null);
    setLayout("editor");
    setError(null);
  };

  const onText = (next: string) => {
    setText(next);
    if (detection || result || error) clearResults();
  };

  const begin = (kind: Exclude<Busy, null>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setBusy(kind);
    return controller;
  };

  const fail = (e: unknown) => {
    if (e instanceof DOMException && e.name === "AbortError") return;
    setError(e instanceof ApiRequestError ? e.message : "Something went wrong. Please try again.");
  };

  const runDetect = async () => {
    const controller = begin("detect");
    setResult(null);
    try {
      const r = await apiDetect(text, controller.signal);
      setDetection(r);
      addHistoryEntry({
        kind: "detect",
        words,
        excerpt: excerpt(text),
        aiBefore: r.aiProbability,
        verdict: r.verdict,
        input: text,
      });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const runHumanize = async (reseed = false) => {
    if (reseed) seedRef.current += 1;
    const controller = begin("humanize");
    setLayout("editor");
    try {
      const r = await apiHumanize(text, { ...options, seed: seedRef.current }, controller.signal);
      setResult(r);
      setDetection(r.before);
      setOutputTab("text");
      addUsage(words);
      addHistoryEntry({
        kind: "humanize",
        words,
        excerpt: excerpt(text),
        aiBefore: r.before.aiProbability,
        aiAfter: r.after.aiProbability,
        verdict: r.after.verdict,
        options,
        input: text,
        output: r.text,
      });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const shown = result ? result.after : detection;
  const reportText = result ? result.text : text;

  let hint: ReactNode;
  if (tooLong) {
    hint = (
      <>
        Free plan allows {formatNumber(LIMITS.freeMaxWords)} words per request.{" "}
        <Link href="/pricing" className="text-accent underline-offset-2 hover:underline">
          Upgrade
        </Link>{" "}
        for up to {formatNumber(LIMITS.maxWords)}.
      </>
    );
  } else if (mode === "humanize" && outOfWords && words > 0) {
    hint = (
      <>
        You have {formatNumber(remaining)} free words left this month.{" "}
        <Link href="/pricing" className="text-accent underline-offset-2 hover:underline">
          See plans
        </Link>
      </>
    );
  } else if (mode === "humanize") {
    hint = <>{formatNumber(remaining)} free humanizer words left this month · Detection is always free</>;
  } else {
    hint = <>Detection is free and unlimited · Scores are estimates, not a verdict on authorship</>;
  }

  if (layout === "report" && shown) {
    return (
      <div className="card overflow-hidden">
        <ReportLayout
          text={reportText}
          result={shown}
          title={result ? "Writing report · humanized text" : "Writing report · your text"}
          onBack={() => setLayout("editor")}
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
        <div role="tablist" aria-label="Tool" className="flex gap-0.5">
          <ModeTab active={mode === "humanize"} onClick={() => setMode("humanize")} icon={<Sparkles className="size-4" />}>
            Humanizer
          </ModeTab>
          <ModeTab active={mode === "detect"} onClick={() => setMode("detect")} icon={<ScanSearch className="size-4" />}>
            AI Detector
          </ModeTab>
        </div>
        {shown && !busy && (
          <Button variant="ghost" size="sm" icon={<FileText className="size-3.5" />} onClick={() => setLayout("report")}>
            Full report
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-line">
        <Editor
          value={text}
          onChange={onText}
          minWords={LIMITS.minWords}
          maxWords={LIMITS.freeMaxWords}
          disabled={Boolean(busy)}
          embedded={embedded}
        />
        <div className="flex min-w-0 flex-col border-t border-line lg:border-t-0">
          {result ? (
            <OutputPanel
              result={result}
              tab={outputTab}
              onTab={setOutputTab}
              onRehumanize={() => runHumanize(true)}
              busy={busy === "humanize"}
              embedded={embedded}
            />
          ) : busy ? (
            <PanelSkeleton embedded={embedded} label={busy === "humanize" ? "Rewriting…" : "Scanning…"} />
          ) : detection ? (
            <DetectionView text={text} result={detection} embedded={embedded} />
          ) : (
            <EmptyPanel mode={mode} embedded={embedded} />
          )}
        </div>
      </div>

      <div className="border-t border-line px-4 py-3 sm:px-5">
        {mode === "humanize" && <ControlBar options={options} onChange={setOptions} disabled={Boolean(busy)} />}
        <div className={cn("flex flex-wrap items-center justify-between gap-3", mode === "humanize" && "mt-3")}>
          <p className="text-xs text-muted">{hint}</p>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === "detect" ? "accent" : "secondary"}
              onClick={runDetect}
              loading={busy === "detect"}
              disabled={!canRun}
              icon={<ScanSearch className="size-4" />}
            >
              Check for AI
            </Button>
            <Button
              variant={mode === "humanize" ? "accent" : "secondary"}
              onClick={() => runHumanize(false)}
              loading={busy === "humanize"}
              disabled={!canRun || outOfWords}
              icon={<Sparkles className="size-4" />}
            >
              Humanize
            </Button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-ai">
            {error}
          </p>
        )}
      </div>

      {(shown || busy) && (
        <div className="grid gap-8 border-t border-line bg-surface/50 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {shown && !busy ? <Breakdown result={shown} before={result ? result.before : undefined} /> : <BreakdownSkeleton />}
          <DetectorPanel detectors={busy ? null : (shown?.detectors ?? null)} pending={Boolean(busy)} />
        </div>
      )}
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
        active ? "bg-accent-soft text-accent-strong" : "text-muted hover:bg-surface hover:text-ink",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function EmptyPanel({ mode, embedded }: { mode: Mode; embedded: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center",
        embedded ? "min-h-[240px] sm:min-h-[280px]" : "min-h-[320px] sm:min-h-[380px]",
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        {mode === "humanize" ? <Sparkles className="size-5" /> : <ScanSearch className="size-5" />}
      </span>
      <p className="mt-1 text-sm font-medium text-ink">
        {mode === "humanize" ? "Your humanized text will appear here" : "Your highlighted report will appear here"}
      </p>
      <p className="max-w-xs text-xs leading-5 text-muted">
        {mode === "humanize"
          ? "We keep your meaning and change how it reads. Then we score the result."
          : "Sentences that read as machine-written are highlighted. Click one to see why."}
      </p>
    </div>
  );
}

function PanelSkeleton({ embedded, label }: { embedded: boolean; label: string }) {
  const widths = ["92%", "100%", "84%", "96%", "72%", "88%", "60%"];
  return (
    <div
      className={cn("flex flex-1 flex-col px-5 py-5", embedded ? "min-h-[240px] sm:min-h-[280px]" : "min-h-[320px] sm:min-h-[380px]")}
      aria-busy="true"
      aria-live="polite"
    >
      <p className="mb-4 text-xs text-muted">{label}</p>
      <div className="space-y-3">
        {widths.map((w, i) => (
          <div key={i} className="shimmer h-3.5 rounded-md" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

function BreakdownSkeleton() {
  return (
    <div className="flex items-start gap-5" aria-hidden>
      <div className="shimmer size-[116px] rounded-full" />
      <div className="flex-1 space-y-3 pt-2">
        <div className="shimmer h-5 w-40 rounded-md" />
        <div className="shimmer h-3.5 w-64 rounded-md" />
        <div className="shimmer h-2 w-full rounded-full" />
        <div className="shimmer h-3.5 w-52 rounded-md" />
      </div>
    </div>
  );
}

function DetectionView({ text, result, embedded }: { text: string; result: DetectionResult; embedded: boolean }) {
  const [showLow, setShowLow] = useState(false);
  const lowRange = result.aiProbability > 0 && result.aiProbability < 20;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
        <span className="text-[13px] font-medium text-ink">Highlights</span>
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-ai/40" aria-hidden /> AI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-mixed/50" aria-hidden /> Mixed
          </span>
          {lowRange && (
            <button type="button" onClick={() => setShowLow((v) => !v)} className="text-accent hover:underline">
              {showLow ? "Hide" : "Show anyway"}
            </button>
          )}
        </div>
      </div>
      <div
        className={cn(
          "quiet-scroll flex-1 overflow-auto px-5 py-4",
          embedded ? "max-h-[320px] min-h-[240px] sm:min-h-[280px]" : "max-h-[520px] min-h-[320px] sm:min-h-[380px]",
        )}
      >
        <HighlightedText text={text} result={result} showLowConfidence={showLow} />
      </div>
    </div>
  );
}
