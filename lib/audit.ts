import { headers } from "next/headers";
import { db, schema } from "./db";

export interface AuditArgs {
  actorUserId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function audit(args: AuditArgs): Promise<void> {
  try {
    const h = await headers();
    const ip =
      h.get("cf-connecting-ip") ||
      h.get("x-forwarded-for")?.split(",")[0].trim() ||
      h.get("x-real-ip") ||
      null;
    const userAgent = h.get("user-agent") || null;

    await db.insert(schema.auditLog).values({
      actorUserId: args.actorUserId ?? null,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      metadata: args.metadata ?? {},
      ip,
      userAgent,
    });
  } catch (err) {
    // Never throw from audit — it's observability, not correctness.
    console.error("[audit] insert failed:", err);
  }
}
