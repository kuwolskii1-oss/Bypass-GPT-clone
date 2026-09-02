"use client";

import { useSyncExternalStore } from "react";
import {
  getHistoryServerSnapshot,
  getUsageServerSnapshot,
  loadHistory,
  loadUsage,
  subscribeStorage,
  type HistoryEntry,
  type Usage,
} from "@/lib/history";

export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribeStorage, loadHistory, getHistoryServerSnapshot);
}

export function useUsage(): Usage {
  return useSyncExternalStore(subscribeStorage, loadUsage, getUsageServerSnapshot);
}

const noop = () => () => {};

/** False during server render and hydration, true once mounted on the client. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
