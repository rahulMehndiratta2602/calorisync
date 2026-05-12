import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const sess = await getCurrentSession();
  if (!sess) redirect("/signin");

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, sess.user.id),
  });

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Account & preferences
        </h1>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <p className="text-sm font-semibold">Account</p>
          <Row label="Email" value={sess.user.email} />
          <Row label="Name" value={sess.user.name || "—"} />
          <Row
            label="Joined"
            value={new Date(sess.user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <p className="text-sm font-semibold">Profile</p>
          {profile ? (
            <>
              <Row label="Weight" value={profile.weightKg ? `${profile.weightKg} kg` : "—"} />
              <Row label="Height" value={profile.heightCm ? `${profile.heightCm} cm` : "—"} />
              <Row label="DOB" value={profile.dob || "—"} />
              <Row label="Activity" value={profile.activityLevel || "—"} />
              <Row label="Goal" value={profile.goal || "—"} />
              <Row label="Diet style" value={profile.dietStyle || "—"} />
              <Row label="Time zone" value={profile.timezone} />
              <Row
                label="Daily target"
                value={profile.targetKcal ? `${profile.targetKcal} kcal` : "—"}
              />
              <Row
                label="Macro targets"
                value={
                  profile.targetProteinG
                    ? `P ${profile.targetProteinG}g · C ${profile.targetCarbsG}g · F ${profile.targetFatG}g`
                    : "—"
                }
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Profile not yet set up.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Billing</p>
            <Badge variant="soft">Coming soon</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Stripe billing is being wired up. During open beta everything is free.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <p className="text-sm font-semibold text-destructive">Danger zone</p>
          <p className="text-sm text-muted-foreground">
            Sign out everywhere or delete your account.
          </p>
          <div className="flex gap-2">
            <form action="/api/auth/signout" method="post">
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
            <Button variant="ghost" size="sm" disabled>
              Delete account (coming soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/40 py-2 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
