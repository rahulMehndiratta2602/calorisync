import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink, upsertUserByEmail, createSession, setSessionCookie } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Build the public-facing base URL from the request, preferring SITE_URL.
// req.url is the internal origin (localhost:3000 behind the Caddy proxy),
// which would break the redirect for real users.
function publicBase(req: NextRequest): string {
  const fwdHost = req.headers.get("x-forwarded-host");
  const fwdProto = req.headers.get("x-forwarded-proto");
  if (fwdHost) return `${fwdProto || "https"}://${fwdHost}`;
  return publicEnv.SITE_URL;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const base = publicBase(req);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/signin?error=missing_token", base));
  }

  const result = await consumeMagicLink(token);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/signin?error=${result.reason}`, base));
  }

  const user = await upsertUserByEmail(result.email!);
  const { token: sessionToken, expiresAt } = await createSession(user.id);
  await setSessionCookie(sessionToken, expiresAt);

  audit({
    actorUserId: user.id,
    action: "auth.signed_in",
    targetType: "user",
    targetId: user.id,
    metadata: { email: user.email },
  }).catch(() => {});

  const redirectTo = result.redirectTo || "/console";
  return NextResponse.redirect(new URL(redirectTo, base));
}
