import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
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
  const sess = await getCurrentSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      mealId: schema.meals.id,
      logDate: schema.meals.logDate,
      loggedAt: schema.meals.loggedAt,
      mealType: schema.meals.mealType,
      source: schema.meals.source,
      summary: schema.meals.aiSummary,
      confidence: schema.meals.aiConfidence,
      itemName: schema.mealEntries.name,
      grams: schema.mealEntries.grams,
      kcal: schema.mealEntries.kcal,
      proteinG: schema.mealEntries.proteinG,
      carbsG: schema.mealEntries.carbsG,
      fatG: schema.mealEntries.fatG,
      itemConfidence: schema.mealEntries.aiConfidence,
    })
    .from(schema.meals)
    .leftJoin(schema.mealEntries, eq(schema.mealEntries.mealId, schema.meals.id))
    .where(eq(schema.meals.userId, sess.user.id))
    .orderBy(desc(schema.meals.loggedAt), schema.mealEntries.sortOrder);

  const cols = [
    "logDate",
    "loggedAt",
    "mealType",
    "source",
    "summary",
    "confidence",
    "itemName",
    "grams",
    "kcal",
    "proteinG",
    "carbsG",
    "fatG",
    "itemConfidence",
    "mealId",
  ] as const;
  const header = cols.join(",");
  const body = rows
    .map((r) => cols.map((c) => csvEscape(r[c as keyof typeof r])).join(","))
    .join("\n");
  const csv = header + "\n" + body + "\n";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="calorisync-meals-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
