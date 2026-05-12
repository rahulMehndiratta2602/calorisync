import * as React from "react";
import { Flame, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  daysLogged7: number;
}

export function StreakCard({ currentStreak, longestStreak, daysLogged7 }: StreakCardProps) {
  const active = currentStreak >= 1;
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "grid size-12 place-items-center rounded-2xl",
              active
                ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-sm shadow-amber-500/30"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Flame className="size-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Streak</p>
            <p className="font-display text-2xl font-medium tabular-nums leading-none">
              {currentStreak}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                day{currentStreak === 1 ? "" : "s"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="size-3" />
            Best {longestStreak}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {daysLogged7}/7 days this week
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
