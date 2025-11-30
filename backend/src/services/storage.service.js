const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Create once; credentials can be env or IAM role in production
const s3 = new S3Client({
  region: REGION,
  credentials:
    ACCESS_KEY_ID && SECRET_ACCESS_KEY
      ? { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY }
      : undefined,
});

/**
 * Returns a pre-signed URL for direct browser upload (PUT) to S3.
 * - key: storage object key (e.g., "products/variants/<variantId>/<uuid>.jpg")
 * - contentType: MIME type (e.g., "image/jpeg")
 * - expiresIn: seconds the URL is valid (default: 300)
 */
async function getPresignedPutUrl({ key, contentType, expiresIn = 300 }) {
  if (!BUCKET) {
    const err = new Error("AWS_S3_BUCKET is not configured");
    err.statusCode = 500;
    throw err;
  }
  if (!key || typeof key !== "string" || key.trim().length === 0) {
    const err = new Error("key is required");
    err.statusCode = 400;
    throw err;
  }
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType || "application/octet-stream",
    ACL: "public-read", // optional: or remove if using private + CDN
  });
  const url = await getSignedUrl(s3, command, { expiresIn });
  return { url, bucket: BUCKET, key };
}

/**
 * Delete an object from S3 by key.
 */
async function deleteObject(key) {
  if (!BUCKET) {
    const err = new Error("AWS_S3_BUCKET is not configured");
    err.statusCode = 500;
    throw err;
  }
  if (!key || typeof key !== "string" || key.trim().length === 0) {
    const err = new Error("key is required");
    err.statusCode = 400;
    throw err;
  }
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3.send(command);
  return { success: true, key };
}

module.exports = {
  getPresignedPutUrl,
  deleteObject,
};
