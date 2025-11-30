import axios from "axios";

/**
 * Request a pre-signed S3 upload URL from backend and upload file directly.
 * Returns the `key` to store in variant images.
 */
export async function presignAndUpload({ file, key, contentType }) {
  if (!file) throw new Error("file is required");
  const finalKey = key || `uploads/${crypto.randomUUID()}-${file.name}`;
  const ct = contentType || file.type || "application/octet-stream";

  const presignRes = await axios.post("/api/admin/storage/presign", {
    key: finalKey,
    contentType: ct,
  });
  const { url, key: returnedKey } = presignRes.data?.data || {};
  if (!url || !returnedKey) throw new Error("Failed to get presigned URL");

  await axios.put(url, file, {
    headers: { "Content-Type": ct },
    maxBodyLength: Infinity,
  });

  return { key: returnedKey };
}

/**
 * Upload multiple files, capped at 3, returns array of { key }.
 */
export async function uploadVariantImages(
  files,
  baseKeyPrefix = "products/variants"
) {
  const list = Array.from(files || []).slice(0, 3);
  const results = [];
  for (const file of list) {
    const key = `${baseKeyPrefix}/${crypto.randomUUID()}-${file.name}`;
    const { key: storedKey } = await presignAndUpload({ file, key });
    results.push({ key: storedKey });
  }
  return results;
}

/**
 * Convert S3 key to public URL.
 * Uses CDN_BASE_URL env (S3 direct now, CloudFront later).
 */
export function getPublicImageUrl(key) {
  if (!key || typeof key !== "string") return "";
  // If already a full URL, return as-is
  if (/^https?:\/\//.test(key)) return key;
  const base = import.meta.env.VITE_CDN_BASE_URL || "";
  return base ? `${base}/${key}` : key;
}

/**
 * Delete an image from S3 by key.
 */
export async function deleteImage(key) {
  if (!key || typeof key !== "string") {
    throw new Error("key is required");
  }
  // Skip deletion if it's a full URL (not our S3 key)
  if (/^https?:\/\//.test(key)) return { success: true, skipped: true };

  await axios.delete("/api/admin/storage/delete", {
    data: { key },
  });
  return { success: true, key };
}

/**
 * Delete multiple images from S3.
 */
export async function deleteImages(keys) {
  const results = [];
  for (const key of keys || []) {
    try {
      const result = await deleteImage(key);
      results.push(result);
    } catch (err) {
      console.error(`Failed to delete ${key}:`, err);
      results.push({ success: false, key, error: err.message });
    }
  }
  return results;
}
