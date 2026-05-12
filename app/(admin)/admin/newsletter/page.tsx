import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { Download } from "lucide-react";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Admin · Newsletter" };
export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const subs = await db
    .select()
    .from(schema.newsletterSubscribers)
    .orderBy(desc(schema.newsletterSubscribers.createdAt))
    .limit(500);

  const total = subs.length;
  const active = subs.filter((s) => s.status === "active").length;
  const unsubscribed = subs.filter((s) => s.status === "unsubscribed").length;

  const bySource = subs.reduce<Record<string, number>>((acc, s) => {
    const k = s.source || "unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-destructive">
            Admin · Newsletter
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight">Subscribers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} total · {active} active · {unsubscribed} unsubscribed
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/api/admin/newsletter/export">
            <Download className="size-4" />
            Export CSV
          </Link>
        </Button>
      </header>

      <Card>
        <CardContent className="p-5">
          <p className="mb-3 text-sm font-semibold">By source</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(bySource).map(([source, count]) => (
              <Badge key={source} variant="outline">
                {source} · {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">UTM</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.source || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status === "active" ? "success" : "outline"}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {[s.utmSource, s.utmMedium, s.utmCampaign].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {s.ip || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {subs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No subscribers yet.
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
