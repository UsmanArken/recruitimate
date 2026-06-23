import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "fs/promises";
import path from "path";
import os from "os";
import {
  getMediaStorage,
  putMediaObject,
  getMediaObject,
  resetMediaStorageCache,
} from "../../src/lib/storage/provider";
import { interviewRecordingKey } from "../../src/lib/storage/keys";
import {
  saveInterviewRecording,
  readInterviewRecording,
} from "../../src/lib/storage/interview-recordings";
import { saveResumeFile } from "../../src/lib/storage/resumes";

describe("Media storage pipeline", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "recruitimate-storage-"));
    process.env.STORAGE_PROVIDER = "local";
    process.env.UPLOAD_DIR = tmpDir;
    resetMediaStorageCache();
  });

  afterEach(async () => {
    resetMediaStorageCache();
    delete process.env.STORAGE_PROVIDER;
    delete process.env.UPLOAD_DIR;
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("uses local provider by default", () => {
    assert.equal(getMediaStorage().id, "local");
  });

  it("stores and reads interview recordings by key", async () => {
    const buffer = Buffer.from("fake-audio");
    const key = await saveInterviewRecording("int-1", buffer, "clip.webm");
    assert.equal(key, interviewRecordingKey("int-1", "clip.webm"));

    const read = await readInterviewRecording(key);
    assert.equal(read.toString(), "fake-audio");
  });

  it("stores resume files under org prefix", async () => {
    const key = await saveResumeFile("org-1", Buffer.from("pdf"), "resume.pdf");
    assert.ok(key.startsWith("resumes/org-1/"));

    const read = await getMediaObject(key);
    assert.equal(read.toString(), "pdf");
  });

  it("put/get round-trips arbitrary keys", async () => {
    const key = "interviews/test.wav";
    await putMediaObject(key, Buffer.from("wav-bytes"), "audio/wav");
    const read = await getMediaObject(key);
    assert.equal(read.toString(), "wav-bytes");
  });
});
