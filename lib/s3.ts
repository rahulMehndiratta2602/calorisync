import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const REGION = "ap-south-1";
export const MEAL_PHOTOS_BUCKET = "calorisync-meal-photos-ap-south-1";

const globalForS3 = globalThis as unknown as { s3?: S3Client };

// On EC2 the IAM instance-profile role provides creds via IMDSv2.
// Locally the default credentials chain (env / shared config) supplies them.
export const s3 =
  globalForS3.s3 ?? new S3Client({ region: REGION, maxAttempts: 3 });

if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;

export interface UploadedPhoto {
  bucket: string;
  key: string;
  bytes: number;
  mimeType: string;
}

/**
 * Upload a meal photo (base64-encoded JPEG/PNG/WebP) to the
 * `calorisync-meal-photos-ap-south-1` bucket. Returns the S3 key.
 *
 * Errors are intentionally surfaced — callers should handle them so the
 * meal flow keeps working even if photo persistence fails.
 */
export async function uploadMealPhoto(args: {
  userId: string;
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}): Promise<UploadedPhoto> {
  const ext =
    args.mimeType === "image/jpeg"
      ? "jpg"
      : args.mimeType === "image/png"
        ? "png"
        : args.mimeType === "image/webp"
          ? "webp"
          : "gif";
  const key = `meals/${args.userId}/${new Date().toISOString().slice(0, 10)}/${nanoid(16)}.${ext}`;
  const body = Buffer.from(args.base64, "base64");

  await s3.send(
    new PutObjectCommand({
      Bucket: MEAL_PHOTOS_BUCKET,
      Key: key,
      Body: body,
      ContentType: args.mimeType,
      ServerSideEncryption: "AES256",
      Tagging: "Project=calorisync&Service=meal-photos",
    }),
  );

  return {
    bucket: MEAL_PHOTOS_BUCKET,
    key,
    bytes: body.byteLength,
    mimeType: args.mimeType,
  };
}
