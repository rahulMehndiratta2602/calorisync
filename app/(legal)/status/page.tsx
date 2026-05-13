import type { Metadata } from "next";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Status",
  description: "Live status of the Calorisync platform — DB, API, AI.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HealthResponse {
  status: "ok" | "degraded";
  checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }>;
  uptimeSeconds: number;
  timestamp: string;
}

async function getHealth(): Promise<{ data: HealthResponse | null; httpStatus: number }> {
  // Self-fetch via 127.0.0.1 so we go through Caddy → Next without Cloudflare.
  try {
    const res = await fetch("http://127.0.0.1/api/health", {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    return { data: (await res.json()) as HealthResponse, httpStatus: res.status };
  } catch (err) {
    console.error("[status] failed to fetch health:", err);
    return { data: null, httpStatus: 0 };
  }
}

const CHECK_LABELS: Record<string, string> = {
  db: "Database (Postgres)",
  anthropic: "AI provider (Anthropic)",
};

export default async function StatusPage() {
  const { data } = await getHealth();
  const allOk = data?.status === "ok";

  return (
    <article className="mx-auto max-w-2xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">Status</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          {allOk ? "All systems operational" : "Some systems degraded"}
        </h1>
        <div className="mt-4 flex items-center justify-center gap-2">
          {allOk ? (
            <Badge variant="success" className="gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Live
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1.5">
              <AlertTriangle className="size-3.5" />
              Degraded
            </Badge>
          )}
          {data && (
            <span className="text-xs text-muted-foreground">
              checked {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </header>

      <section className="mt-10 flex flex-col gap-3">
        {data ? (
          Object.entries(data.checks).map(([key, check]) => (
            <Card key={key}>
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  {check.ok ? (
                    <CheckCircle2 className="size-5 text-emerald-500" />
                  ) : (
                    <XCircle className="size-5 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{CHECK_LABELS[key] ?? key}</p>
                    {check.error && (
                      <p className="text-xs text-destructive">{check.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={check.ok ? "success" : "destructive"}>
                    {check.ok ? "ok" : "down"}
                  </Badge>
                  {check.latencyMs != null && (
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                      {check.latencyMs}ms
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-5 text-center text-sm text-muted-foreground">
              Couldn't reach the health endpoint — the status checker itself is down.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        <p>
          This page refreshes on every load. The numbers come from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/api/health</code> which
          pings the database and the AI provider with each request. For incidents history and
          deeper observability, email{" "}
          <a href="mailto:hello@calorisync.com" className="text-primary underline-offset-2 hover:underline">
            hello@calorisync.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
