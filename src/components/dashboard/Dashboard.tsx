"use client";

import { ArrowUpRight, ScanSearch, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OPEN_ENTRY_KEY } from "@/components/workspace/Workspace";
import { clearHistory, removeHistoryEntry, type HistoryEntry } from "@/lib/history";
import { PLANS } from "@/lib/site";
import { useHistory, useHydrated, useUsage } from "@/lib/use-storage";
import { cn, formatNumber } from "@/lib/utils";

const FREE_PLAN = PLANS[0];

function UsageRing({ used, total }: { used: number; total: number }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, (used / total) * 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct)}% of words used`}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold tracking-tight text-ink">
        {Math.round(pct)}%
      </div>
    </div>
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function Dashboard() {
  const router = useRouter();
  const history = useHistory();
  const usage = useUsage();
  const ready = useHydrated();

  const open = (entry: HistoryEntry) => {
    try {
      window.sessionStorage.setItem(OPEN_ENTRY_KEY, JSON.stringify(entry));
    } catch {
      /* ignore */
    }
    router.push(entry.kind === "detect" ? "/ai-detector" : "/humanizer");
  };

  const humanized = history.filter((h) => h.kind === "humanize" && typeof h.aiAfter === "number");
  const avgDrop =
    humanized.length > 0
      ? Math.round(humanized.reduce((s, h) => s + (h.aiBefore - (h.aiAfter ?? h.aiBefore)), 0) / humanized.length)
      : 0;
  const remaining = Math.max(0, FREE_PLAN.wordsPerMonth - usage.wordsUsed);

  return (
    <div className="wrap py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="h-section mt-2">Your workspace</h1>
          <p className="mt-2 text-sm text-muted">Demo account. History and usage stay in this browser until you sign in.</p>
        </div>
        <div className="flex gap-2">
          <Button href="/ai-detector" variant="secondary" icon={<ScanSearch className="size-4" />}>
            Check text
          </Button>
          <Button href="/humanizer" variant="accent" icon={<Sparkles className="size-4" />}>
            Humanize
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="card flex items-center gap-5 p-5 md:col-span-1">
          <UsageRing used={usage.wordsUsed} total={FREE_PLAN.wordsPerMonth} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink">{FREE_PLAN.name} plan</span>
              <Badge tone="accent">Current</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {formatNumber(usage.wordsUsed)} of {formatNumber(FREE_PLAN.wordsPerMonth)} words used
            </p>
            <p className="text-xs text-faint">{formatNumber(remaining)} left this month</p>
            <Button href="/pricing" variant="soft" size="sm" className="mt-3" iconRight={<ArrowUpRight className="size-3.5" />}>
              Upgrade
            </Button>
          </div>
        </div>
        <Stat label="Documents processed" value={ready ? formatNumber(history.length) : "—"} />
        <Stat label="Average AI score drop" value={ready ? (humanized.length ? `−${avgDrop} pts` : "—") : "—"} hint="across humanized documents" />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-faint">History</h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => clearHistory()}
            className="text-xs text-muted hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>

      {ready && history.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Sparkles className="size-5" />
          </span>
          <p className="mt-1 text-sm font-medium text-ink">Nothing here yet</p>
          <p className="max-w-xs text-xs leading-5 text-muted">Every check and rewrite you run shows up here so you can reopen it later.</p>
          <Button href="/humanizer" size="sm" className="mt-3">
            Humanize your first draft
          </Button>
        </div>
      ) : (
        <ul className="card mt-4 divide-y divide-line">
          {history.map((h) => (
            <li key={h.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl",
                  h.kind === "humanize" ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-2",
                )}
                aria-hidden
              >
                {h.kind === "humanize" ? <Sparkles className="size-4" /> : <ScanSearch className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{h.excerpt}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatDate(h.createdAt)} · {formatNumber(h.words)} words
                  {h.options ? ` · ${h.options.readability} · ${h.options.strength}` : ""}
                </p>
              </div>
              <div className="hidden items-center gap-1.5 sm:flex">
                <Badge tone={h.aiBefore >= 65 ? "ai" : h.aiBefore >= 35 ? "mixed" : "human"} dot>
                  {h.aiBefore}% AI
                </Badge>
                {typeof h.aiAfter === "number" && (
                  <>
                    <span className="text-faint">→</span>
                    <Badge tone={h.verdict === "ai" ? "ai" : h.verdict === "mixed" ? "mixed" : "human"} dot>
                      {h.aiAfter}% AI
                    </Badge>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => open(h)}>
                  Open
                </Button>
                <button
                  type="button"
                  aria-label="Delete entry"
                  onClick={() => removeHistoryEntry(h.id)}
                  className="inline-flex size-8 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface hover:text-ai"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-faint">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
