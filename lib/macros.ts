// Macro & calorie target calculations.
// Per CLAUDE.md (LOCKED):
//   Default split (recomputed when weight or goal changes; overridable via diet_style):
//     Protein: max(1.6 g/kg lean mass, 30% of daily kcal)
//     Fat:     max(0.6 g/kg body weight, 25% of daily kcal)
//     Carbs:   remainder
//   Diet-style overrides:
//     keto             — fat 70% / protein 25% / carbs 5%
//     high_protein     — protein 35% / fat 25% / carbs 40%
//     mediterranean    — fat 40% / protein 20% / carbs 40%

export type Sex = "male" | "female" | "other";
export type Goal = "lose" | "maintain" | "gain" | "recomp";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type DietStyle =
  | "balanced"
  | "keto"
  | "high_protein"
  | "mediterranean"
  | "vegan"
  | "vegetarian"
  | "custom";

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 } as const;

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_KCAL_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 350,
  recomp: -200,
};

export interface ProfileInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  bodyFatPct?: number; // 0-100 — for lean-mass calc
  weeklyChangeKg?: number; // overrides default adjustment
  dietStyle?: DietStyle;
}

export interface MacroTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  bmr: number;
  tdee: number;
  source: "default" | DietStyle;
}

// Mifflin-St Jeor (1990) — most accurate general-population BMR formula.
export function calculateBmr({
  weightKg,
  heightCm,
  ageYears,
  sex,
}: Pick<ProfileInput, "weightKg" | "heightCm" | "ageYears" | "sex">): number {
  // Treat "other" as average of male/female for fairness.
  const sexOffset = sex === "male" ? 5 : sex === "female" ? -161 : -78;
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + sexOffset;
}

export function calculateTdee(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

export function leanMassKg({
  weightKg,
  bodyFatPct,
}: Pick<ProfileInput, "weightKg" | "bodyFatPct">): number {
  if (bodyFatPct && bodyFatPct > 5 && bodyFatPct < 60) {
    return weightKg * (1 - bodyFatPct / 100);
  }
  // No BF% known: assume 25% — conservative middle estimate.
  return weightKg * 0.75;
}

export function calculateTargets(input: ProfileInput): MacroTargets {
  const bmr = calculateBmr(input);
  const tdee = calculateTdee(bmr, input.activityLevel);
  const adjust = input.weeklyChangeKg
    ? Math.round((input.weeklyChangeKg * 7700) / 7)
    : GOAL_KCAL_ADJUSTMENT[input.goal];
  // Don't let target dip below 1200 (women) / 1500 (men) — basic safety floor.
  const floor = input.sex === "male" ? 1500 : 1200;
  const kcal = Math.max(floor, Math.round(tdee + adjust));

  const lean = leanMassKg(input);

  const dietStyle = input.dietStyle ?? "balanced";

  if (dietStyle === "keto") {
    return splitByPct(kcal, { protein: 0.25, fat: 0.7, carbs: 0.05 }, bmr, tdee, "keto");
  }
  if (dietStyle === "high_protein") {
    return splitByPct(kcal, { protein: 0.35, fat: 0.25, carbs: 0.4 }, bmr, tdee, "high_protein");
  }
  if (dietStyle === "mediterranean") {
    return splitByPct(kcal, { protein: 0.2, fat: 0.4, carbs: 0.4 }, bmr, tdee, "mediterranean");
  }

  // Default (balanced / vegan / vegetarian / custom):
  // Protein: max(1.6 g/kg lean, 30% kcal)
  // Fat:     max(0.6 g/kg body, 25% kcal)
  // Carbs:   remainder (min 0).
  const proteinG = Math.round(Math.max(1.6 * lean, (kcal * 0.3) / KCAL_PER_G.protein));
  const fatG = Math.round(
    Math.max(0.6 * input.weightKg, (kcal * 0.25) / KCAL_PER_G.fat),
  );
  const remainingKcal = kcal - proteinG * KCAL_PER_G.protein - fatG * KCAL_PER_G.fat;
  const carbsG = Math.max(0, Math.round(remainingKcal / KCAL_PER_G.carbs));

  return {
    kcal,
    proteinG,
    carbsG,
    fatG,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    source: "default",
  };
}

function splitByPct(
  kcal: number,
  pct: { protein: number; fat: number; carbs: number },
  bmr: number,
  tdee: number,
  style: DietStyle,
): MacroTargets {
  return {
    kcal,
    proteinG: Math.round((kcal * pct.protein) / KCAL_PER_G.protein),
    fatG: Math.round((kcal * pct.fat) / KCAL_PER_G.fat),
    carbsG: Math.round((kcal * pct.carbs) / KCAL_PER_G.carbs),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    source: style,
  };
}

// Helper for displaying progress rings/bars.
export function macroProgress(
  consumed: { kcal: number; proteinG: number; carbsG: number; fatG: number },
  target: { kcal: number; proteinG: number; carbsG: number; fatG: number },
) {
  const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
  return {
    kcal: clamp01(consumed.kcal / Math.max(1, target.kcal)),
    protein: clamp01(consumed.proteinG / Math.max(1, target.proteinG)),
    carbs: clamp01(consumed.carbsG / Math.max(1, target.carbsG)),
    fat: clamp01(consumed.fatG / Math.max(1, target.fatG)),
  };
}

export function ageFromDob(dob: string | Date): number {
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(d.getTime())) return 30;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const monthDiff = now.getMonth() - d.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
