import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export const metadata = { title: "History" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const sess = await getCurrentSession();
  if (!sess) redirect("/signin");

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, sess.user.id),
  });
  const tz = profile?.timezone || "UTC";

  const meals = await db.query.meals.findMany({
    where: eq(schema.meals.userId, sess.user.id),
    orderBy: [desc(schema.meals.loggedAt)],
    limit: 100,
  });

  const byDate = new Map<string, typeof meals>();
  for (const m of meals) {
    const day = m.logDate;
    const list = byDate.get(day) ?? [];
    list.push(m);
    byDate.set(day, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">History</p>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            All your meals
          </h1>
        </div>
        <Button asChild>
          <Link href="/console/log">
            <Plus className="size-4" /> Log a meal
          </Link>
        </Button>
      </header>

      {meals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <p className="font-display text-lg">No meals yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Once you start logging, your full meal history will live here.
            </p>
            <Button asChild className="mt-2">
              <Link href="/console/log">
                <Plus className="size-4" /> Log your first meal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {[...byDate.entries()].map(([day, ms]) => {
            const dayKcal = ms.reduce((a, m) => a + Number(m.totalKcal), 0);
            return (
              <section key={day}>
                <header className="mb-3 flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {new Date(day + "T12:00:00Z").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      timeZone: tz,
                    })}
                  </h2>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {Math.round(dayKcal).toLocaleString()} kcal · {ms.length} meal
                    {ms.length === 1 ? "" : "s"}
                  </span>
                </header>
                <Card>
                  <ul className="divide-y divide-border">
                    {ms.map((m) => (
                      <li key={m.id} className="flex items-center justify-between px-5 py-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {m.aiSummary || `${m.mealType} meal`}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {new Date(m.loggedAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              timeZone: tz,
                            })}{" "}
                            · {m.mealType} · {m.source}
                          </p>
                        </div>
                        <span className="ml-3 text-sm font-semibold tabular-nums">
                          {Math.round(Number(m.totalKcal))} kcal
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
