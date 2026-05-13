import Link from "next/link";
import { eq, and, desc } from "drizzle-orm";
import { Plus, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { calculateTargets, ageFromDob } from "@/lib/macros";
import { getWeekBuckets, getStreaks } from "@/lib/dashboard-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeeklyChart } from "@/components/console/weekly-chart";
import { StreakCard } from "@/components/console/streak-card";
import { redirect } from "next/navigation";

export const metadata = { title: "Today" };
export const dynamic = "force-dynamic";

function startOfLocalDay(tz: string) {
  // Compute today's "log_date" anchored in the user's tz.
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(now); // YYYY-MM-DD
}

export default async function ConsoleDashboard() {
  const sess = await getCurrentSession();
  if (!sess) redirect("/signin");

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, sess.user.id),
  });

  // Onboard if profile is incomplete.
  if (!profile?.onboardedAt) redirect("/console/onboarding");

  const tz = profile.timezone || "UTC";
  const today = startOfLocalDay(tz);

  const [meals, weekBuckets, streaks] = await Promise.all([
    db.query.meals.findMany({
      where: and(
        eq(schema.meals.userId, sess.user.id),
        eq(schema.meals.logDate, today),
      ),
      orderBy: [desc(schema.meals.loggedAt)],
      limit: 12,
    }),
    getWeekBuckets(sess.user.id, tz),
    getStreaks(sess.user.id, tz),
  ]);

  // Compute totals.
  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + Number(m.totalKcal),
      protein: acc.protein + Number(m.totalProteinG),
      carbs: acc.carbs + Number(m.totalCarbsG),
      fat: acc.fat + Number(m.totalFatG),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const targets =
    profile.weightKg && profile.heightCm && profile.dob && profile.sex && profile.activityLevel
      ? calculateTargets({
          weightKg: Number(profile.weightKg),
          heightCm: Number(profile.heightCm),
          ageYears: ageFromDob(profile.dob),
          sex: profile.sex,
          activityLevel: profile.activityLevel,
          goal: profile.goal || "maintain",
          bodyFatPct: profile.bodyFatPct ? Number(profile.bodyFatPct) : undefined,
          dietStyle: profile.dietStyle || "balanced",
        })
      : {
          kcal: profile.targetKcal ?? 2000,
          proteinG: profile.targetProteinG ?? 130,
          carbsG: profile.targetCarbsG ?? 220,
          fatG: profile.targetFatG ?? 65,
        };

  const kcalPct = Math.min(100, Math.round((totals.kcal / Math.max(1, targets.kcal)) * 100));
  const proteinPct = Math.min(100, Math.round((totals.protein / Math.max(1, targets.proteinG)) * 100));
  const carbsPct = Math.min(100, Math.round((totals.carbs / Math.max(1, targets.carbsG)) * 100));
  const fatPct = Math.min(100, Math.round((totals.fat / Math.max(1, targets.fatG)) * 100));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              timeZone: tz,
            })}
          </h1>
        </div>
        <Button asChild size="lg">
          <Link href="/console/log">
            <Plus className="size-4" />
            Log a meal
          </Link>
        </Button>
      </header>

      <Card className="overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Calories</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-4xl font-medium tabular-nums tracking-tight">
                  {Math.round(totals.kcal).toLocaleString()}
                </span>
                <span className="text-base text-muted-foreground">
                  / {targets.kcal.toLocaleString()} kcal
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {Math.max(0, targets.kcal - Math.round(totals.kcal)).toLocaleString()} remaining
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={kcalPct >= 90 ? "success" : "default"}>
                <Flame className="size-3" />
                {kcalPct}% target
              </Badge>
            </div>
          </div>
          <Progress value={kcalPct} className="mt-5 h-2.5" />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <MacroCard
          label="Protein"
          consumed={Math.round(totals.protein)}
          target={targets.proteinG}
          pct={proteinPct}
          unit="g"
          icon={<Beef className="size-4 text-chart-1" />}
          tint="bg-chart-1"
        />
        <MacroCard
          label="Carbs"
          consumed={Math.round(totals.carbs)}
          target={targets.carbsG}
          pct={carbsPct}
          unit="g"
          icon={<Wheat className="size-4 text-chart-3" />}
          tint="bg-chart-3"
        />
        <MacroCard
          label="Fat"
          consumed={Math.round(totals.fat)}
          target={targets.fatG}
          pct={fatPct}
          unit="g"
          icon={<Droplet className="size-4 text-chart-4" />}
          tint="bg-chart-4"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <StreakCard
          currentStreak={streaks.current}
          longestStreak={streaks.longest}
          daysLogged7={streaks.daysLogged7}
        />
        <WeeklyChart days={weekBuckets} targetKcal={targets.kcal} />
      </div>

      <section>
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent meals</h2>
          <Link
            href="/console/history"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all →
          </Link>
        </header>
        {meals.length === 0 ? (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Plus className="size-6" />
              </div>
              <p className="font-display text-xl">Log your first meal</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Pick how you want to log: snap a photo, speak it, type a description, or use the quick-add
                preset library. All four take under 5 seconds.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link href="/console/log">
                    <Plus className="size-4" /> Log a meal
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/console/chat">Ask the AI coach</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {meals.map((m) => (
                <li key={m.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {m.aiSummary || `${m.mealType} meal`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(m.loggedAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: tz,
                      })}
                      {" · "}
                      {m.source}
                    </p>
                  </div>
                  <span className="ml-3 text-sm font-semibold tabular-nums">
                    {Math.round(Number(m.totalKcal))} kcal
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}

function MacroCard({
  label,
  consumed,
  target,
  pct,
  unit,
  icon,
  tint,
}: {
  label: string;
  consumed: number;
  target: number;
  pct: number;
  unit: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            {icon}
            <span>{label}</span>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
        </div>
        <p className="mt-3 text-2xl font-semibold tabular-nums">
          {consumed}
          <span className="ml-1 text-sm font-normal text-muted-foreground">/ {target}{unit}</span>
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${tint} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
