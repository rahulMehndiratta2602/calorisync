import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { calculateTargets, ageFromDob, type Sex, type Goal, type ActivityLevel, type DietStyle } from "@/lib/macros";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  name: z.string().max(200).nullable().optional(),
  sex: z.enum(["female", "male", "other"]).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
  goal: z.enum(["lose", "maintain", "gain", "recomp"]).optional(),
  dietStyle: z.enum(["balanced", "keto", "high_protein", "mediterranean", "vegan", "vegetarian", "custom"]).optional(),
  timezone: z.string().min(2).max(64).optional(),
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
      { error: "Invalid update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const p = parsed.data;

  // Update user-level fields if present.
  if (p.name !== undefined || p.marketingOptIn !== undefined) {
    const userPatch: { name?: string | null; marketingOptIn?: boolean } = {};
    if (p.name !== undefined) userPatch.name = p.name;
    if (p.marketingOptIn !== undefined) userPatch.marketingOptIn = p.marketingOptIn;
    await db.update(schema.users).set(userPatch).where(eq(schema.users.id, sess.user.id));
  }

  // Build profile patch, fetch existing for macro recomputation context.
  const existing = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, sess.user.id),
  });
  if (!existing) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  const merged = {
    sex: (p.sex ?? existing.sex) as Sex | null | undefined,
    dob: p.dob === undefined ? existing.dob : p.dob,
    heightCm: p.heightCm !== undefined ? p.heightCm : existing.heightCm ? String(existing.heightCm) : undefined,
    weightKg: p.weightKg !== undefined ? p.weightKg : existing.weightKg ? String(existing.weightKg) : undefined,
    activityLevel: (p.activityLevel ?? existing.activityLevel) as ActivityLevel | null | undefined,
    goal: (p.goal ?? existing.goal) as Goal | null | undefined,
    dietStyle: (p.dietStyle ?? existing.dietStyle) as DietStyle | null | undefined,
    timezone: p.timezone ?? existing.timezone,
  };

  // Recompute targets only if we have enough info.
  let targets: ReturnType<typeof calculateTargets> | null = null;
  if (merged.weightKg && merged.heightCm && merged.dob && merged.sex && merged.activityLevel) {
    targets = calculateTargets({
      weightKg: Number(merged.weightKg),
      heightCm: Number(merged.heightCm),
      ageYears: ageFromDob(merged.dob),
      sex: merged.sex,
      activityLevel: merged.activityLevel,
      goal: (merged.goal ?? "maintain"),
      dietStyle: (merged.dietStyle ?? "balanced"),
    });
  }

  const profilePatch: Record<string, unknown> = {};
  if (p.sex !== undefined) profilePatch.sex = p.sex;
  if (p.dob !== undefined) profilePatch.dob = p.dob;
  if (p.heightCm !== undefined) profilePatch.heightCm = p.heightCm;
  if (p.weightKg !== undefined) profilePatch.weightKg = p.weightKg;
  if (p.activityLevel !== undefined) profilePatch.activityLevel = p.activityLevel;
  if (p.goal !== undefined) profilePatch.goal = p.goal;
  if (p.dietStyle !== undefined) profilePatch.dietStyle = p.dietStyle;
  if (p.timezone !== undefined) profilePatch.timezone = p.timezone;

  if (targets) {
    profilePatch.targetKcal = targets.kcal;
    profilePatch.targetProteinG = targets.proteinG;
    profilePatch.targetCarbsG = targets.carbsG;
    profilePatch.targetFatG = targets.fatG;
    profilePatch.targetsUpdatedAt = new Date();
  }

  if (Object.keys(profilePatch).length > 0) {
    await db
      .update(schema.userProfiles)
      .set(profilePatch)
      .where(eq(schema.userProfiles.userId, sess.user.id));
  }

  audit({
    actorUserId: sess.user.id,
    action: "profile.updated",
    targetType: "user_profile",
    targetId: sess.user.id,
    metadata: { fields: Object.keys(profilePatch) },
  }).catch(() => {});

  return NextResponse.json({ ok: true, targets });
}
