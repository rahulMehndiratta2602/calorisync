import {
  pgTable,
  text,
  varchar,
  integer,
  bigint,
  boolean,
  timestamp,
  date,
  numeric,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// ───── ID generator ─────
const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => nanoid(21));

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ───── Enums ─────
export const sexEnum = pgEnum("sex", ["male", "female", "other"]);
export const goalEnum = pgEnum("goal", ["lose", "maintain", "gain", "recomp"]);
export const activityEnum = pgEnum("activity_level", [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
]);
export const dietStyleEnum = pgEnum("diet_style", [
  "balanced",
  "keto",
  "high_protein",
  "mediterranean",
  "vegan",
  "vegetarian",
  "custom",
]);
export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "other",
]);
export const logSourceEnum = pgEnum("log_source", [
  "photo",
  "voice",
  "text",
  "manual",
  "barcode",
  "import",
]);
export const subStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "free",
  "lifetime",
]);
export const emailStatusEnum = pgEnum("email_status", [
  "pending",
  "queued",
  "stub_logged",
  "sent",
  "delivered",
  "bounced",
  "failed",
  "complained",
]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "superadmin"]);
export const newsletterStatusEnum = pgEnum("newsletter_status", [
  "active",
  "unsubscribed",
  "bounced",
]);

// ───── users ─────
export const users = pgTable(
  "users",
  {
    id: id(),
    email: varchar("email", { length: 320 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    name: varchar("name", { length: 200 }),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").notNull().default("user"),
    locale: varchar("locale", { length: 12 }).notNull().default("en-US"),
    marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    emailUq: uniqueIndex("users_email_unique").on(sql`lower(${t.email})`),
  }),
);

// ───── user_profiles ─────
// Recomputed macros stored here; CLAUDE.md locks the formula.
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  // Captured client-side at signup per CLAUDE.md tz handling.
  timezone: varchar("timezone", { length: 64 }).notNull().default("UTC"),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }),
  dob: date("dob"),
  sex: sexEnum("sex"),
  activityLevel: activityEnum("activity_level").default("moderate"),
  goal: goalEnum("goal").default("maintain"),
  goalWeightKg: numeric("goal_weight_kg", { precision: 5, scale: 2 }),
  weeklyChangeKg: numeric("weekly_change_kg", { precision: 4, scale: 2 }),
  bodyFatPct: numeric("body_fat_pct", { precision: 4, scale: 1 }),
  dietStyle: dietStyleEnum("diet_style").default("balanced"),
  // Cached macro targets, recomputed when weight/goal changes:
  targetKcal: integer("target_kcal"),
  targetProteinG: integer("target_protein_g"),
  targetCarbsG: integer("target_carbs_g"),
  targetFatG: integer("target_fat_g"),
  targetsUpdatedAt: timestamp("targets_updated_at", { withTimezone: true }),
  wakeTime: varchar("wake_time", { length: 8 }).notNull().default("07:00"), // HH:MM
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ───── sessions ─────
export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    userAgent: text("user_agent"),
    ip: varchar("ip", { length: 45 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("sessions_token_hash_unique").on(t.tokenHash),
    userIdx: index("sessions_user_idx").on(t.userId),
  }),
);

