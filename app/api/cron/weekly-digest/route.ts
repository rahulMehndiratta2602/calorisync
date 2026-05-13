import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { buildWeeklyDigest } from "@/lib/digest";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Weekly digest cron — intended to run every Saturday morning. Iterates all
 * marketing-opt-in users with at least one logged meal in the past week,
 * builds the digest, hands off to the configured email provider.
 *
 * Auth: Bearer CRON_SECRET.
 *
 * Multi-timezone aware send timing is a v2 concern. For tonight the timer
 * fires once a week and we send everyone at that moment.
 */
export async function POST(req: NextRequest) {
  if (env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const startedAt = Date.now();

  // Pull marketing-opted-in users only.
  const optedIn = await db
    .select({ id: schema.users.id, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.marketingOptIn, true));

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const u of optedIn) {
    try {
      const digest = await buildWeeklyDigest(u.id);
      if (!digest || !digest.hasData) {
        skipped++;
        continue;
      }
      await sendEmail({
        to: u.email,
        template: "weekly_summary",
        payload: digest as unknown as Record<string, unknown>,
        userId: u.id,
      });
      sent++;
    } catch (err) {
      errors.push(`${u.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    optedIn: optedIn.length,
    sent,
    skipped,
    errors: errors.slice(0, 10),
    durationMs: Date.now() - startedAt,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
