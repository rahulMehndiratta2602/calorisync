import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itemSchema = z.object({
  name: z.string().min(1).max(300),
  grams: z.number().min(0).max(5000),
  kcal: z.number().min(0).max(10000),
  protein_g: z.number().min(0).max(500),
  carbs_g: z.number().min(0).max(1000),
  fat_g: z.number().min(0).max(500),
  fiber_g: z.number().min(0).max(200).optional(),
  confidence: z.number().min(0).max(1),
});

const bodySchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]),
  source: z.enum(["photo", "voice", "text", "manual"]),
  summary: z.string().max(500),
  items: z.array(itemSchema).min(1).max(20),
  overall_confidence: z.number().min(0).max(1),
  note: z.string().max(500).optional(),
  ai_raw: z.record(z.string(), z.unknown()).optional(),
  photo: z
    .object({
      bucket: z.string().max(200),
      key: z.string().max(500),
      bytes: z.number().int().min(0).max(20_000_000),
      mimeType: z.string().max(64),
      width: z.number().int().min(0).max(20000).optional(),
      height: z.number().int().min(0).max(20000).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const sess = await getCurrentSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid meal payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, sess.user.id),
  });
  const tz = profile?.timezone || "UTC";

  const now = new Date();
  const logDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  // Totals
  const totals = parsed.data.items.reduce(
    (acc, it) => ({
      kcal: acc.kcal + it.kcal,
      protein: acc.protein + it.protein_g,
      carbs: acc.carbs + it.carbs_g,
      fat: acc.fat + it.fat_g,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  // Insert meal + entries in a transaction.
  let mealId: string | null = null;
  await db.transaction(async (tx) => {
    const [meal] = await tx
      .insert(schema.meals)
      .values({
        userId: sess.user.id,
        logDate,
        loggedAt: now,
        mealType: parsed.data.meal_type,
        source: parsed.data.source,
        note: parsed.data.note,
        aiConfidence: parsed.data.overall_confidence.toFixed(2),
        aiSummary: parsed.data.summary,
        aiRaw: parsed.data.ai_raw ?? null,
        totalKcal: totals.kcal.toFixed(2),
        totalProteinG: totals.protein.toFixed(2),
        totalCarbsG: totals.carbs.toFixed(2),
        totalFatG: totals.fat.toFixed(2),
      })
      .returning({ id: schema.meals.id });
    mealId = meal.id;

    await tx.insert(schema.mealEntries).values(
      parsed.data.items.map((it, idx) => ({
        mealId: meal.id,
        name: it.name,
        grams: it.grams.toFixed(2),
        kcal: it.kcal.toFixed(2),
        proteinG: it.protein_g.toFixed(2),
        carbsG: it.carbs_g.toFixed(2),
        fatG: it.fat_g.toFixed(2),
        fiberG: it.fiber_g != null ? it.fiber_g.toFixed(2) : null,
        aiConfidence: it.confidence.toFixed(2),
        sortOrder: idx,
      })),
    );

    if (parsed.data.photo) {
      await tx.insert(schema.mealPhotos).values({
        mealId: meal.id,
        s3Key: parsed.data.photo.key,
        bucket: parsed.data.photo.bucket,
        bytes: parsed.data.photo.bytes,
        mimeType: parsed.data.photo.mimeType,
        width: parsed.data.photo.width,
        height: parsed.data.photo.height,
        aiParsedAt: new Date(),
      });
    }
  });

  // Audit + fire-and-forget side effects.
  audit({
    actorUserId: sess.user.id,
    action: "meal.logged",
    targetType: "meal",
    targetId: mealId ?? undefined,
    metadata: {
      source: parsed.data.source,
      kcal: Math.round(totals.kcal),
      items: parsed.data.items.length,
      confidence: parsed.data.overall_confidence,
    },
  }).catch(() => {});

  // Fire-and-forget: first-meal email event for downstream marketing flows.
  const mealCount = await db.$count(schema.meals, eq(schema.meals.userId, sess.user.id));
  if (mealCount === 1) {
    sendEmail({
      to: sess.user.email,
      template: "first_meal_logged",
      payload: { summary: parsed.data.summary, kcal: Math.round(totals.kcal) },
      userId: sess.user.id,
    }).catch((err) => console.error("[meals/save] first-meal email failed:", err));
  }

  return NextResponse.json({
    ok: true,
    mealId,
    totals: {
      kcal: Math.round(totals.kcal),
      protein_g: Math.round(totals.protein),
      carbs_g: Math.round(totals.carbs),
      fat_g: Math.round(totals.fat),
    },
  });
}
