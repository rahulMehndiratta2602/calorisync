import Link from "next/link";
import { desc } from "drizzle-orm";
import { Mail, Calendar, Flame, Utensils } from "lucide-react";
import { db, schema } from "@/lib/db";
import { buildWeeklyDigest } from "@/lib/digest";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Weekly digest preview" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ userId?: string }>;
}

export default async function AdminDigestPreviewPage({ searchParams }: PageProps) {
  const { userId } = await searchParams;

  // List users so admin can pick one.
  const users = await db
    .select({ id: schema.users.id, email: schema.users.email, name: schema.users.name })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .limit(50);

  const digest = userId ? await buildWeeklyDigest(userId) : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-destructive">
          Admin · Weekly digest preview
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">
          Saturday 9am newsletter, rendered
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a user to see what their weekly digest would look like when Mailpanzer fires.
        </p>
      </header>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-semibold">Pick a user</p>
          <div className="flex flex-wrap gap-2">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              users.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/digest-preview?userId=${u.id}`}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    userId === u.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {u.email}
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {!digest && userId && (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            User not found.
          </CardContent>
        </Card>
      )}

      {digest && (
        <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
          <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-background px-8 py-6">
            <p className="text-xs font-mono uppercase tracking-wider text-primary">
              Subject: Your week in macros — {digest.weekStart} to {digest.weekEnd}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              To: {digest.userEmail} · From: hello@calorisync.com
            </p>
          </div>

          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <Mail className="size-5 text-primary" />
              <h2 className="font-display text-2xl tracking-tight">
                Hi {digest.userName || "there"} — here's your week
              </h2>
            </div>

            {!digest.hasData ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No meals logged this week. The digest would say "We missed you — come log a meal
                so next week's digest has something to celebrate."
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Stat
                    icon={<Calendar className="size-4 text-chart-2" />}
                    label="Days logged"
                    value={`${digest.daysLogged}/7`}
                  />
                  <Stat
                    icon={<Utensils className="size-4 text-chart-3" />}
                    label="Total meals"
                    value={String(digest.totalMeals)}
                  />
                  <Stat
                    icon={<Flame className="size-4 text-chart-4" />}
                    label="Avg kcal/day"
                    value={digest.avgKcal.toLocaleString()}
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-muted/30 p-5">
                  <p className="text-sm">
                    You averaged <span className="font-semibold">{digest.avgKcal}</span> kcal a day{" "}
                    {digest.targetKcal ? (
                      digest.avgKcal > digest.targetKcal ? (
                        <>against a target of {digest.targetKcal} — about {digest.avgKcal - digest.targetKcal} over.</>
                      ) : (
                        <>against a target of {digest.targetKcal} — about {digest.targetKcal - digest.avgKcal} under.</>
                      )
                    ) : (
                      <>this week.</>
                    )}{" "}
                    {digest.daysLogged === 7 ? (
                      <strong>Logged every single day — that's the hard part. Nice work.</strong>
                    ) : (
                      <>
                        You logged {digest.daysLogged} of 7 days. Try to nudge that higher next
                        week — even a quick text-log on a busy day helps.
                      </>
                    )}
                  </p>
                </div>

                {digest.topFoods.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 text-sm font-semibold">Top foods this week</p>
                    <ul className="flex flex-wrap gap-2">
                      {digest.topFoods.map((f) => (
                        <Badge key={f.name} variant="soft">
                          {f.name} · {f.count}×
                        </Badge>
                      ))}
                    </ul>
                  </div>
                )}

                {digest.bestDay && (
                  <p className="mt-6 text-sm text-muted-foreground">
                    Biggest day was{" "}
                    <span className="font-medium text-foreground">
                      {new Date(digest.bestDay.date + "T12:00:00Z").toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </span>{" "}
                    at {digest.bestDay.kcal.toLocaleString()} kcal.
                  </p>
                )}

                <div className="mt-8 rounded-xl bg-primary/8 p-5 text-sm">
                  <p className="font-semibold">See you next Saturday.</p>
                  <p className="mt-1 text-muted-foreground">
                    Keep logging — we'll be back with another summary.
                  </p>
                </div>

                <p className="mt-8 text-center text-[11px] text-muted-foreground">
                  Calorisync · hello@calorisync.com ·{" "}
                  <a href="/api/newsletter/unsubscribe" className="underline-offset-2 hover:underline">
                    Unsubscribe
                  </a>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