// ───── magic_links ─────
export const magicLinks = pgTable(
  "magic_links",
  {
    id: id(),
    email: varchar("email", { length: 320 }).notNull(),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    purpose: varchar("purpose", { length: 24 }).notNull().default("signin"),
    redirectTo: text("redirect_to"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    ip: varchar("ip", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("magic_links_token_hash_unique").on(t.tokenHash),
    emailIdx: index("magic_links_email_idx").on(t.email),
  }),
);

// ───── foods (cached + AI-synthesized) ─────
export const foods = pgTable(
  "foods",
  {
    id: id(),
    name: varchar("name", { length: 300 }).notNull(),
    brand: varchar("brand", { length: 200 }),
    description: text("description"),
    servingSizeG: numeric("serving_size_g", { precision: 8, scale: 2 }),
    servingUnit: varchar("serving_unit", { length: 40 }),
    kcalPer100g: numeric("kcal_per_100g", { precision: 7, scale: 2 }).notNull(),
    proteinPer100g: numeric("protein_per_100g", { precision: 6, scale: 2 }).notNull(),
    carbsPer100g: numeric("carbs_per_100g", { precision: 6, scale: 2 }).notNull(),
    fatPer100g: numeric("fat_per_100g", { precision: 6, scale: 2 }).notNull(),
    fiberPer100g: numeric("fiber_per_100g", { precision: 6, scale: 2 }),
    sugarPer100g: numeric("sugar_per_100g", { precision: 6, scale: 2 }),
    sodiumMgPer100g: numeric("sodium_mg_per_100g", { precision: 8, scale: 2 }),
    source: varchar("source", { length: 24 }).notNull().default("ai"), // ai | usda | manual | branded
    usdaFdcId: bigint("usda_fdc_id", { mode: "number" }),
    barcode: varchar("barcode", { length: 32 }),
    verified: boolean("verified").notNull().default(false),
    createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    nameIdx: index("foods_name_idx").on(t.name),
    barcodeIdx: index("foods_barcode_idx").on(t.barcode),
    usdaIdx: index("foods_usda_idx").on(t.usdaFdcId),
  }),
);

// ───── meals ─────
// One meal can have many entries; one photo per meal optional.
export const meals = pgTable(
  "meals",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // logDate is computed in user TZ per CLAUDE.md.
    logDate: date("log_date").notNull(),
    loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
    mealType: mealTypeEnum("meal_type").notNull().default("other"),
    source: logSourceEnum("source").notNull(),
    note: text("note"),
    aiConfidence: numeric("ai_confidence", { precision: 3, scale: 2 }),
    aiSummary: text("ai_summary"),
    aiRaw: jsonb("ai_raw"),
    // Roll-up totals for fast list views:
    totalKcal: numeric("total_kcal", { precision: 8, scale: 2 }).notNull().default("0"),
    totalProteinG: numeric("total_protein_g", { precision: 7, scale: 2 }).notNull().default("0"),
    totalCarbsG: numeric("total_carbs_g", { precision: 7, scale: 2 }).notNull().default("0"),
    totalFatG: numeric("total_fat_g", { precision: 7, scale: 2 }).notNull().default("0"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    userDateIdx: index("meals_user_date_idx").on(t.userId, t.logDate),
    userLoggedIdx: index("meals_user_logged_idx").on(t.userId, t.loggedAt),
  }),
);

// ───── meal_entries ─────
export const mealEntries = pgTable(
  "meal_entries",
  {
    id: id(),
    mealId: text("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    foodId: text("food_id").references(() => foods.id, { onDelete: "set null" }),
    name: varchar("name", { length: 300 }).notNull(),
    grams: numeric("grams", { precision: 8, scale: 2 }).notNull(),
    servings: numeric("servings", { precision: 6, scale: 2 }),
    kcal: numeric("kcal", { precision: 8, scale: 2 }).notNull(),
    proteinG: numeric("protein_g", { precision: 7, scale: 2 }).notNull(),
    carbsG: numeric("carbs_g", { precision: 7, scale: 2 }).notNull(),
    fatG: numeric("fat_g", { precision: 7, scale: 2 }).notNull(),
    fiberG: numeric("fiber_g", { precision: 7, scale: 2 }),
    aiConfidence: numeric("ai_confidence", { precision: 3, scale: 2 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => ({
    mealIdx: index("meal_entries_meal_idx").on(t.mealId),
  }),
);

// ───── meal_photos ─────
export const mealPhotos = pgTable(
  "meal_photos",
  {
    id: id(),
    mealId: text("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    s3Key: text("s3_key").notNull(),
    bucket: varchar("bucket", { length: 200 }).notNull(),
    width: integer("width"),
    height: integer("height"),
    bytes: integer("bytes"),
    mimeType: varchar("mime_type", { length: 64 }),
    aiParsedAt: timestamp("ai_parsed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => ({
    mealIdx: index("meal_photos_meal_idx").on(t.mealId),
  }),
);

// ───── daily_summary (materialized roll-up) ─────
export const dailySummary = pgTable(
  "daily_summary",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    kcal: numeric("kcal", { precision: 8, scale: 2 }).notNull().default("0"),
    proteinG: numeric("protein_g", { precision: 7, scale: 2 }).notNull().default("0"),
    carbsG: numeric("carbs_g", { precision: 7, scale: 2 }).notNull().default("0"),
    fatG: numeric("fat_g", { precision: 7, scale: 2 }).notNull().default("0"),
    targetKcal: integer("target_kcal"),
    mealCount: integer("meal_count").notNull().default(0),
    updatedAt: updatedAt(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.logDate] }),
  }),
);

// ───── subscriptions (Stripe — scaffolded, not wired tonight) ─────
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stripeCustomerId: varchar("stripe_customer_id", { length: 64 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 64 }),
    stripePriceId: varchar("stripe_price_id", { length: 64 }),
    status: subStatusEnum("status").notNull().default("free"),
    plan: varchar("plan", { length: 32 }).notNull().default("free"), // free | monthly | annual | lifetime
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    userIdx: index("subscriptions_user_idx").on(t.userId),
    stripeSubIdx: uniqueIndex("subscriptions_stripe_sub_idx").on(t.stripeSubscriptionId),
  }),
);

