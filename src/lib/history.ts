/**
 * Browser-side history. Kept in localStorage so nothing leaves the device
 * unless the user signs in later and opts into cloud history.
 */
import type { HumanizeOptions, Verdict } from "@/lib/engine/types";

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
  /** Humanizer words used this calendar month. */
  wordsUsed: number;
  /** "YYYY-MM" of the month the counter belongs to. */
  period: string;
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const ZERO_USAGE: Usage = { wordsUsed: 0, period: "" };
let usageCache: { raw: string | null; value: Usage } = { raw: null, value: ZERO_USAGE };

/** Stable snapshot of this month's usage. */
export function loadUsage(): Usage {
  if (typeof window === "undefined") return ZERO_USAGE;
  try {
    const raw = window.localStorage.getItem(USAGE_KEY);
    if (raw !== usageCache.raw) {
      const stored = safeParse<Usage>(raw, ZERO_USAGE);
      usageCache = { raw, value: stored.period === currentPeriod() ? stored : ZERO_USAGE };
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
  const next: Usage = { wordsUsed: usage.wordsUsed + words, period: currentPeriod() };
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
