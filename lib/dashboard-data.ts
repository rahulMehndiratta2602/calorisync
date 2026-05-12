import { sql } from "drizzle-orm";
import { db, schema } from "./db";
import type { DayBucket } from "@/components/console/weekly-chart";

/**
 * Pull the last 7 days of kcal totals for a user, anchored in their tz.
 * Returns oldest first.
 */
export async function getWeekBuckets(userId: string, tz: string): Promise<DayBucket[]> {
  const rows = await db.execute<{ d: string; kcal: number; meals: number }>(sql`
    WITH days AS (
      SELECT generate_series(
        (now() AT TIME ZONE ${tz})::date - INTERVAL '6 days',
        (now() AT TIME ZONE ${tz})::date,
        INTERVAL '1 day'
      )::date AS d
    )
    SELECT
      to_char(days.d, 'YYYY-MM-DD') AS d,
      COALESCE(SUM(${schema.meals.totalKcal})::float, 0) AS kcal,
      COUNT(${schema.meals.id})::int AS meals
    FROM days
    LEFT JOIN ${schema.meals}
      ON ${schema.meals.userId} = ${userId}
      AND ${schema.meals.logDate} = days.d
      AND ${schema.meals.deletedAt} IS NULL
    GROUP BY days.d
    ORDER BY days.d ASC
  `);

  return rows.map((r) => ({
    date: r.d,
    kcal: Number(r.kcal) || 0,
    mealCount: r.meals,
  }));
}

/**
 * Compute logging streak (consecutive days with at least 1 meal, ending today).
 * Longest streak in past 365 days.
 */
export async function getStreaks(
  userId: string,
  tz: string,
): Promise<{ current: number; longest: number; daysLogged7: number }> {
  // Pull distinct days the user logged a meal, last 365 days, in user tz.
  const rows = await db.execute<{ d: string }>(sql`
    SELECT DISTINCT to_char(${schema.meals.logDate}, 'YYYY-MM-DD') AS d
    FROM ${schema.meals}
    WHERE ${schema.meals.userId} = ${userId}
      AND ${schema.meals.deletedAt} IS NULL
      AND ${schema.meals.logDate} > ((now() AT TIME ZONE ${tz})::date - INTERVAL '365 days')
    ORDER BY d DESC
  `);

  const days = rows.map((r) => r.d);
  if (days.length === 0) return { current: 0, longest: 0, daysLogged7: 0 };

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const yesterday = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() - 86400_000));

  // Current streak: starts from today (or yesterday if not yet logged today)
  let cursor = days[0] === today ? today : days[0] === yesterday ? yesterday : null;
  let current = 0;
  if (cursor) {
    current = 1;
    let prev = cursor;
    for (let i = 1; i < days.length; i++) {
      const expected = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(new Date(prev + "T12:00:00Z").getTime() - 86400_000));
      if (days[i] === expected) {
        current++;
        prev = days[i];
      } else {
        break;
      }
    }
  }

  // Longest streak: walk all days, find longest consecutive run.
  let longest = 0;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const expected = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(new Date(days[i - 1] + "T12:00:00Z").getTime() - 86400_000));
    if (days[i] === expected) {
      run++;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run, current);

  // Days logged in last 7 days
  const sevenDaysAgo = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() - 7 * 86400_000));
  const daysLogged7 = days.filter((d) => d > sevenDaysAgo).length;

  return { current, longest, daysLogged7 };
}
