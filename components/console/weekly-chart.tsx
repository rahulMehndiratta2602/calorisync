import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface DayBucket {
  date: string; // YYYY-MM-DD in user TZ
  kcal: number;
  mealCount: number;
}

interface WeeklyChartProps {
  days: DayBucket[]; // 7 entries, oldest first
  targetKcal: number;
}

export function WeeklyChart({ days, targetKcal }: WeeklyChartProps) {
  const max = Math.max(targetKcal * 1.2, ...days.map((d) => d.kcal), 1);
  const todayIdx = days.length - 1;

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              This week
            </p>
            <p className="mt-0.5 text-base font-semibold">
              {days.reduce((a, d) => a + d.kcal, 0).toLocaleString()} kcal · {days.reduce((a, d) => a + d.mealCount, 0)} meals
            </p>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            avg{" "}
            {Math.round(
              days.reduce((a, d) => a + d.kcal, 0) / Math.max(1, days.filter((d) => d.kcal > 0).length || 1),
            ).toLocaleString()}{" "}
            / day
          </p>
        </header>

        <div className="relative">
          {/* Target line */}
          <div
            aria-hidden
            className="absolute inset-x-0 z-10 border-t border-dashed border-primary/40"
            style={{ top: `${100 - (targetKcal / max) * 100}%` }}
          >
            <span className="absolute -top-4 right-0 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {targetKcal} target
            </span>
          </div>

          <div className="grid h-40 grid-cols-7 items-end gap-2">
            {days.map((d, i) => {
              const pct = (d.kcal / max) * 100;
              const overTarget = d.kcal > targetKcal && targetKcal > 0;
              const isToday = i === todayIdx;
              return (
                <div key={d.date} className="flex flex-col items-center gap-1.5">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        d.kcal === 0
                          ? "bg-muted"
                          : overTarget
                            ? "bg-gradient-to-t from-amber-500 to-amber-400"
                            : isToday
                              ? "bg-gradient-to-t from-primary to-primary/80"
                              : "bg-gradient-to-t from-primary/70 to-primary/40",
                      )}
                      style={{ height: `${Math.max(pct, d.kcal === 0 ? 0 : 4)}%` }}
                      title={`${d.date}: ${Math.round(d.kcal)} kcal`}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] uppercase tracking-wider",
                      isToday ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {formatDayLabel(d.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}
