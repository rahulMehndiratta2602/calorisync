import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { Camera, Mic, Type, Plus } from "lucide-react";
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
    with: { photos: true },
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
                    {ms.map((m) => {
                      const hasPhoto = m.photos && m.photos.length > 0;
                      return (
                        <li key={m.id}>
                          <Link
                            href={`/console/meals/${m.id}`}
                            className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30"
                          >
                            <MealThumb
                              hasPhoto={hasPhoto}
                              mealId={m.id}
                              source={m.source}
                              mealType={m.mealType}
                              summary={m.aiSummary}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {m.aiSummary || `${m.mealType} meal`}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {new Date(m.loggedAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  timeZone: tz,
                                })}{" "}
                                · {m.mealType} · {sourceLabel(m.source)}
                              </p>
                            </div>
                            <span className="ml-3 shrink-0 text-sm font-semibold tabular-nums">
                              {Math.round(Number(m.totalKcal))} kcal
                            </span>
                          </Link>
                        </li>
                      );
                    })}
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

function sourceLabel(s: string): string {
  if (s === "photo") return "📸 Photo";
  if (s === "voice") return "🎙 Voice";
  if (s === "text") return "Typed";
  if (s === "manual") return "Quick-add";
  return s;
}

// Thumbnail: real photo if available, else a colored tile based on meal type.
function MealThumb({
  hasPhoto,
  mealId,
  source,
  mealType,
  summary,
}: {
  hasPhoto: boolean;
  mealId: string;
  source: string;
  mealType: string;
  summary: string | null;
}) {
  if (hasPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/meals/photo/${mealId}`}
        alt={summary || mealType}
        loading="lazy"
        className="size-14 shrink-0 rounded-xl object-cover ring-1 ring-border"
      />
    );
  }
  // Tinted tile + icon to match the entry source
  const Icon = source === "voice" ? Mic : source === "text" ? Type : source === "manual" ? Plus : Camera;
  const tint =
    mealType === "breakfast"
      ? "from-amber-400/20 to-orange-400/20 text-amber-700 dark:text-amber-300"
      : mealType === "lunch"
        ? "from-emerald-400/20 to-teal-400/20 text-emerald-700 dark:text-emerald-300"
        : mealType === "dinner"
          ? "from-fuchsia-400/20 to-rose-400/20 text-rose-700 dark:text-rose-300"
          : mealType === "snack"
            ? "from-sky-400/20 to-blue-400/20 text-sky-700 dark:text-sky-300"
            : "from-muted to-muted text-muted-foreground";
  return (
    <div
      aria-hidden
      className={`grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tint} ring-1 ring-border`}
    >
      <Icon className="size-5" />
    </div>
  );
}
