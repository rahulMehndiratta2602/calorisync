import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink, upsertUserByEmail, createSession, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/signin?error=missing_token", url));
  }

  const result = await consumeMagicLink(token);
  if (!result.ok) {
    return NextResponse.redirect(new URL(`/signin?error=${result.reason}`, url));
  }

  const user = await upsertUserByEmail(result.email!);
  const { token: sessionToken, expiresAt } = await createSession(user.id);
  await setSessionCookie(sessionToken, expiresAt);

  const redirectTo = result.redirectTo || "/console";
  return NextResponse.redirect(new URL(redirectTo, url));
}
