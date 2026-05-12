import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Flame, Beef, Wheat, Droplet, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeeklyChart } from "@/components/console/weekly-chart";
import { StreakCard } from "@/components/console/streak-card";
import { Logo } from "@/components/logo";
import {
  DEMO_MEALS,
  DEMO_STREAK,
  DEMO_TARGETS,
  DEMO_TOTALS,
  DEMO_WEEK,
} from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Demo",
  description: "Try Calorisync without signing up — see what the dashboard looks like with real data.",
};

export default function DemoPage() {
  const kcalPct = Math.min(100, Math.round((DEMO_TOTALS.kcal / DEMO_TARGETS.kcal) * 100));
  const proteinPct = Math.min(100, Math.round((DEMO_TOTALS.protein / DEMO_TARGETS.proteinG) * 100));
  const carbsPct = Math.min(100, Math.round((DEMO_TOTALS.carbs / DEMO_TARGETS.carbsG) * 100));
  const fatPct = Math.min(100, Math.round((DEMO_TOTALS.fat / DEMO_TARGETS.fatG) * 100));

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Demo banner */}
      <div className="border-b border-primary/30 bg-primary/8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-10">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" />
            <span className="font-medium">
              This is a demo
            </span>
            <span className="text-muted-foreground">
              · sample data, no account needed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/">← Back to landing</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">
                Sign up free <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="px-5 py-8 md:px-10 md:py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Logo />
                <Badge variant="outline" className="text-[10px]">
                  DEMO
                </Badge>
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
              <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h1>
            </div>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">
                <Plus className="size-4" /> Log a meal
              </Link>
            </Button>
          </header>

          <Card className="overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Calories
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-medium tabular-nums tracking-tight">
                      {DEMO_TOTALS.kcal.toLocaleString()}
                    </span>
                    <span className="text-base text-muted-foreground">
                      / {DEMO_TARGETS.kcal.toLocaleString()} kcal
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {(DEMO_TARGETS.kcal - DEMO_TOTALS.kcal).toLocaleString()} remaining
                  </p>
                </div>
                <Badge variant="default">
                  <Flame className="size-3" />
                  {kcalPct}% target
                </Badge>
              </div>
              <Progress value={kcalPct} className="mt-5 h-2.5" />
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <DemoMacroCard
              label="Protein"
              consumed={DEMO_TOTALS.protein}
              target={DEMO_TARGETS.proteinG}
              pct={proteinPct}
              icon={<Beef className="size-4 text-chart-1" />}
              tint="bg-chart-1"
            />
            <DemoMacroCard
              label="Carbs"
              consumed={DEMO_TOTALS.carbs}
              target={DEMO_TARGETS.carbsG}
              pct={carbsPct}
              icon={<Wheat className="size-4 text-chart-3" />}
              tint="bg-chart-3"
            />
            <DemoMacroCard
              label="Fat"
              consumed={DEMO_TOTALS.fat}
              target={DEMO_TARGETS.fatG}
              pct={fatPct}
              icon={<Droplet className="size-4 text-chart-4" />}
              tint="bg-chart-4"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
            <StreakCard
              currentStreak={DEMO_STREAK.current}
              longestStreak={DEMO_STREAK.longest}
              daysLogged7={DEMO_STREAK.daysLogged7}
            />
            <WeeklyChart days={DEMO_WEEK} targetKcal={DEMO_TARGETS.kcal} />
          </div>

          <section>
            <header className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Recent meals</h2>
              <span className="text-sm text-muted-foreground">Today's log</span>
            </header>
            <Card>
              <ul className="divide-y divide-border">
                {DEMO_MEALS.map((m) => (
                  <li key={m.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.aiSummary}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {m.loggedAt.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · {m.mealType} · {m.source === "photo" ? "📸 Photo" : m.source === "voice" ? "🎙 Voice" : "Typed"}
                      </p>
                    </div>
                    <span className="ml-3 text-sm font-semibold tabular-nums">
                      {m.totalKcal} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="font-display text-xl font-medium tracking-tight">
                  Ready to track your real meals?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  14-day Pro trial. No card required. Free tier forever.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/signup">
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function DemoMacroCard({
  label,
  consumed,
  target,
  pct,
  icon,
  tint,
}: {
  label: string;
  consumed: number;
  target: number;
  pct: number;
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
          <span className="ml-1 text-sm font-normal text-muted-foreground">/ {target}g</span>
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full ${tint} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
