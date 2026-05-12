import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { calculateTargets, ageFromDob, type Sex, type Goal, type ActivityLevel, type DietStyle } from "@/lib/macros";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  name: z.string().max(200).optional(),
  sex: z.enum(["female", "male", "other"]),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  heightCm: z.string().refine((v) => Number(v) > 80 && Number(v) < 260),
  weightKg: z.string().refine((v) => Number(v) > 25 && Number(v) < 350),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose", "maintain", "gain", "recomp"]),
  dietStyle: z.enum(["balanced", "keto", "high_protein", "mediterranean", "vegan", "vegetarian", "custom"]),
  timezone: z.string().min(2).max(64),
  marketingOptIn: z.boolean().optional(),
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
      { error: "Invalid profile", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const p = parsed.data;

  const weightKg = Number(p.weightKg);
  const heightCm = Number(p.heightCm);
  const ageYears = ageFromDob(p.dob);

  const targets = calculateTargets({
    weightKg,
    heightCm,
    ageYears,
    sex: p.sex as Sex,
    activityLevel: p.activityLevel as ActivityLevel,
    goal: p.goal as Goal,
    dietStyle: p.dietStyle as DietStyle,
  });

  await db
    .update(schema.userProfiles)
    .set({
      timezone: p.timezone,
      weightKg: String(weightKg),
      heightCm: String(heightCm),
      dob: p.dob,
      sex: p.sex,
      activityLevel: p.activityLevel,
      goal: p.goal,
      dietStyle: p.dietStyle,
      targetKcal: targets.kcal,
      targetProteinG: targets.proteinG,
      targetCarbsG: targets.carbsG,
      targetFatG: targets.fatG,
      targetsUpdatedAt: new Date(),
      onboardedAt: new Date(),
    })
    .where(eq(schema.userProfiles.userId, sess.user.id));

  if (p.name) {
    await db
      .update(schema.users)
      .set({ name: p.name, marketingOptIn: !!p.marketingOptIn })
      .where(eq(schema.users.id, sess.user.id));
  }

  if (p.marketingOptIn) {
    // Add to newsletter subscribers as well (idempotent).
    try {
      const existing = await db.query.newsletterSubscribers.findFirst({
        where: eq(schema.newsletterSubscribers.email, sess.user.email),
      });
      if (!existing) {
        await db.insert(schema.newsletterSubscribers).values({
          email: sess.user.email,
          source: "onboarding",
          userId: sess.user.id,
        });
      }
    } catch (err) {
      console.error("[onboard] newsletter add failed:", err);
    }
  }

  return NextResponse.json({ ok: true, targets });
}
