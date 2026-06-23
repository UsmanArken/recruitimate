export type StorageProviderId = "local" | "s3";

export type PutMediaInput = {
  key: string;
  buffer: Buffer;
  contentType?: string;
};

export type MediaStorageProvider = {
  id: StorageProviderId;
  put(input: PutMediaInput): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
};
