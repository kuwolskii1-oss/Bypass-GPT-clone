import { NextResponse } from "next/server";
import {
  DEFAULT_HUMANIZE_OPTIONS,
  LIMITS,
  PURPOSES,
  READABILITY_LEVELS,
  STRENGTHS,
  type HumanizeOptions,
} from "@/lib/engine/types";
import type { ApiError } from "@/lib/api";
import { countWords } from "@/lib/utils";

export function jsonError(error: string, code: ApiError["code"], status: number) {
  return NextResponse.json({ error, code } satisfies ApiError, { status });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Per-request word cap. Override with PROSELY_MAX_WORDS when running behind your own auth/billing. */
export function maxWordsPerRequest(): number {
  const env = Number(process.env.PROSELY_MAX_WORDS);
  return Number.isFinite(env) && env > 0 ? Math.min(env, LIMITS.maxWords) : LIMITS.freeMaxWords;
}

export function validateText(value: unknown, { requireMin }: { requireMin: boolean }) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { error: jsonError("Paste some text first.", "invalid", 400) };
  }
  const words = countWords(value);
  if (requireMin && words < LIMITS.minWords) {
    return {
      error: jsonError(`Add at least ${LIMITS.minWords} words so the rewrite has enough context.`, "too_short", 400),
    };
  }
  const cap = maxWordsPerRequest();
  if (words > cap) {
    return {
      error: jsonError(`Text is limited to ${cap.toLocaleString("en-US")} words per request on this plan.`, "too_long", 413),
    };
  }
  return { text: value, words };
}

function oneOf<T extends string>(value: unknown, allowed: ReadonlyArray<T>, fallback: T): T {
  return typeof value === "string" && (allowed as ReadonlyArray<string>).includes(value) ? (value as T) : fallback;
}

export function parseOptions(value: unknown): HumanizeOptions {
  const o = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const keepKeywords = Array.isArray(o.keepKeywords)
    ? o.keepKeywords
        .filter((k): k is string => typeof k === "string")
        .map((k) => k.trim())
        .filter((k) => k.length > 0 && k.length <= 60)
        .slice(0, 20)
    : undefined;
  const seed = typeof o.seed === "number" && Number.isFinite(o.seed) ? Math.floor(o.seed) : undefined;
  return {
    readability: oneOf(o.readability, READABILITY_LEVELS, DEFAULT_HUMANIZE_OPTIONS.readability),
    purpose: oneOf(o.purpose, PURPOSES, DEFAULT_HUMANIZE_OPTIONS.purpose),
    strength: oneOf(o.strength, STRENGTHS, DEFAULT_HUMANIZE_OPTIONS.strength),
    ...(keepKeywords && keepKeywords.length > 0 ? { keepKeywords } : {}),
    ...(seed !== undefined ? { seed } : {}),
  };
}
