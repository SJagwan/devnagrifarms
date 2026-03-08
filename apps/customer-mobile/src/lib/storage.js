import api from "./apiClient";

/**
 * Request a pre-signed S3 upload URL from backend and upload file directly.
 * Converts local file URI to Blob before uploading.
 */
export async function presignAndUpload({ fileUri, fileName, mimeType, key }) {
  if (!fileUri) throw new Error("fileUri is required");
  
  const randomStr = Math.random().toString(36).substring(2, 8);
  const finalKey = key || `avatars/${Date.now()}-${randomStr}-${fileName || 'image.jpg'}`;
  const contentType = mimeType || "image/jpeg";

  // 1. Get Pre-signed URL
  const { data } = await api.post("/storage/upload-url", {
    key: finalKey,
    contentType,
  });

  const { url, key: returnedKey } = data.data || {};
  if (!url || !returnedKey) throw new Error("Failed to get presigned URL");

  // 2. Convert local file to Blob
  const fileResponse = await fetch(fileUri);
  const blob = await fileResponse.blob();

  // 3. Upload directly to S3 using fetch
  const uploadResponse = await fetch(url, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
  }

  return { key: returnedKey };
}

/**
 * Convert S3 key to public URL.
 */
export function getPublicImageUrl(key) {
  if (!key || typeof key !== "string") return "";
  // If already a full URL, return as-is
  if (/^https?:\/\//.test(key)) return key;
  
  const base = process.env.EXPO_PUBLIC_CDN_BASE_URL || "";
  return base ? `${base}/${key}` : key;
}
