import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentSession, destroySessionCookie } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  confirmation: z.literal("DELETE MY ACCOUNT"),
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
      {
        error:
          "Confirmation required. Send {\"confirmation\":\"DELETE MY ACCOUNT\"} to permanently delete.",
      },
      { status: 400 },
    );
  }

  // Soft delete: mark user as deleted and revoke all sessions.
  // Cascading deletes (meals, profiles, etc.) happen via FK on hard delete,
  // but we keep the row for audit + downstream re-attribution.
  await db.transaction(async (tx) => {
    await tx
      .update(schema.users)
      .set({
        deletedAt: new Date(),
        email: `deleted-${sess.user.id}@deleted.calorisync.com`,
        name: null,
      })
      .where(eq(schema.users.id, sess.user.id));

    await tx
      .update(schema.sessions)
      .set({ revokedAt: new Date() })
      .where(eq(schema.sessions.userId, sess.user.id));
  });

  audit({
    actorUserId: sess.user.id,
    action: "account.deleted",
    targetType: "user",
    targetId: sess.user.id,
    metadata: { originalEmail: sess.user.email },
  }).catch(() => {});

  await destroySessionCookie();

  return NextResponse.json({ ok: true });
}
