import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STARTED_AT = Date.now();

export async function GET() {
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // DB ping
  const dbStart = Date.now();
  try {
    await db.execute(sql`SELECT 1 AS one`);
    checks.db = { ok: true, latencyMs: Date.now() - dbStart };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    checks.db = { ok: false, latencyMs: Date.now() - dbStart, error: msg };
  }

  // Anthropic ping (small uncached request — costs a few tokens but proves AI is reachable)
  // Skip if no key configured (in build phase).
  if (env.ANTHROPIC_API_KEY) {
    const aiStart = Date.now();
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 1,
          messages: [{ role: "user", content: "1" }],
        }),
        signal: AbortSignal.timeout(5000),
      });
      checks.anthropic = { ok: res.ok, latencyMs: Date.now() - aiStart };
      if (!res.ok) checks.anthropic.error = `http ${res.status}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      checks.anthropic = { ok: false, latencyMs: Date.now() - aiStart, error: msg };
    }
  } else {
    checks.anthropic = { ok: false, error: "no key configured" };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  const body = {
    status: allOk ? "ok" : "degraded",
    checks,
    uptimeSeconds: Math.round((Date.now() - STARTED_AT) / 1000),
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
    headers: { "cache-control": "no-store" },
  });
}
