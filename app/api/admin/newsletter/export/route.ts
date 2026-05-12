import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const subs = await db
    .select()
    .from(schema.newsletterSubscribers)
    .orderBy(desc(schema.newsletterSubscribers.createdAt));

  const cols: (keyof typeof subs[number])[] = [
    "id",
    "email",
    "source",
    "status",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "referrer",
    "ip",
    "userAgent",
    "createdAt",
    "confirmedAt",
    "unsubscribedAt",
  ];
  const header = cols.join(",");
  const rows = subs.map((s) => cols.map((c) => csvEscape(s[c])).join(",")).join("\n");
  const csv = header + "\n" + rows + "\n";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="calorisync-newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
