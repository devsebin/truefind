import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3-client";

// Upload buffer to S3
export async function uploadBufferToS3(
  buffer: Buffer,
  key: string,
  contentType: string,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "private",
      CacheControl: "public, max-age=31536000, immutable", // 1 year
    }),
  );
  return key;
}

// Generate signed URL for S3 object
export async function generateS3SignedUrl(key: string, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn });
}

// Delete multiple objects
export async function deleteS3Objects(keys: string[]) {
  const deletePromises = keys.map((key) =>
    s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      }),
    ),
  );

  try {
    await Promise.all(deletePromises);
  } catch (err) {
    console.error("Error deleting objects from S3:", err);
  }
}
