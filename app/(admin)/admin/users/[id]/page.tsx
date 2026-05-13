import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { ArrowLeft, User as UserIcon } from "lucide-react";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
  });
  if (!user) notFound();

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, id),
  });

  const [meals, sessions, emailEvents, auditEntries] = await Promise.all([
    db.query.meals.findMany({
      where: eq(schema.meals.userId, id),
      orderBy: [desc(schema.meals.loggedAt)],
      limit: 50,
    }),
    db.query.sessions.findMany({
      where: eq(schema.sessions.userId, id),
      orderBy: [desc(schema.sessions.lastUsedAt)],
      limit: 20,
    }),
    db.query.emailEvents.findMany({
      where: eq(schema.emailEvents.userId, id),
      orderBy: [desc(schema.emailEvents.createdAt)],
      limit: 30,
    }),
    db.query.auditLog.findMany({
      where: eq(schema.auditLog.actorUserId, id),
      orderBy: [desc(schema.auditLog.createdAt)],
      limit: 30,
    }),
  ]);

  const totalKcal = meals.reduce((a, m) => a + Number(m.totalKcal), 0);
  const activeSessions = sessions.filter(
    (s) => s.expiresAt > new Date() && !s.revokedAt,
  ).length;
  const adminBadge =
    user.role === "admin" || user.role === "superadmin" || isAdminEmail(user.email);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> All users
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
              <UserIcon className="size-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-medium tracking-tight">
                {user.name || user.email}
              </h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            {adminBadge && (
              <Badge variant="default" className="ml-2">
                admin
              </Badge>
            )}
            {user.deletedAt && <Badge variant="destructive">deleted</Badge>}
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Meals logged" value={meals.length.toString()} />
        <Stat label="Total kcal" value={Math.round(totalKcal).toLocaleString()} />
        <Stat label="Active sessions" value={activeSessions.toString()} />
        <Stat label="Email events" value={emailEvents.length.toString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Profile</h2>
            {profile ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <Row label="Time zone" value={profile.timezone} />
                <Row
                  label="Weight"
                  value={profile.weightKg ? `${profile.weightKg} kg` : "—"}
                />
                <Row
                  label="Height"
                  value={profile.heightCm ? `${profile.heightCm} cm` : "—"}
                />
                <Row label="DOB" value={profile.dob || "—"} />
                <Row label="Sex" value={profile.sex || "—"} />
                <Row label="Activity" value={profile.activityLevel || "—"} />
                <Row label="Goal" value={profile.goal || "—"} />
                <Row label="Diet style" value={profile.dietStyle || "—"} />
                <Row
                  label="Target kcal"
                  value={profile.targetKcal ? `${profile.targetKcal}` : "—"}
                />
                <Row
                  label="Onboarded"
                  value={profile.onboardedAt ? new Date(profile.onboardedAt).toLocaleDateString() : "no"}
                />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Profile not created yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Active sessions</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sessions.slice(0, 8).map((s) => {
                  const active = !s.revokedAt && s.expiresAt > new Date();
                  return (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {s.userAgent?.slice(0, 60) || "(unknown agent)"}
                        </p>
                        <p className="text-muted-foreground">
                          {s.ip || "?"} · last used {new Date(s.lastUsedAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={active ? "success" : "outline"} className="ml-2">
                        {active ? "active" : "revoked"}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Recent meals (50)</h2>
          {meals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meals logged yet.</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {meals.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.aiSummary || m.mealType}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(m.loggedAt).toLocaleString()} · {m.mealType} · {m.source}
                    </p>
                  </div>
                  <span className="ml-3 text-sm font-semibold tabular-nums">
                    {Math.round(Number(m.totalKcal))} kcal
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-sm font-semibold">Audit trail (30)</h2>
          {auditEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit entries.</p>
          ) : (
            <ul className="divide-y divide-border/40 text-xs">
              {auditEntries.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-1.5">
                  <span className="font-medium">{a.action}</span>
                  <span className="text-muted-foreground">
                    {a.ip || "?"} · {new Date(a.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-medium tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium capitalize">{value.replace(/_/g, " ")}</dd>
    </>
  );
}
