import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db, schema } from "./db";
import { env } from "./env";

const SESSION_COOKIE = "calorisync_session";
const SESSION_TTL_DAYS = 90;
const MAGIC_LINK_TTL_MINUTES = 30;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

async function getRequestMeta(): Promise<{ ip?: string; userAgent?: string }> {
  try {
    const h = await headers();
    const ip =
      h.get("cf-connecting-ip") ||
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      undefined;
    const userAgent = h.get("user-agent") || undefined;
    return { ip: ip ?? undefined, userAgent };
  } catch {
    return {};
  }
}

// ─── Magic links ───

export async function createMagicLink(
  email: string,
  purpose: "signin" | "signup" | "verify" = "signin",
  redirectTo?: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000);
  const meta = await getRequestMeta();

  await db.insert(schema.magicLinks).values({
    email: email.toLowerCase().trim(),
    tokenHash,
    purpose,
    redirectTo,
    expiresAt,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { token, expiresAt };
}

export async function consumeMagicLink(token: string): Promise<{
  ok: boolean;
  email?: string;
  redirectTo?: string | null;
  reason?: string;
}> {
  if (!token || token.length < 16) return { ok: false, reason: "invalid_token" };
  const tokenHash = sha256(token);

  const link = await db.query.magicLinks.findFirst({
    where: eq(schema.magicLinks.tokenHash, tokenHash),
  });

  if (!link) return { ok: false, reason: "not_found" };
  if (link.consumedAt) return { ok: false, reason: "already_used" };
  if (link.expiresAt < new Date()) return { ok: false, reason: "expired" };

  await db
    .update(schema.magicLinks)
    .set({ consumedAt: new Date() })
    .where(eq(schema.magicLinks.id, link.id));

  return { ok: true, email: link.email, redirectTo: link.redirectTo };
}

// ─── Sessions ───

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken(48);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000);
  const meta = await getRequestMeta();

  await db.insert(schema.sessions).values({
    userId,
    tokenHash,
    ip: meta.ip,
    userAgent: meta.userAgent,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<{
  user: typeof schema.users.$inferSelect;
  session: typeof schema.sessions.$inferSelect;
} | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256(token);

  const session = await db.query.sessions.findFirst({
    where: and(
      eq(schema.sessions.tokenHash, tokenHash),
      gt(schema.sessions.expiresAt, new Date()),
      isNull(schema.sessions.revokedAt),
    ),
  });
  if (!session) return null;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session.userId),
  });
  if (!user || user.deletedAt) return null;

  // Touch last-used; don't block on it.
  db.update(schema.sessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.sessions.id, session.id))
    .catch(() => {});

  return { user, session };
}

export async function revokeSession(sessionId: string) {
  await db
    .update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.sessions.id, sessionId));
}

export async function upsertUserByEmail(email: string): Promise<typeof schema.users.$inferSelect> {
  const normalized = email.toLowerCase().trim();
  const existing = await db.query.users.findFirst({
    where: eq(schema.users.email, normalized),
  });
  if (existing) {
    if (!existing.emailVerifiedAt) {
      await db
        .update(schema.users)
        .set({ emailVerifiedAt: new Date() })
        .where(eq(schema.users.id, existing.id));
    }
    return existing;
  }

  const [created] = await db
    .insert(schema.users)
    .values({
      email: normalized,
      emailVerifiedAt: new Date(),
    })
    .returning();

  // Empty profile row so we can hang TZ + macros off it.
  await db.insert(schema.userProfiles).values({ userId: created.id });
  return created;
}

// Use in shared helpers; avoids importing crypto/cookies in browser bundles.
export { sha256, safeEqual, generateToken, SESSION_COOKIE };
// Silence unused-suppress for env (it ensures import side-effects load early).
void env;
