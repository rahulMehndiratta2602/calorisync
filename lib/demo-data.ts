import type { DayBucket } from "@/components/console/weekly-chart";

// Realistic fake data for the demo dashboard. Anchored to "today" so the
// dashboard looks fresh whenever someone visits /demo.

function isoDay(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400_000);
  return new Intl.DateTimeFormat("en-CA").format(d);
}

export const DEMO_USER = {
  name: "Demo user",
  email: "demo@calorisync.com",
  timezone: "Asia/Kolkata",
};

export const DEMO_TARGETS = {
  kcal: 2200,
  proteinG: 130,
  carbsG: 220,
  fatG: 75,
  bmr: 1652,
  tdee: 2560,
};

export const DEMO_TOTALS = {
  kcal: 1847,
  protein: 122,
  carbs: 168,
  fat: 62,
};

function todayAt(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

export const DEMO_MEALS = [
  {
    id: "demo-1",
    mealType: "breakfast" as const,
    source: "photo" as const,
    aiSummary: "Greek yogurt bowl with berries and granola",
    loggedAt: todayAt(8, 42),
    totalKcal: 320,
  },
  {
    id: "demo-2",
    mealType: "lunch" as const,
    source: "voice" as const,
    aiSummary: "Chicken with quinoa and roasted vegetables",
    loggedAt: todayAt(13, 15),
    totalKcal: 620,
  },
  {
    id: "demo-3",
    mealType: "snack" as const,
    source: "text" as const,
    aiSummary: "Handful of almonds",
    loggedAt: todayAt(16, 0),
    totalKcal: 165,
  },
  {
    id: "demo-4",
    mealType: "dinner" as const,
    source: "photo" as const,
    aiSummary: "Salmon with sweet potato and asparagus",
    loggedAt: todayAt(19, 30),
    totalKcal: 742,
  },
];

export const DEMO_WEEK: DayBucket[] = [
  { date: isoDay(-6), kcal: 2280, mealCount: 4 },
  { date: isoDay(-5), kcal: 2100, mealCount: 4 },
  { date: isoDay(-4), kcal: 1950, mealCount: 3 },
  { date: isoDay(-3), kcal: 2340, mealCount: 5 },
  { date: isoDay(-2), kcal: 1880, mealCount: 4 },
  { date: isoDay(-1), kcal: 2050, mealCount: 4 },
  { date: isoDay(0), kcal: DEMO_TOTALS.kcal, mealCount: DEMO_MEALS.length },
];

export const DEMO_STREAK = {
  current: 7,
  longest: 12,
  daysLogged7: 7,
};
