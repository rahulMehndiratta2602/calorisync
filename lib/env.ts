// During production build, Next.js spawns worker processes for static page
// data collection that don't inherit .env.local. We defer the hard throw
// to runtime so the build can complete; at request time the variable IS
// present, so calls will succeed.
const isBuildPhase = () =>
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.NEXT_PHASE === "phase-production-optimize";

const required = (k: string): string => {
  const v = process.env[k];
  if (!v) {
    if (isBuildPhase()) return "";
    throw new Error(`Missing required env: ${k}`);
  }
  return v;
};

const optional = (k: string): string | undefined => process.env[k] || undefined;

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  DATABASE_URL_UNPOOLED: optional("DATABASE_URL_UNPOOLED"),
  ANTHROPIC_API_KEY: required("ANTHROPIC_API_KEY"),
  AUTH_SECRET: required("AUTH_SECRET"),
  EMAIL_FROM: process.env.EMAIL_FROM || "hello@calorisync.com",
  EMAIL_PROVIDER: (process.env.EMAIL_PROVIDER || "stub") as "stub" | "resend" | "ses",
  RESEND_API_KEY: optional("RESEND_API_KEY"),
  USDA_API_KEY: optional("USDA_API_KEY"),
  STRIPE_SECRET_KEY: optional("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: optional("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PRICE_MONTHLY_ID: optional("STRIPE_PRICE_MONTHLY_ID"),
  STRIPE_PRICE_ANNUAL_ID: optional("STRIPE_PRICE_ANNUAL_ID"),
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://calorisync.com",
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || "mandyratta@gmail.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
};

export const publicEnv = {
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://calorisync.com",
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "development",
  FEATURE_VOICE: process.env.NEXT_PUBLIC_FEATURE_VOICE === "true",
  FEATURE_STRIPE: process.env.NEXT_PUBLIC_FEATURE_STRIPE === "true",
};
