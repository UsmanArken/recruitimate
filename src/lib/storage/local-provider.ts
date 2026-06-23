import { mkdir, readFile, unlink, writeFile, access } from "fs/promises";
import path from "path";
import { localUploadRoot } from "./config";
import type { MediaStorageProvider, PutMediaInput } from "./types";

function absoluteKey(key: string): string {
  return path.join(localUploadRoot(), key);
}

export function createLocalStorageProvider(): MediaStorageProvider {
  return {
    id: "local",
    async put({ key, buffer }: PutMediaInput) {
      const absolute = absoluteKey(key);
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, buffer);
    },
    async get(key: string) {
      return readFile(absoluteKey(key));
    },
    async delete(key: string) {
      try {
        await unlink(absoluteKey(key));
      } catch {
        // ignore missing files
      }
    },
    async exists(key: string) {
      try {
        await access(absoluteKey(key));
        return true;
      } catch {
        return false;
      }
    },
  };
}

/** Backward-compatible absolute path for local storage reads. */
export function localAbsolutePath(key: string): string {
  return absoluteKey(key);
}
