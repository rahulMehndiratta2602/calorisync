import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Feature flags" };
export const dynamic = "force-dynamic";

export default async function AdminFeatureFlagsPage() {
  const flags = await db
    .select()
    .from(schema.featureFlags)
    .orderBy(desc(schema.featureFlags.updatedAt));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-destructive">
          Admin · Feature flags
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">Flags & rollouts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle features without redeploying. Use the rollout percentage to ramp gradually.
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Key</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Enabled</th>
                  <th className="px-4 py-3 text-right font-medium">Rollout %</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((f) => (
                  <tr key={f.key} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs">{f.key}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.description || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={f.enabled ? "success" : "outline"}>
                        {f.enabled ? "on" : "off"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{f.rolloutPct}%</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(f.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {flags.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No flags defined yet. Seed some via INSERT INTO feature_flags(key, description, enabled, rollout_pct) VALUES (...);
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-sm">
          <p className="font-semibold">Seed example</p>
          <pre className="mt-2 overflow-auto rounded-xl bg-muted/40 p-3 font-mono text-xs leading-relaxed">{`INSERT INTO feature_flags (key, description, enabled, rollout_pct)
VALUES
  ('ai_chat_assistant', 'Chat with Claude about your macros', false, 0),
  ('weekly_digest_email', 'Saturday 9am weekly summary email', false, 0),
  ('barcode_scanner', 'Barcode lookup for packaged foods', false, 0),
  ('apple_health_sync', 'Two-way sync with Apple Health', false, 0)
ON CONFLICT (key) DO NOTHING;`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
