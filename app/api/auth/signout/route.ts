import { NextRequest, NextResponse } from "next/server";
import { destroySessionCookie, getCurrentSession, revokeSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const current = await getCurrentSession();
  if (current) {
    await revokeSession(current.session.id);
  }
  await destroySessionCookie();
  return NextResponse.redirect(new URL("/", url), 303);
}
