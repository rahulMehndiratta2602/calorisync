import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Admin · Email events" };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "success" | "outline" | "destructive" | "soft"> = {
  sent: "success",
  delivered: "success",
  stub_logged: "soft",
  queued: "outline",
  pending: "outline",
  bounced: "destructive",
  failed: "destructive",
  complained: "destructive",
};

export default async function AdminEmailEventsPage() {
  const events = await db
    .select()
    .from(schema.emailEvents)
    .orderBy(desc(schema.emailEvents.createdAt))
    .limit(300);

  const byTemplate = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.template] = (acc[e.template] || 0) + 1;
    return acc;
  }, {});

  const byStatus = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-destructive">
          Admin · Email events
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">Transactional log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every transactional email Calorisync would send (or did send). This is the queue
          Mailpanzer reads.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold">By template</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byTemplate).map(([t, c]) => (
                <Badge key={t} variant="outline">
                  {t} · {c}
                </Badge>
              ))}
              {Object.keys(byTemplate).length === 0 && (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-semibold">By status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(byStatus).map(([s, c]) => (
                <Badge key={s} variant={STATUS_VARIANT[s] || "outline"}>
                  {s} · {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">To</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Payload</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-b-0 align-top">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.template}</td>
                    <td className="px-4 py-3 text-xs">{e.recipient}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[e.status] || "outline"}>{e.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{e.provider}</td>
                    <td className="px-4 py-3 max-w-md">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          view
                        </summary>
                        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted/40 p-2 text-[11px] font-mono leading-relaxed">
                          {JSON.stringify(e.payload, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      No email events yet — sign someone up and they'll appear here.
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
