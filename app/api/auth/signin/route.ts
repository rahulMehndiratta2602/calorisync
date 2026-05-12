import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createMagicLink } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { audit } from "@/lib/audit";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
  redirectTo: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();

  const { token } = await createMagicLink(email, "signin", parsed.data.redirectTo);
  const link = `${publicEnv.SITE_URL}/auth/verify?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    template: "magic_link",
    payload: {
      link,
      expiresMinutes: 30,
      ip: req.headers.get("cf-connecting-ip") ?? null,
    },
  });

  // Beta: always log so we can test sign-in without a real email provider.
  // Once Mailpanzer is wired up, remove or gate behind BETA_LOG_MAGIC_LINKS.
  console.log(`[auth] magic-link for ${email}: ${link}`);

  return NextResponse.json({ ok: true });
}
