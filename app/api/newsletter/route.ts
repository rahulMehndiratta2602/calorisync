import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email().max(320),
  source: z.string().max(64).optional(),
  referrer: z.string().max(2000).optional(),
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
});

function getIp(req: NextRequest): string | undefined {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined
  );
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase().trim();
  const ip = getIp(req);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(schema.newsletterSubscribers.email, email),
    });

    let subId: string;
    let isNew = false;

    if (existing) {
      // Reactivate if previously unsubscribed; otherwise no-op.
      if (existing.status === "unsubscribed") {
        await db
          .update(schema.newsletterSubscribers)
          .set({ status: "active", unsubscribedAt: null })
          .where(eq(schema.newsletterSubscribers.id, existing.id));
      }
      subId = existing.id;
    } else {
      try {
        const [sub] = await db
          .insert(schema.newsletterSubscribers)
          .values({
            email,
            source: parsed.data.source,
            referrer: parsed.data.referrer,
            utmSource: parsed.data.utm_source,
            utmMedium: parsed.data.utm_medium,
            utmCampaign: parsed.data.utm_campaign,
            ip,
            userAgent,
          })
          .returning();
        subId = sub.id;
        isNew = true;
      } catch (err: unknown) {
        // Race: another request inserted with the same lower(email) — re-fetch.
        const msg = err instanceof Error ? err.message : String(err);
        if (!/duplicate key|unique constraint|newsletter_email_unique/i.test(msg)) throw err;
        const recovered = await db.query.newsletterSubscribers.findFirst({
          where: eq(schema.newsletterSubscribers.email, email),
        });
        if (!recovered) throw err;
        subId = recovered.id;
      }
    }

    if (isNew) {
      // Fire-and-forget welcome email (stub — logged to email_events).
      sendEmail({
        to: email,
        template: "newsletter_welcome",
        payload: { source: parsed.data.source ?? null },
      }).catch((err) => console.error("[newsletter] welcome email failed:", err));
    }

    return NextResponse.json({ ok: true, id: subId, isNew }, { status: 200 });
  } catch (err) {
    console.error("[newsletter] insert failed:", err);
    return NextResponse.json(
      { error: "Couldn't sign you up — try again in a moment." },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  // Tiny health probe — useful for monitoring.
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) return NextResponse.json({ ok: true });
  const exists = await db.query.newsletterSubscribers.findFirst({
    where: eq(schema.newsletterSubscribers.email, email.toLowerCase().trim()),
  });
  return NextResponse.json({ subscribed: !!exists });
}
