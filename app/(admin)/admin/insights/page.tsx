import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Insights" };
export const dynamic = "force-dynamic";

async function safeQuery<T>(fn: () => Promise<T[]>, fallback: T[]): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin/insights] query failed:", err);
    return fallback;
  }
}

async function getStats() {
  const verifyRateRows = await safeQuery<{ rate: number }>(
    () =>
      db.execute<{ rate: number }>(sql`
        SELECT ROUND(
          100.0 * COUNT(*) FILTER (WHERE email_verified_at IS NOT NULL) /
          NULLIF(COUNT(*), 0),
          1
        )::float AS rate
        FROM users WHERE deleted_at IS NULL
      `) as unknown as Promise<{ rate: number }[]>,
    [{ rate: 0 }],
  );

  const onboardRateRows = await safeQuery<{ rate: number }>(
    () =>
      db.execute<{ rate: number }>(sql`
        SELECT ROUND(
          100.0 * COUNT(p.onboarded_at) / NULLIF(COUNT(u.id), 0),
          1
        )::float AS rate
        FROM users u
        LEFT JOIN user_profiles p ON p.user_id = u.id
        WHERE u.deleted_at IS NULL
      `) as unknown as Promise<{ rate: number }[]>,
    [{ rate: 0 }],
  );

  const avgRows = await safeQuery<{ avg: number }>(
    () =>
      db.execute<{ avg: number }>(sql`
        SELECT ROUND(AVG(meal_count), 1)::float AS avg
        FROM (
          SELECT COUNT(*) AS meal_count
          FROM meals
          WHERE deleted_at IS NULL
          GROUP BY user_id
        ) t
      `) as unknown as Promise<{ avg: number }[]>,
    [{ avg: 0 }],
  );

  const dietStyleBreakdown = await safeQuery<{ diet_style: string; count: number }>(
    () =>
      db.execute<{ diet_style: string; count: number }>(sql`
        SELECT COALESCE(diet_style::text, 'unset') AS diet_style, COUNT(*)::int AS count
        FROM user_profiles
        WHERE onboarded_at IS NOT NULL
        GROUP BY diet_style
        ORDER BY count DESC
      `) as unknown as Promise<{ diet_style: string; count: number }[]>,
    [],
  );

  const goalBreakdown = await safeQuery<{ goal: string; count: number }>(
    () =>
      db.execute<{ goal: string; count: number }>(sql`
        SELECT COALESCE(goal::text, 'unset') AS goal, COUNT(*)::int AS count
        FROM user_profiles
        WHERE onboarded_at IS NOT NULL
        GROUP BY goal
        ORDER BY count DESC
      `) as unknown as Promise<{ goal: string; count: number }[]>,
    [],
  );

  const mealSourceBreakdown = await safeQuery<{ source: string; count: number }>(
    () =>
      db.execute<{ source: string; count: number }>(sql`
        SELECT source::text AS source, COUNT(*)::int AS count
        FROM meals
        WHERE deleted_at IS NULL
        GROUP BY source
        ORDER BY count DESC
      `) as unknown as Promise<{ source: string; count: number }[]>,
    [],
  );

  const dailyVolume = await safeQuery<{ d: string; users: number; meals: number }>(
    () =>
      db.execute<{ d: string; users: number; meals: number }>(sql`
        SELECT
          to_char(date_trunc('day', logged_at), 'YYYY-MM-DD') AS d,
          COUNT(DISTINCT user_id)::int AS users,
          COUNT(*)::int AS meals
        FROM meals
        WHERE deleted_at IS NULL AND logged_at > now() - INTERVAL '14 days'
        GROUP BY d
        ORDER BY d DESC
      `) as unknown as Promise<{ d: string; users: number; meals: number }[]>,
    [],
  );

  const verifyRate = verifyRateRows[0];
  const onboardRate = onboardRateRows[0];
  const avgMealsPerUser = avgRows[0];

  return {
    verifyRate: verifyRate?.rate ?? 0,
    onboardRate: onboardRate?.rate ?? 0,
    avgMealsPerUser: avgMealsPerUser?.avg ?? 0,
    dietStyleBreakdown,
    goalBreakdown,
    mealSourceBreakdown,
    dailyVolume,
  };
}

export default async function AdminInsightsPage() {
  const s = await getStats();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-destructive">Admin · Insights</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">Platform health</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate stats refresh on each page load.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Email verified" value={`${s.verifyRate}%`} />
        <Stat label="Onboarded" value={`${s.onboardRate}%`} />
        <Stat label="Avg meals / user" value={String(s.avgMealsPerUser)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Breakdown title="Diet styles" rows={s.dietStyleBreakdown.map((r) => ({ label: r.diet_style, count: r.count }))} />
        <Breakdown title="Goals" rows={s.goalBreakdown.map((r) => ({ label: r.goal, count: r.count }))} />
        <Breakdown title="Meal log source" rows={s.mealSourceBreakdown.map((r) => ({ label: r.source, count: r.count }))} />
        <Breakdown
          title="Last 14 days (meals / day)"
          rows={s.dailyVolume.map((r) => ({ label: r.d, count: r.meals, secondary: `${r.users} users` }))}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-2 font-display text-3xl font-medium tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number; secondary?: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-semibold">{title}</p>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {rows.map((r) => {
              const pct = (r.count / max) * 100;
              return (
                <li key={r.label} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="capitalize">{r.label.replace(/_/g, " ")}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {r.count}
                      {r.secondary && <span className="ml-1.5 text-xs">· {r.secondary}</span>}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
