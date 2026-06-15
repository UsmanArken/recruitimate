import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  analyzePcmSignals,
  buildTestWavFromAmplitudes,
  decodeWavPcm,
} from "../../src/lib/intelligence/audio/audio-signal-engine";
import { extractAudioSignals } from "../../src/lib/intelligence/audio/audio-signal-engine";
import { mkdir, writeFile, rm } from "fs/promises";
import path from "path";
import os from "os";

describe("Audio signal engine (PCM)", () => {
  it("decodes mono 16-bit WAV", () => {
    const sampleRate = 8000;
    const amps = Array.from({ length: 800 }, () => 0.4);
    const wav = buildTestWavFromAmplitudes(sampleRate, amps);
    const pcm = decodeWavPcm(wav);
    assert.ok(pcm);
    assert.equal(pcm!.sampleRate, sampleRate);
    assert.equal(pcm!.samples.length, 800);
  });

  it("detects silence pause between speech segments", () => {
    const sampleRate = 1000;
    const amps: number[] = [];
    for (let i = 0; i < 400; i++) amps.push(0.5);
    for (let i = 0; i < 1000; i++) amps.push(0);
    for (let i = 0; i < 400; i++) amps.push(0.45);

    const pcm = decodeWavPcm(buildTestWavFromAmplitudes(sampleRate, amps))!;
    const result = analyzePcmSignals(pcm);

    assert.ok(result.pauseCount >= 1);
    assert.ok(result.longestPauseSec >= 0.7);
    assert.ok(result.durationSec != null && result.durationSec > 1.5);
  });

  it("detects energy tone shifts between loud and quiet speech", () => {
    const sampleRate = 100;
    const amps: number[] = [];
    for (let i = 0; i < 30; i++) amps.push(0.15);
    for (let i = 0; i < 30; i++) amps.push(0.55);
    for (let i = 0; i < 30; i++) amps.push(0.12);
    for (let i = 0; i < 30; i++) amps.push(0.6);

    const pcm = decodeWavPcm(buildTestWavFromAmplitudes(sampleRate, amps))!;
    const result = analyzePcmSignals(pcm);

    assert.ok(result.toneShifts.length >= 1);
    assert.ok(result.energyVariabilityScore > 0);
  });
});

describe("Audio signal engine (file extract)", () => {
  it("extracts from WAV file on disk", async () => {
    const tmp = await mkdir(path.join(os.tmpdir(), `recruitimate-audio-${Date.now()}`), {
      recursive: true,
    }).then(() => path.join(os.tmpdir(), `recruitimate-audio-test`));
    await mkdir(tmp, { recursive: true });

    const uploadRoot = path.join(tmp, "uploads");
    const interviewsDir = path.join(uploadRoot, "interviews");
    await mkdir(interviewsDir, { recursive: true });

    const prevUpload = process.env.UPLOAD_DIR;
    process.env.UPLOAD_DIR = uploadRoot;

    const sampleRate = 1000;
    const amps: number[] = [];
    for (let i = 0; i < 300; i++) amps.push(0.5);
    for (let i = 0; i < 900; i++) amps.push(0);
    for (let i = 0; i < 300; i++) amps.push(0.5);
    const wav = buildTestWavFromAmplitudes(sampleRate, amps);
    const relative = path.join("interviews", "test-interview.wav");
    await writeFile(path.join(uploadRoot, relative), wav);

    try {
      const result = await extractAudioSignals(relative.replace(/\\/g, "/"));
      assert.equal(result.source, "wav_pcm");
      assert.ok(result.pauseCount >= 1);
    } finally {
      if (prevUpload) process.env.UPLOAD_DIR = prevUpload;
      else delete process.env.UPLOAD_DIR;
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it("uses transcript fallback for non-wav paths", async () => {
    const tmp = path.join(os.tmpdir(), "recruitimate-audio-fallback");
    const uploadRoot = path.join(tmp, "uploads");
    await mkdir(path.join(uploadRoot, "interviews"), { recursive: true });
    const prevUpload = process.env.UPLOAD_DIR;
    process.env.UPLOAD_DIR = uploadRoot;

    const relative = "interviews/test.mp3";
    await writeFile(path.join(uploadRoot, relative), Buffer.from("fake"));

    try {
      const result = await extractAudioSignals(
        relative,
        "I led the project. Um, well, you know, we shipped it. Uh, it was fine."
      );
      assert.equal(result.source, "transcript_fallback");
      assert.ok(result.pauseDensityScore > 0);
    } finally {
      if (prevUpload) process.env.UPLOAD_DIR = prevUpload;
      else delete process.env.UPLOAD_DIR;
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
