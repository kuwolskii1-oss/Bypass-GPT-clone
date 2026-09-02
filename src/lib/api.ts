/**
 * Typed client for the app's own API routes.
 */
import type { DetectionResult, HumanizeOptions, HumanizeResult } from "@/lib/engine/types";

export interface DetectRequest {
  text: string;
}

export interface HumanizeRequest {
  text: string;
  options: HumanizeOptions;
}

export interface ApiError {
  error: string;
  code: "too_short" | "too_long" | "invalid" | "server";
}

export class ApiRequestError extends Error {
  code: ApiError["code"];
  constructor(payload: ApiError) {
    super(payload.error);
    this.code = payload.code;
  }
}

async function post<TReq, TRes>(path: string, body: TReq, signal?: AbortSignal): Promise<TRes> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = (await res.json()) as TRes | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    throw new ApiRequestError({ error: err.error ?? "Something went wrong", code: err.code ?? "server" });
  }
  return data as TRes;
}

export function detect(text: string, signal?: AbortSignal): Promise<DetectionResult> {
  return post<DetectRequest, DetectionResult>("/api/detect", { text }, signal);
}

export function humanize(text: string, options: HumanizeOptions, signal?: AbortSignal): Promise<HumanizeResult> {
  return post<HumanizeRequest, HumanizeResult>("/api/humanize", { text, options }, signal);
}
