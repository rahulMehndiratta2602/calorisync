// Seed a test user with a profile + some meals so the dashboard renders
// usefully on first sign-in. Run with: npx tsx scripts/seed-test-user.ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";

// Tiny .env.local loader (no dotenv dep needed).
try {
  const envPath = join(process.cwd(), ".env.local");
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // .env.local optional — fall back to existing process.env
}

const TEST_EMAIL = (process.argv[2] || "mandyratta@gmail.com").toLowerCase();
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_UNPOOLED required");

const sql = postgres(url, { prepare: false, max: 5 });
const db = drizzle(sql, { schema });

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoDate(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10);
}
function todayAt(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}
function daysAgo(n: number, hour: number, minute: number): Date {
  const d = new Date(Date.now() - n * 86400_000);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log(`Seeding test user: ${TEST_EMAIL}`);

  // Upsert the user
  let user = await db.query.users.findFirst({
    where: eq(schema.users.email, TEST_EMAIL),
  });
  if (!user) {
    const [u] = await db
      .insert(schema.users)
      .values({
        email: TEST_EMAIL,
        emailVerifiedAt: new Date(),
        name: "Demo Tester",
        marketingOptIn: true,
      })
      .returning();
    user = u;
    console.log(`Created user ${u.id}`);
  } else {
    console.log(`User already exists ${user.id}`);
  }

  // Profile (idempotent upsert)
  const existingProfile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, user.id),
  });
  if (!existingProfile) {
    await db.insert(schema.userProfiles).values({
      userId: user.id,
      timezone: "Asia/Kolkata",
      weightKg: "70.0",
      heightCm: "175.0",
      dob: "1995-06-15",
      sex: "male",
      activityLevel: "moderate",
      goal: "maintain",
      dietStyle: "balanced",
      targetKcal: 2400,
      targetProteinG: 150,
      targetCarbsG: 270,
      targetFatG: 80,
      targetsUpdatedAt: new Date(),
      onboardedAt: new Date(),
    });
    console.log("Created profile (onboarded, balanced 2400 kcal target)");
  } else if (!existingProfile.onboardedAt) {
    await db
      .update(schema.userProfiles)
      .set({
        timezone: "Asia/Kolkata",
        weightKg: "70.0",
        heightCm: "175.0",
        dob: "1995-06-15",
        sex: "male",
        activityLevel: "moderate",
        goal: "maintain",
        dietStyle: "balanced",
        targetKcal: 2400,
        targetProteinG: 150,
        targetCarbsG: 270,
        targetFatG: 80,
        targetsUpdatedAt: new Date(),
        onboardedAt: new Date(),
      })
      .where(eq(schema.userProfiles.userId, user.id));
    console.log("Updated profile (marked onboarded)");
  } else {
    console.log("Profile already onboarded");
  }

  // Wipe any existing seed meals (so re-runs are idempotent)
  await db.delete(schema.meals).where(eq(schema.meals.userId, user.id));
  console.log("Wiped existing meals for clean reseed");

  // Seed meals for today + past 6 days
  const todayMeals = [
    {
      logDate: todayDate(),
      loggedAt: todayAt(8, 42),
      mealType: "breakfast" as const,
      source: "photo" as const,
      aiSummary: "Greek yogurt bowl with berries and granola",
      aiConfidence: "0.92",
      totalKcal: "320",
      totalProteinG: "22",
      totalCarbsG: "45",
      totalFatG: "6",
      entries: [
        { name: "Greek yogurt (non-fat)", grams: "170", kcal: "100", proteinG: "17", carbsG: "6", fatG: "0.7", conf: "0.94" },
        { name: "Mixed berries", grams: "80", kcal: "45", proteinG: "1", carbsG: "11", fatG: "0.3", conf: "0.92" },
        { name: "Granola", grams: "35", kcal: "175", proteinG: "4", carbsG: "28", fatG: "5", conf: "0.89" },
      ],
    },
    {
      logDate: todayDate(),
      loggedAt: todayAt(13, 15),
      mealType: "lunch" as const,
      source: "voice" as const,
      aiSummary: "Chicken with quinoa and roasted vegetables",
      aiConfidence: "0.88",
      totalKcal: "620",
      totalProteinG: "52",
      totalCarbsG: "55",
      totalFatG: "18",
      entries: [
        { name: "Chicken breast (cooked)", grams: "180", kcal: "297", proteinG: "56", carbsG: "0", fatG: "6.5", conf: "0.94" },
        { name: "Quinoa (cooked)", grams: "150", kcal: "180", proteinG: "6.6", carbsG: "32", fatG: "2.8", conf: "0.88" },
        { name: "Roasted vegetables", grams: "200", kcal: "143", proteinG: "4", carbsG: "23", fatG: "5", conf: "0.82" },
      ],
    },
    {
      logDate: todayDate(),
      loggedAt: todayAt(16, 0),
      mealType: "snack" as const,
      source: "text" as const,
      aiSummary: "Handful of almonds",
      aiConfidence: "1.00",
      totalKcal: "165",
      totalProteinG: "6",
      totalCarbsG: "6",
      totalFatG: "14",
      entries: [
        { name: "Almonds", grams: "28", kcal: "165", proteinG: "6", carbsG: "6", fatG: "14", conf: "1.0" },
      ],
    },
    {
      logDate: todayDate(),
      loggedAt: todayAt(19, 30),
      mealType: "dinner" as const,
      source: "photo" as const,
      aiSummary: "Grilled salmon with sweet potato and asparagus",
      aiConfidence: "0.94",
      totalKcal: "742",
      totalProteinG: "48",
      totalCarbsG: "62",
      totalFatG: "32",
      entries: [
        { name: "Grilled salmon", grams: "180", kcal: "374", proteinG: "36", carbsG: "0", fatG: "23.4", conf: "0.95" },
        { name: "Sweet potato (baked)", grams: "200", kcal: "180", proteinG: "4", carbsG: "42", fatG: "0.2", conf: "0.93" },
        { name: "Asparagus", grams: "150", kcal: "33", proteinG: "3.6", carbsG: "6.2", fatG: "0.3", conf: "0.90" },
        { name: "Olive oil drizzle", grams: "18", kcal: "155", proteinG: "0", carbsG: "0", fatG: "17.5", conf: "0.85" },
      ],
    },
  ];

  // Past-week meals (lighter — fewer per day for variety)
  const pastMeals = [
    { d: 1, h: 9, m: "breakfast", src: "photo", sum: "Oatmeal with banana and peanut butter", kcal: 410, p: 14, c: 65, f: 10 },
    { d: 1, h: 13, m: "lunch", src: "text", sum: "Chicken Caesar salad", kcal: 520, p: 38, c: 18, f: 32 },
    { d: 1, h: 20, m: "dinner", src: "voice", sum: "Steak with mashed potatoes", kcal: 780, p: 50, c: 60, f: 35 },
    { d: 2, h: 8, m: "breakfast", src: "manual", sum: "Two eggs on sourdough toast", kcal: 380, p: 22, c: 38, f: 14 },
    { d: 2, h: 14, m: "lunch", src: "photo", sum: "Tuna sandwich and apple", kcal: 450, p: 28, c: 55, f: 12 },
    { d: 2, h: 19, m: "dinner", src: "photo", sum: "Pasta with bolognese", kcal: 720, p: 35, c: 95, f: 22 },
    { d: 3, h: 8, m: "breakfast", src: "voice", sum: "Protein shake and a banana", kcal: 290, p: 30, c: 35, f: 4 },
    { d: 3, h: 13, m: "lunch", src: "photo", sum: "Burrito bowl with rice and beans", kcal: 690, p: 28, c: 95, f: 18 },
    { d: 3, h: 20, m: "dinner", src: "text", sum: "Stir-fried tofu with rice", kcal: 580, p: 26, c: 78, f: 16 },
    { d: 4, h: 9, m: "breakfast", src: "manual", sum: "Cereal with milk", kcal: 280, p: 10, c: 50, f: 6 },
    { d: 4, h: 14, m: "lunch", src: "photo", sum: "Sushi platter", kcal: 620, p: 30, c: 90, f: 12 },
    { d: 4, h: 19, m: "dinner", src: "voice", sum: "Grilled chicken curry with rice", kcal: 760, p: 45, c: 80, f: 24 },
    { d: 5, h: 9, m: "breakfast", src: "photo", sum: "Pancakes with berries and syrup", kcal: 540, p: 12, c: 88, f: 14 },
    { d: 5, h: 13, m: "lunch", src: "text", sum: "Quinoa salad with feta", kcal: 460, p: 18, c: 50, f: 18 },
    { d: 5, h: 20, m: "dinner", src: "photo", sum: "Pizza margherita (2 slices)", kcal: 680, p: 28, c: 78, f: 26 },
    { d: 6, h: 9, m: "breakfast", src: "voice", sum: "Avocado toast and coffee", kcal: 380, p: 12, c: 42, f: 18 },
    { d: 6, h: 14, m: "lunch", src: "manual", sum: "Lentil soup with bread", kcal: 480, p: 22, c: 75, f: 8 },
    { d: 6, h: 20, m: "dinner", src: "photo", sum: "Roast chicken with mashed potatoes and broccoli", kcal: 720, p: 52, c: 55, f: 28 },
  ];

  // Insert today's meals with entries
  for (const m of todayMeals) {
    const [meal] = await db
      .insert(schema.meals)
      .values({
        userId: user.id,
        logDate: m.logDate,
        loggedAt: m.loggedAt,
        mealType: m.mealType,
        source: m.source,
        aiSummary: m.aiSummary,
        aiConfidence: m.aiConfidence,
        totalKcal: m.totalKcal,
        totalProteinG: m.totalProteinG,
        totalCarbsG: m.totalCarbsG,
        totalFatG: m.totalFatG,
      })
      .returning();

    await db.insert(schema.mealEntries).values(
      m.entries.map((e, i) => ({
        mealId: meal.id,
        name: e.name,
        grams: e.grams,
        kcal: e.kcal,
        proteinG: e.proteinG,
        carbsG: e.carbsG,
        fatG: e.fatG,
        aiConfidence: e.conf,
        sortOrder: i,
      })),
    );
  }
  console.log(`Inserted ${todayMeals.length} meals for today`);

  // Insert past-week meals (single-item, simpler)
  for (const p of pastMeals) {
    const [meal] = await db
      .insert(schema.meals)
      .values({
        userId: user.id,
        logDate: daysAgoDate(p.d),
        loggedAt: daysAgo(p.d, p.h, 0),
        mealType: p.m as "breakfast" | "lunch" | "dinner" | "snack" | "other",
        source: p.src as "photo" | "voice" | "text" | "manual",
        aiSummary: p.sum,
        aiConfidence: "0.90",
        totalKcal: String(p.kcal),
        totalProteinG: String(p.p),
        totalCarbsG: String(p.c),
        totalFatG: String(p.f),
      })
      .returning();
    await db.insert(schema.mealEntries).values({
      mealId: meal.id,
      name: p.sum,
      grams: "300",
      kcal: String(p.kcal),
      proteinG: String(p.p),
      carbsG: String(p.c),
      fatG: String(p.f),
      aiConfidence: "0.90",
      sortOrder: 0,
    });
  }
  console.log(`Inserted ${pastMeals.length} past-week meals`);

  await sql.end();
  console.log("\n✅ Done. Sign in with the magic link to see populated dashboard, history, streak, weekly chart.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
