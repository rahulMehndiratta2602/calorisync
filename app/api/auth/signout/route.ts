import { NextRequest, NextResponse } from "next/server";
import { destroySessionCookie, getCurrentSession, revokeSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicBase(req: NextRequest): string {
  const fwdHost = req.headers.get("x-forwarded-host");
  const fwdProto = req.headers.get("x-forwarded-proto");
  if (fwdHost) return `${fwdProto || "https"}://${fwdHost}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://calorisync.com";
}

export async function POST(req: NextRequest) {
  const base = publicBase(req);
  const current = await getCurrentSession();
  if (current) {
    await revokeSession(current.session.id);
  }
  await destroySessionCookie();
  return NextResponse.redirect(new URL("/", base), 303);
}
