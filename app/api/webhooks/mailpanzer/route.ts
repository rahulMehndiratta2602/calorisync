import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Mailpanzer (or any compatible sender) can POST here to update an email
// event's delivery status. Expected payload:
//   { eventId, messageId, status, error?, timestamp }
//
// Auth: HMAC-SHA256 of the raw body keyed with MAILPANZER_WEBHOOK_SECRET, sent
// as the `X-Mailpanzer-Signature` header (hex-encoded).

const STATUS_MAP: Record<
  string,
  "queued" | "sent" | "delivered" | "bounced" | "failed" | "complained"
> = {
  queued: "queued",
  sent: "sent",
  delivered: "delivered",
  bounced: "bounced",
  failed: "failed",
  complained: "complained",
};

const bodySchema = z.object({
  eventId: z.string().min(1).max(50),
  messageId: z.string().max(200).optional(),
  status: z.enum(["queued", "sent", "delivered", "bounced", "failed", "complained"]),
  error: z.string().max(2000).optional(),
  timestamp: z.string().optional(),
});

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!env.MAILPANZER_WEBHOOK_SECRET) {
    // Dev mode: skip verification but log loudly.
    console.warn("[mailpanzer webhook] no MAILPANZER_WEBHOOK_SECRET — accepting unsigned");
    return true;
  }
  if (!signature) return false;
  const expected = createHmac("sha256", env.MAILPANZER_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-mailpanzer-signature");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid webhook body", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const dbStatus = STATUS_MAP[parsed.data.status] ?? "queued";

  await db
    .update(schema.emailEvents)
    .set({
      status: dbStatus,
      providerMessageId: parsed.data.messageId,
      error: parsed.data.error,
      sentAt:
        dbStatus === "sent" || dbStatus === "delivered" ? new Date() : undefined,
    })
    .where(eq(schema.emailEvents.id, parsed.data.eventId));

  return NextResponse.json({ ok: true });
}
