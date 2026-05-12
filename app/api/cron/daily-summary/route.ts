import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Compute daily summary for every user — usually run nightly by a cron.
 *
 * Auth: requires `Authorization: Bearer ${CRON_SECRET}` header. Skip auth in
 * dev (no CRON_SECRET set) so it can be triggered manually.
 *
 * For each user × log_date present in `meals` since the start of yesterday in
 * the user's tz, we UPSERT a row into `daily_summary` with totals.
 */
export async function POST(req: NextRequest) {
  if (env.CRON_SECRET) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const startedAt = Date.now();
  // Pull yesterday + today buckets per user — TZ-aware via Postgres.
  const result = await db.execute<{ user_id: string; log_date: string; kcal: number; protein: number; carbs: number; fat: number; mealCount: number }>(sql`
    SELECT
      m.user_id,
      to_char(m.log_date, 'YYYY-MM-DD') AS log_date,
      COALESCE(SUM(m.total_kcal), 0)::float AS kcal,
      COALESCE(SUM(m.total_protein_g), 0)::float AS protein,
      COALESCE(SUM(m.total_carbs_g), 0)::float AS carbs,
      COALESCE(SUM(m.total_fat_g), 0)::float AS fat,
      COUNT(*)::int AS "mealCount"
    FROM meals m
    JOIN user_profiles up ON up.user_id = m.user_id
    WHERE m.log_date >= ((now() AT TIME ZONE up.timezone)::date - INTERVAL '2 days')
      AND m.deleted_at IS NULL
    GROUP BY m.user_id, m.log_date
  `);

  let upserted = 0;
  for (const row of result) {
    const targetKcalRow = await db
      .select({ targetKcal: schema.userProfiles.targetKcal })
      .from(schema.userProfiles)
      .where(sql`${schema.userProfiles.userId} = ${row.user_id}`)
      .limit(1);
    const targetKcal = targetKcalRow[0]?.targetKcal ?? null;

    await db.execute(sql`
      INSERT INTO daily_summary (user_id, log_date, kcal, protein_g, carbs_g, fat_g, target_kcal, meal_count, updated_at)
      VALUES (
        ${row.user_id},
        ${row.log_date}::date,
        ${row.kcal},
        ${row.protein},
        ${row.carbs},
        ${row.fat},
        ${targetKcal},
        ${row.mealCount},
        now()
      )
      ON CONFLICT (user_id, log_date) DO UPDATE SET
        kcal = EXCLUDED.kcal,
        protein_g = EXCLUDED.protein_g,
        carbs_g = EXCLUDED.carbs_g,
        fat_g = EXCLUDED.fat_g,
        target_kcal = EXCLUDED.target_kcal,
        meal_count = EXCLUDED.meal_count,
        updated_at = now()
    `);
    upserted++;
  }

  return NextResponse.json({
    ok: true,
    upserted,
    durationMs: Date.now() - startedAt,
  });
}

// GET for health checks / manual triggers from a browser.
export async function GET(req: NextRequest) {
  return POST(req);
}
