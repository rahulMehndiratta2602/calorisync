import Link from "next/link";
import { eq, and } from "drizzle-orm";
import { ArrowLeft, Camera, Mic, Type, Plus, Sparkles } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MealDetailPage({ params }: PageProps) {
  const sess = await getCurrentSession();
  if (!sess) redirect("/signin");

  const { id } = await params;
  const meal = await db.query.meals.findFirst({
    where: and(eq(schema.meals.id, id), eq(schema.meals.userId, sess.user.id)),
    with: {
      entries: true,
      photos: true,
    },
  });
  if (!meal) notFound();

  const hasPhoto = meal.photos.length > 0;
  const sourceIcon =
    meal.source === "photo" ? Camera : meal.source === "voice" ? Mic : meal.source === "text" ? Type : Plus;
  const SrcIcon = sourceIcon;

  const confidence = meal.aiConfidence ? Number(meal.aiConfidence) : null;
  const confidencePct = confidence != null ? Math.round(confidence * 100) : null;
  const lowConfidence = confidence != null && confidence < 0.7;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Link
          href="/console/history"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> History
        </Link>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {new Date(meal.loggedAt).toLocaleString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <h1 className="font-display text-3xl font-medium tracking-tight">
              {meal.aiSummary || `${meal.mealType} meal`}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="soft" className="capitalize">
                {meal.mealType}
              </Badge>
              <Badge variant="outline" className="gap-1 capitalize">
                <SrcIcon className="size-3" /> {meal.source}
              </Badge>
              {confidencePct != null && (
                <Badge variant={lowConfidence ? "soft" : "success"} className="gap-1">
                  <Sparkles className="size-3" />
                  {confidencePct}% AI confidence
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
            <p className="font-display text-3xl font-medium tabular-nums">
              {Math.round(Number(meal.totalKcal))} kcal
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              P {Math.round(Number(meal.totalProteinG))}g · C {Math.round(Number(meal.totalCarbsG))}g · F{" "}
              {Math.round(Number(meal.totalFatG))}g
            </p>
          </div>
        </div>
      </header>

      {hasPhoto && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/meals/photo/${meal.id}`}
              alt={meal.aiSummary || "Meal photo"}
              className="block max-h-[600px] w-full object-cover"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-sm font-semibold">Items ({meal.entries.length})</h2>
          {meal.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items recorded.</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {meal.entries.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {Math.round(Number(e.grams))}g · P {Math.round(Number(e.proteinG))}g · C{" "}
                      {Math.round(Number(e.carbsG))}g · F {Math.round(Number(e.fatG))}g
                      {e.aiConfidence && (
                        <span className="ml-1.5 text-[10px] uppercase">
                          · {Math.round(Number(e.aiConfidence) * 100)}%
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="ml-3 font-semibold tabular-nums">{Math.round(Number(e.kcal))} kcal</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {meal.note && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-2 text-sm font-semibold">Note</h2>
            <p className="text-sm text-muted-foreground">{meal.note}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
