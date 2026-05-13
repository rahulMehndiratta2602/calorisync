import { eq, gte, and, desc } from "drizzle-orm";
import { db, schema } from "./db";

export interface WeeklyDigest {
  userId: string;
  userEmail: string;
  userName: string | null;
  weekStart: string;
  weekEnd: string;
  daysLogged: number;
  totalKcal: number;
  avgKcal: number;
  targetKcal: number | null;
  totalMeals: number;
  topFoods: { name: string; count: number }[];
  bestDay: { date: string; kcal: number } | null;
  hasData: boolean;
}

/**
 * Build a weekly digest for one user. Pulls last 7 days of meals + entries,
 * computes summary numbers, picks top foods. Used both for the admin preview
 * and (eventually) for the Saturday-9am newsletter cron.
 */
export async function buildWeeklyDigest(userId: string): Promise<WeeklyDigest | null> {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
  if (!user) return null;
  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, userId),
  });

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000);

  const meals = await db.query.meals.findMany({
    where: and(
      eq(schema.meals.userId, userId),
      gte(schema.meals.loggedAt, sevenDaysAgo),
    ),
    with: { entries: true },
    orderBy: [desc(schema.meals.loggedAt)],
  });

  const totalKcal = meals.reduce((a, m) => a + Number(m.totalKcal), 0);
  const totalMeals = meals.length;

  // Days that had at least one meal
  const daysWithMeals = new Set(meals.map((m) => m.logDate));

  // Top foods across the week
  const foodCounts = new Map<string, number>();
  for (const m of meals) {
    for (const e of m.entries) {
      const k = e.name.toLowerCase();
      foodCounts.set(k, (foodCounts.get(k) ?? 0) + 1);
    }
  }
  const topFoods = Array.from(foodCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: capitalize(name), count }));

  // Best day = highest kcal day (or could be "closest to target" — keep simple)
  const byDay = new Map<string, number>();
  for (const m of meals) {
    byDay.set(m.logDate, (byDay.get(m.logDate) ?? 0) + Number(m.totalKcal));
  }
  const bestDay = [...byDay.entries()]
    .sort((a, b) => b[1] - a[1])[0];

  const weekStartDate = new Date(Date.now() - 6 * 86400_000);
  const weekEnd = new Date();

  return {
    userId,
    userEmail: user.email,
    userName: user.name,
    weekStart: weekStartDate.toISOString().slice(0, 10),
    weekEnd: weekEnd.toISOString().slice(0, 10),
    daysLogged: daysWithMeals.size,
    totalKcal: Math.round(totalKcal),
    avgKcal: daysWithMeals.size > 0 ? Math.round(totalKcal / daysWithMeals.size) : 0,
    targetKcal: profile?.targetKcal ?? null,
    totalMeals,
    topFoods,
    bestDay: bestDay ? { date: bestDay[0], kcal: Math.round(bestDay[1]) } : null,
    hasData: totalMeals > 0,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