// ───── email_events (transactional email log; Mailpanzer reads from here) ─────
export const emailEvents = pgTable(
  "email_events",
  {
    id: id(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    recipient: varchar("recipient", { length: 320 }).notNull(),
    template: varchar("template", { length: 64 }).notNull(),
    payload: jsonb("payload").notNull().default({}),
    status: emailStatusEnum("status").notNull().default("pending"),
    provider: varchar("provider", { length: 32 }).notNull().default("stub"),
    providerMessageId: varchar("provider_message_id", { length: 200 }),
    error: text("error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => ({
    recipientIdx: index("email_events_recipient_idx").on(t.recipient),
    statusIdx: index("email_events_status_idx").on(t.status, t.createdAt),
  }),
);

// ───── newsletter_subscribers (separate from users; allows pre-signup leads) ─────
export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: id(),
    email: varchar("email", { length: 320 }).notNull(),
    source: varchar("source", { length: 64 }), // landing-hero | landing-footer | post-signup
    referrer: text("referrer"),
    utmSource: varchar("utm_source", { length: 100 }),
    utmMedium: varchar("utm_medium", { length: 100 }),
    utmCampaign: varchar("utm_campaign", { length: 100 }),
    status: newsletterStatusEnum("status").notNull().default("active"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    ip: varchar("ip", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => ({
    emailUq: uniqueIndex("newsletter_email_unique").on(sql`lower(${t.email})`),
  }),
);

// ───── audit_log (admin + compliance) ─────
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    targetType: varchar("target_type", { length: 64 }),
    targetId: text("target_id"),
    action: varchar("action", { length: 100 }).notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    ip: varchar("ip", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => ({
    actorIdx: index("audit_log_actor_idx").on(t.actorUserId, t.createdAt),
    actionIdx: index("audit_log_action_idx").on(t.action, t.createdAt),
  }),
);

// ───── feature_flags ─────
export const featureFlags = pgTable("feature_flags", {
  key: varchar("key", { length: 100 }).primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description"),
  rolloutPct: integer("rollout_pct").notNull().default(0),
  updatedAt: updatedAt(),
});

// ───── waitlist (early-access slots) ─────
export const waitlist = pgTable(
  "waitlist",
  {
    id: id(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 200 }),
    source: varchar("source", { length: 64 }),
    referralCode: varchar("referral_code", { length: 24 }),
    invitedAt: timestamp("invited_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => ({
    emailUq: uniqueIndex("waitlist_email_unique").on(sql`lower(${t.email})`),
  }),
);

// ───── Relations ─────
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  sessions: many(sessions),
  meals: many(meals),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
}));

export const mealsRelations = relations(meals, ({ one, many }) => ({
  user: one(users, { fields: [meals.userId], references: [users.id] }),
  entries: many(mealEntries),
  photos: many(mealPhotos),
}));

export const mealEntriesRelations = relations(mealEntries, ({ one }) => ({
  meal: one(meals, { fields: [mealEntries.mealId], references: [meals.id] }),
  food: one(foods, { fields: [mealEntries.foodId], references: [foods.id] }),
}));

export const mealPhotosRelations = relations(mealPhotos, ({ one }) => ({
  meal: one(meals, { fields: [mealPhotos.mealId], references: [meals.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));
