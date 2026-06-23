import { badRequest } from "@/lib/api/errors";
import { resolveStorageProviderId, isS3Configured } from "./config";
import { createLocalStorageProvider } from "./local-provider";
import { createS3StorageProvider } from "./s3-provider";
import type { MediaStorageProvider } from "./types";

let cached: MediaStorageProvider | null = null;

export function getMediaStorage(): MediaStorageProvider {
  if (cached) return cached;

  const providerId = resolveStorageProviderId();
  if (providerId === "s3") {
    if (!isS3Configured()) {
      throw new Error(
        "STORAGE_PROVIDER=s3 but S3_BUCKET / credentials are missing. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
      );
    }
    cached = createS3StorageProvider();
    return cached;
  }

  cached = createLocalStorageProvider();
  return cached;
}

/** Reset cached provider (tests). */
export function resetMediaStorageCache(): void {
  cached = null;
}

export async function putMediaObject(
  key: string,
  buffer: Buffer,
  contentType?: string
): Promise<string> {
  const storage = getMediaStorage();
  await storage.put({ key, buffer, contentType });
  return key;
}

export async function getMediaObject(key: string): Promise<Buffer> {
  const storage = getMediaStorage();
  try {
    return await storage.get(key);
  } catch {
    throw badRequest("Media file not found in storage", "STORAGE_NOT_FOUND");
  }
}

export function describeStorageBackend(): {
  provider: string;
  localRoot?: string;
  s3Bucket?: string;
} {
  const provider = resolveStorageProviderId();
  if (provider === "s3") {
    return { provider: "s3", s3Bucket: process.env.S3_BUCKET };
  }
  return { provider: "local", localRoot: process.env.UPLOAD_DIR ?? "./uploads" };
}
