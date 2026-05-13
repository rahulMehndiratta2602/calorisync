import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { s3 } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteCtx {
  params: Promise<{ mealId: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const sess = await getCurrentSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { mealId } = await ctx.params;

  // Verify the meal belongs to the signed-in user before serving the photo.
  const meal = await db.query.meals.findFirst({
    where: and(eq(schema.meals.id, mealId), eq(schema.meals.userId, sess.user.id)),
    with: { photos: true },
  });
  if (!meal) return NextResponse.json({ error: "not found" }, { status: 404 });

  const photo = meal.photos[0];
  if (!photo) return NextResponse.json({ error: "no photo" }, { status: 404 });

  try {
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: photo.bucket, Key: photo.s3Key }),
    );
    if (!obj.Body) return NextResponse.json({ error: "empty body" }, { status: 502 });

    // Stream the S3 object back to the client.
    return new NextResponse(obj.Body as unknown as ReadableStream, {
      headers: {
        "content-type": photo.mimeType || "image/jpeg",
        "content-length": obj.ContentLength?.toString() ?? "",
        "cache-control": "private, max-age=300",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[photo] s3 fetch failed:", msg);
    return NextResponse.json({ error: "S3 fetch failed" }, { status: 502 });
  }
}
