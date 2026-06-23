import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { isS3Configured, s3Config } from "./config";
import type { MediaStorageProvider, PutMediaInput } from "./types";

function objectKey(key: string): string {
  const { prefix } = s3Config();
  return prefix ? `${prefix}/${key}` : key;
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (!body) return Buffer.alloc(0);
  if (Buffer.isBuffer(body)) return body;
  if (body instanceof Uint8Array) return Buffer.from(body);
  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export function createS3StorageProvider(): MediaStorageProvider {
  const cfg = s3Config();
  if (!isS3Configured()) {
    throw new Error("S3 storage is not configured (S3_BUCKET and credentials required)");
  }

  const client = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint || undefined,
    forcePathStyle: cfg.forcePathStyle,
    credentials: {
      accessKeyId: cfg.accessKeyId!,
      secretAccessKey: cfg.secretAccessKey!,
    },
  });

  return {
    id: "s3",
    async put({ key, buffer, contentType }: PutMediaInput) {
      await client.send(
        new PutObjectCommand({
          Bucket: cfg.bucket,
          Key: objectKey(key),
          Body: buffer,
          ContentType: contentType,
        })
      );
    },
    async get(key: string) {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: cfg.bucket,
          Key: objectKey(key),
        })
      );
      return streamToBuffer(response.Body);
    },
    async delete(key: string) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: cfg.bucket,
          Key: objectKey(key),
        })
      );
    },
    async exists(key: string) {
      try {
        await client.send(
          new HeadObjectCommand({
            Bucket: cfg.bucket,
            Key: objectKey(key),
          })
        );
        return true;
      } catch {
        return false;
      }
    },
  };
}
