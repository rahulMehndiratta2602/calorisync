import { eq, and, desc, gte } from "drizzle-orm";
import { db, schema } from "./db";
import { calculateTargets, ageFromDob, type Sex, type Goal, type ActivityLevel, type DietStyle } from "./macros";

/**
 * Build the system prompt + user-facts block for the AI chat assistant.
 * This is the cache-breakpoint per CLAUDE.md ("at end of system prompt +
 * user_facts block, before per-turn data") — keep the structure stable so
 * Anthropic's prompt cache hits across messages in a session.
 */
export async function buildChatSystemContext(userId: string): Promise<{
  systemPrompt: string;
  userFacts: string;
}> {
  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, userId),
  });

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000);
  const meals = await db.query.meals.findMany({
    where: and(
      eq(schema.meals.userId, userId),
      gte(schema.meals.loggedAt, sevenDaysAgo),
    ),
    orderBy: [desc(schema.meals.loggedAt)],
    limit: 30,
  });

  const targets =
    profile?.weightKg && profile.heightCm && profile.dob && profile.sex && profile.activityLevel
      ? calculateTargets({
          weightKg: Number(profile.weightKg),
          heightCm: Number(profile.heightCm),
          ageYears: ageFromDob(profile.dob),
          sex: profile.sex as Sex,
          activityLevel: profile.activityLevel as ActivityLevel,
          goal: (profile.goal ?? "maintain") as Goal,
          dietStyle: (profile.dietStyle ?? "balanced") as DietStyle,
        })
      : null;

  const lines: string[] = [];
  lines.push("## User profile");
  if (profile) {
    if (profile.timezone) lines.push(`- Time zone: ${profile.timezone}`);
    if (profile.weightKg) lines.push(`- Weight: ${profile.weightKg} kg`);
    if (profile.heightCm) lines.push(`- Height: ${profile.heightCm} cm`);
    if (profile.dob) lines.push(`- Age: ${ageFromDob(profile.dob)} years`);
    if (profile.sex) lines.push(`- Sex: ${profile.sex}`);
    if (profile.activityLevel) lines.push(`- Activity level: ${profile.activityLevel}`);
    if (profile.goal) lines.push(`- Goal: ${profile.goal}`);
    if (profile.dietStyle) lines.push(`- Diet style: ${profile.dietStyle}`);
  } else {
    lines.push("- (profile not yet onboarded)");
  }
  if (targets) {
    lines.push("");
    lines.push("## Daily macro targets");
    lines.push(`- ${targets.kcal} kcal`);
    lines.push(`- ${targets.proteinG} g protein`);
    lines.push(`- ${targets.carbsG} g carbs`);
    lines.push(`- ${targets.fatG} g fat`);
    lines.push(`- BMR ~${targets.bmr}, TDEE ~${targets.tdee}`);
  }

  if (meals.length > 0) {
    lines.push("");
    lines.push("## Recent meals (last 7 days, newest first)");
    for (const m of meals) {
      const ts = new Date(m.loggedAt).toISOString();
      lines.push(
        `- [${ts}] ${m.mealType}: ${m.aiSummary ?? "(no summary)"} — ${Math.round(Number(m.totalKcal))} kcal, P ${Math.round(Number(m.totalProteinG))}g C ${Math.round(Number(m.totalCarbsG))}g F ${Math.round(Number(m.totalFatG))}g (via ${m.source})`,
      );
    }
  } else {
    lines.push("");
    lines.push("## Recent meals");
    lines.push("- (no meals logged yet)");
  }

  const userFacts = lines.join("\n");

  const systemPrompt = `You are the Calorisync coach — a calm, knowledgeable nutrition assistant inside the Calorisync calorie-tracker app. You help the user understand their macros, suggest tweaks, and answer diet questions.

Style rules:
- Concise. Default to 2-4 short paragraphs. Use bullets only when the user asks for a list.
- Specific. Cite the user's actual numbers from the facts block below — "you're 80g protein short today" beats "you should eat more protein."
- Honest. If you don't know (e.g., user asks about a food we don't have macros for), say so and offer a reasonable estimate with a confidence caveat.
- Practical. Recommend concrete meals/foods the user can act on. Reference common foods (chicken, rice, eggs, oats, lentils, dairy) rather than exotic ingredients.
- Safety: never give clinical medical advice. If asked about eating disorders, illness, or restrictive medical diets, recommend the user consult a registered dietitian or doctor.
- No "AI safety" preamble. Just answer.`;

  return { systemPrompt, userFacts };
}
