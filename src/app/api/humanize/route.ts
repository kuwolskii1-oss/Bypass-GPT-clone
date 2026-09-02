import { NextResponse } from "next/server";
import { humanize } from "@/lib/ai/provider";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { jsonError, parseOptions, readJson, validateText } from "@/lib/server/validate";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const limit = rateLimit(`humanize:${clientKey(req)}`, 20);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment.", code: "server" },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSec) } },
    );
  }
  const body = await readJson(req);
  if (!body) return jsonError("Request body must be JSON.", "invalid", 400);
  const parsed = validateText(body.text, { requireMin: true });
  if ("error" in parsed) return parsed.error;
  const options = parseOptions(body.options);
  try {
    const result = await humanize(parsed.text, options);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[prosely] humanize failed", e);
    return jsonError("We couldn't rewrite that text. Please try again.", "server", 500);
  }
}
