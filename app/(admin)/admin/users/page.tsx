import { desc, sql, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // Pull users with profile summary + meal/session counts.
  const users = await db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      verifiedAt: schema.users.emailVerifiedAt,
      lastSeenAt: schema.users.lastSeenAt,
      createdAt: schema.users.createdAt,
      onboardedAt: schema.userProfiles.onboardedAt,
      timezone: schema.userProfiles.timezone,
      goal: schema.userProfiles.goal,
      targetKcal: schema.userProfiles.targetKcal,
      mealCount: sql<number>`(SELECT COUNT(*)::int FROM ${schema.meals} m WHERE m.user_id = ${schema.users.id})`,
    })
    .from(schema.users)
    .leftJoin(schema.userProfiles, eq(schema.userProfiles.userId, schema.users.id))
    .orderBy(desc(schema.users.createdAt))
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-destructive">Admin · Users</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">All users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} user{users.length === 1 ? "" : "s"} · most recent first
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Onboarded</th>
                  <th className="px-4 py-3 font-medium">Goal</th>
                  <th className="px-4 py-3 text-right font-medium">Target</th>
                  <th className="px-4 py-3 text-right font-medium">Meals</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/users/${u.id}`}
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        {u.email}
                      </a>
                      {!u.verifiedAt && (
                        <span className="ml-2 text-xs text-amber-600">unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{u.name || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "user" ? "soft" : "default"}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.onboardedAt ? new Date(u.onboardedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 capitalize">{u.goal || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {u.targetKcal ? `${u.targetKcal} kcal` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{u.mealCount}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
