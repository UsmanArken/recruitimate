import type { StorageProviderId } from "./types";

export function resolveStorageProviderId(): StorageProviderId {
  const raw = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  if (raw === "s3") return "s3";
  return "local";
}

export function localUploadRoot(): string {
  return process.env.UPLOAD_DIR?.trim() || `${process.cwd()}/uploads`;
}

export function s3Config() {
  return {
    bucket: process.env.S3_BUCKET?.trim() ?? "",
    region: process.env.S3_REGION?.trim() || "us-east-1",
    endpoint: process.env.S3_ENDPOINT?.trim(),
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim() ?? process.env.S3_ACCESS_KEY?.trim(),
    secretAccessKey:
      process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? process.env.S3_SECRET_KEY?.trim(),
    prefix: process.env.S3_PREFIX?.trim().replace(/\/$/, "") ?? "",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  };
}

export function isS3Configured(): boolean {
  const cfg = s3Config();
  return Boolean(cfg.bucket && cfg.accessKeyId && cfg.secretAccessKey);
}
