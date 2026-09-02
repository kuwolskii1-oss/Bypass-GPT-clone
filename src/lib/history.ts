/**
 * Browser-side history. Kept in localStorage so nothing leaves the device
 * unless the user signs in later and opts into cloud history.
 */
import type { HumanizeOptions, Verdict } from "@/lib/engine/types";
import { FREE_ALLOWANCE } from "@/lib/site";

export interface HistoryEntry {
  id: string;
  kind: "detect" | "humanize";
  createdAt: number;
  words: number;
  excerpt: string;
  aiBefore: number;
  aiAfter?: number;
  verdict: Verdict;
  options?: HumanizeOptions;
  /** Full text is stored so entries can be re-opened. */
  input: string;
  output?: string;
}

const KEY = "prosely.history.v1";
const USAGE_KEY = "prosely.usage.v1";
const MAX_ENTRIES = 50;

const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

/** Subscribe to history/usage changes (this tab and other tabs). For useSyncExternalStore. */
export function subscribeStorage(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const EMPTY_HISTORY: HistoryEntry[] = [];
let historyCache: { raw: string | null; value: HistoryEntry[] } = { raw: null, value: EMPTY_HISTORY };

/** Stable snapshot: the same array is returned until storage changes. */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return EMPTY_HISTORY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw !== historyCache.raw) historyCache = { raw, value: safeParse<HistoryEntry[]>(raw, EMPTY_HISTORY) };
    return historyCache.value;
  } catch {
    return EMPTY_HISTORY;
  }
}

export function getHistoryServerSnapshot(): HistoryEntry[] {
  return EMPTY_HISTORY;
}

export function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    /* storage may be unavailable (private mode, quota) — history is a convenience */
  }
  emit();
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  saveHistory([full, ...loadHistory()]);
  return full;
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  saveHistory([]);
}

export interface Usage {
  /** Humanizer words used in the current rolling period. */
  wordsUsed: number;
  /** Timestamp the current period started, or 0 before the first rewrite. */
  periodStart: number;
}

const PERIOD_MS = FREE_ALLOWANCE.weeks * 7 * 24 * 60 * 60 * 1000;

/** When the current free-plan period resets, or null before the first rewrite. */
export function usagePeriodEnd(usage: Usage): Date | null {
  return usage.periodStart > 0 ? new Date(usage.periodStart + PERIOD_MS) : null;
}

const ZERO_USAGE: Usage = { wordsUsed: 0, periodStart: 0 };
let usageCache: { raw: string | null; value: Usage } = { raw: null, value: ZERO_USAGE };

function isCurrent(u: Usage): boolean {
  return u.periodStart > 0 && Date.now() - u.periodStart < PERIOD_MS;
}

/** Stable snapshot of the current period's usage. */
export function loadUsage(): Usage {
  if (typeof window === "undefined") return ZERO_USAGE;
  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    if (raw !== usageCache.raw) {
      const stored = safeParse<Partial<Usage>>(raw, ZERO_USAGE);
      const value: Usage = { wordsUsed: stored.wordsUsed ?? 0, periodStart: stored.periodStart ?? 0 };
      usageCache = { raw, value: isCurrent(value) ? value : ZERO_USAGE };
    }
    return usageCache.value;
  } catch {
    return ZERO_USAGE;
  }
}

export function getUsageServerSnapshot(): Usage {
  return ZERO_USAGE;
}

export function addUsage(words: number): Usage {
  const usage = loadUsage();
  const next: Usage = {
    wordsUsed: usage.wordsUsed + words,
    periodStart: usage.periodStart > 0 ? usage.periodStart : Date.now(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(USAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    emit();
  }
  return next;
}
