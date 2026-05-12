import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { Users, Mail, Utensils, FileText, ArrowRight } from "lucide-react";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Overview" };
export const dynamic = "force-dynamic";

async function getCounts() {
  const [users] = await db.execute<{ count: number }>(sql`select count(*)::int as count from users where deleted_at is null`);
  const [meals] = await db.execute<{ count: number }>(sql`select count(*)::int as count from meals where deleted_at is null`);
  const [newsletter] = await db.execute<{ count: number }>(sql`select count(*)::int as count from newsletter_subscribers where status = 'active'`);
  const [events] = await db.execute<{ count: number }>(sql`select count(*)::int as count from email_events where created_at > now() - interval '7 days'`);
  const [sessions] = await db.execute<{ count: number }>(sql`select count(*)::int as count from sessions where expires_at > now() and revoked_at is null`);
  return {
    users: users?.count ?? 0,
    meals: meals?.count ?? 0,
    newsletter: newsletter?.count ?? 0,
    events: events?.count ?? 0,
    activeSessions: sessions?.count ?? 0,
  };
}

async function getRecentActivity() {
  const recentUsers = await db.query.users.findMany({
    orderBy: [desc(schema.users.createdAt)],
    limit: 8,
  });
  const recentMeals = await db.query.meals.findMany({
    orderBy: [desc(schema.meals.loggedAt)],
    limit: 8,
    with: { user: { columns: { email: true } } },
  });
  const recentEvents = await db.query.emailEvents.findMany({
    orderBy: [desc(schema.emailEvents.createdAt)],
    limit: 10,
  });
  const recentNewsletter = await db.query.newsletterSubscribers.findMany({
    orderBy: [desc(schema.newsletterSubscribers.createdAt)],
    limit: 10,
  });
  return { recentUsers, recentMeals, recentEvents, recentNewsletter };
}

export default async function AdminOverview() {
  const [counts, activity] = await Promise.all([getCounts(), getRecentActivity()]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-destructive">Admin overview</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          The pulse of Calorisync
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live counts and recent activity across the platform.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Users" value={counts.users} icon={<Users className="size-4" />} />
        <Stat
          label="Newsletter"
          value={counts.newsletter}
          icon={<Mail className="size-4" />}
        />
        <Stat label="Meals logged" value={counts.meals} icon={<Utensils className="size-4" />} />
        <Stat
          label="Email events (7d)"
          value={counts.events}
          icon={<FileText className="size-4" />}
        />
        <Stat
          label="Active sessions"
          value={counts.activeSessions}
          icon={<Users className="size-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Recent users" href="/admin/users">
          {activity.recentUsers.length === 0 ? (
            <Empty>No users yet.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {activity.recentUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.name || "—"} · role={u.role}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {ago(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Recent newsletter signups" href="/admin/newsletter">
          {activity.recentNewsletter.length === 0 ? (
            <Empty>No subscribers yet.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {activity.recentNewsletter.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.email}</p>
                    <p className="text-xs text-muted-foreground">
                      via {s.source || "unknown"} · status={s.status}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {ago(s.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Recent meals" href="/admin/users">
          {activity.recentMeals.length === 0 ? (
            <Empty>No meals yet.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {activity.recentMeals.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {m.aiSummary || `${m.mealType} meal`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.user?.email} · {m.source} · {Math.round(Number(m.totalKcal))} kcal
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {ago(m.loggedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Recent email events" href="/admin/email-events">
          {activity.recentEvents.length === 0 ? (
            <Empty>No email events yet.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {activity.recentEvents.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.template}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      to {e.recipient} · {e.provider} · {e.status}
                    </p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {ago(e.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <p className="mt-2 font-display text-3xl font-medium tabular-nums">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </header>
      <Card>
        <CardContent className="p-5">{children}</CardContent>
      </Card>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

function ago(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const diffMs = Date.now() - date.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
