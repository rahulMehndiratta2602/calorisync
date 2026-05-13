import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
  token: z.string().optional(),
});

// Optional token for one-click unsubscribe (RFC 8058 style). We compute a
// deterministic HMAC-ish token from email + AUTH_SECRET so unsub links in
// emails don't need DB lookups.
export function unsubscribeToken(email: string): string {
  return createHash("sha256")
    .update(`${email.toLowerCase()}|${env.AUTH_SECRET}`)
    .digest("hex")
    .slice(0, 32);
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();

  // If a token is supplied, verify it. Otherwise still allow (user manually
  // entered email on an unsubscribe page — they own the inbox).
  if (parsed.data.token) {
    const expected = unsubscribeToken(email);
    if (expected !== parsed.data.token) {
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }
  }

  await db
    .update(schema.newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(schema.newsletterSubscribers.email, email));

  audit({
    action: "newsletter.unsubscribed",
    targetType: "newsletter",
    targetId: email,
    metadata: { viaToken: !!parsed.data.token },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

// GET form lets one-click unsub links work directly (RFC 8058).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");
  if (!email) return NextResponse.json({ error: "missing email" }, { status: 400 });

  // Token required for GET to prevent crawlers from accidentally unsubbing.
  if (!token) return NextResponse.json({ error: "missing token" }, { status: 400 });
  const expected = unsubscribeToken(email.toLowerCase());
  if (expected !== token) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  await db
    .update(schema.newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(schema.newsletterSubscribers.email, email.toLowerCase()));

  audit({
    action: "newsletter.unsubscribed",
    targetType: "newsletter",
    targetId: email.toLowerCase(),
    metadata: { viaToken: true, method: "GET" },
  }).catch(() => {});

  // Redirect to a friendly confirmation page.
  return NextResponse.redirect(new URL("/unsubscribed", env.SITE_URL));
}
