import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Admin · Audit log" };
export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const entries = await db
    .select({
      id: schema.auditLog.id,
      action: schema.auditLog.action,
      targetType: schema.auditLog.targetType,
      targetId: schema.auditLog.targetId,
      metadata: schema.auditLog.metadata,
      ip: schema.auditLog.ip,
      createdAt: schema.auditLog.createdAt,
      actorEmail: schema.users.email,
    })
    .from(schema.auditLog)
    .leftJoin(schema.users, eq(schema.users.id, schema.auditLog.actorUserId))
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(300);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-destructive">
          Admin · Audit log
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">Compliance trail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every consequential action across the app.
        </p>
      </header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Actor</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-b-0 align-top">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">{e.actorEmail || "—"}</td>
                    <td className="px-4 py-3 font-medium">{e.action}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {e.targetType || "—"}
                      {e.targetId ? ` · ${e.targetId}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                      {e.ip || "—"}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          view
                        </summary>
                        <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted/40 p-2 text-[11px] font-mono">
                          {JSON.stringify(e.metadata, null, 2)}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      Nothing audited yet — actions will appear here as users sign in and log
                      meals.
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
