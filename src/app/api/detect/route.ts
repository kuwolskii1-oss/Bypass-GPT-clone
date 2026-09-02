import { NextResponse } from "next/server";
import { detectText } from "@/lib/engine";
import { clientKey, rateLimit } from "@/lib/server/rate-limit";
import { jsonError, readJson, validateText } from "@/lib/server/validate";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = rateLimit(`detect:${clientKey(req)}`, 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment.", code: "server" },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSec) } },
    );
  }
  const body = await readJson(req);
  if (!body) return jsonError("Request body must be JSON.", "invalid", 400);
  const parsed = validateText(body.text, { requireMin: false });
  if ("error" in parsed) return parsed.error;
  return NextResponse.json(detectText(parsed.text));
}
