"use client";

import type { VideoBehavioralSample, VideoBehavioralSource } from "@/lib/intelligence/types";
import { getFaceDetector } from "@/lib/intelligence/video/face-detector";

let previousMotion = 0;

function computeMotion(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const data = ctx.getImageData(0, 0, w, h).data;
  let sum = 0;
  const step = 16;
  for (let i = 0; i < data.length; i += 4 * step) {
    sum += data[i] + data[i + 1] + data[i + 2];
  }
  const avg = sum / (data.length / (4 * step));
  const motion = previousMotion ? Math.abs(avg - previousMotion) / 255 : 0;
  previousMotion = avg;
  return Math.min(1, motion * 4);
}

async function analyzeFrame(
  source: CanvasImageSource,
  width: number,
  height: number,
  detector: ReturnType<typeof getFaceDetector>
): Promise<VideoBehavioralSample & { motion: number }> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { atSec: 0, faceDetected: false, engagement: 0.3, attention: 0.3, motion: 0 };
  }

  ctx.drawImage(source, 0, 0, width, height);
  const motion = computeMotion(ctx, width, height);

  let faceDetected = false;
  let attention = 0.35;

  if (detector) {
    try {
      const faces = await detector.detect(canvas);
      if (faces.length > 0) {
        faceDetected = true;
        const box = faces[0].boundingBox;
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const dx = Math.abs(cx - width / 2) / (width / 2);
        const dy = Math.abs(cy - height / 2) / (height / 2);
        attention = Math.max(0, 1 - (dx + dy) / 2);
      }
    } catch {
      faceDetected = false;
    }
  }

  const engagement = faceDetected
    ? Math.min(1, 0.45 + attention * 0.35 + motion * 0.2)
    : Math.min(0.5, motion * 0.6);

  return { atSec: 0, faceDetected, engagement, attention, motion };
}

export async function captureWebcamSamples(options: {
  durationSec?: number;
  intervalMs?: number;
  onSample?: (count: number) => void;
}): Promise<{ samples: VideoBehavioralSample[]; source: VideoBehavioralSource }> {
  const durationSec = options.durationSec ?? 20;
  const intervalMs = options.intervalMs ?? 1000;
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  const detector = getFaceDetector();
  const source: VideoBehavioralSource = detector ? "webcam_live" : "motion_fallback";

  previousMotion = 0;

  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();

    const samples: VideoBehavioralSample[] = [];
    const start = performance.now();
    let elapsed = 0;

    while (elapsed < durationSec * 1000) {
      await new Promise((r) => setTimeout(r, intervalMs));
      elapsed = performance.now() - start;
      const frame = await analyzeFrame(video, video.videoWidth || 640, video.videoHeight || 480, detector);
      samples.push({
        atSec: Math.round((elapsed / 1000) * 10) / 10,
        faceDetected: frame.faceDetected,
        engagement: frame.engagement,
        attention: frame.attention,
      });
      options.onSample?.(samples.length);
    }

    return { samples, source };
  } finally {
    for (const track of stream.getTracks()) track.stop();
  }
}

export async function captureVideoFileSamples(
  file: File,
  options?: { maxSamples?: number; intervalMs?: number }
): Promise<{ samples: VideoBehavioralSample[]; source: VideoBehavioralSource }> {
  const url = URL.createObjectURL(file);
  const detector = getFaceDetector();
  const source: VideoBehavioralSource = detector ? "recording_playback" : "motion_fallback";
  const maxSamples = options?.maxSamples ?? 20;
  const intervalMs = options?.intervalMs ?? 1000;

  previousMotion = 0;

  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Could not load video"));
    });
    await video.play();

    const samples: VideoBehavioralSample[] = [];
    const duration = Math.min(video.duration || maxSamples, maxSamples * (intervalMs / 1000));

    while (video.currentTime < duration && samples.length < maxSamples) {
      const frame = await analyzeFrame(
        video,
        video.videoWidth || 640,
        video.videoHeight || 480,
        detector
      );
      samples.push({
        atSec: Math.round(video.currentTime * 10) / 10,
        faceDetected: frame.faceDetected,
        engagement: frame.engagement,
        attention: frame.attention,
      });
      video.currentTime = Math.min(video.duration, video.currentTime + intervalMs / 1000);
      await new Promise((r) => setTimeout(r, 50));
    }

    return { samples, source };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function captureRecordingUrlSamples(
  url: string,
  options?: { maxSamples?: number; intervalMs?: number }
): Promise<{ samples: VideoBehavioralSample[]; source: VideoBehavioralSource }> {
  const detector = getFaceDetector();
  const source: VideoBehavioralSource = detector ? "recording_playback" : "motion_fallback";
  const maxSamples = options?.maxSamples ?? 20;
  const intervalMs = options?.intervalMs ?? 1000;

  previousMotion = 0;

  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Could not load recording"));
  });
  await video.play();

  const samples: VideoBehavioralSample[] = [];
  const duration = Math.min(video.duration || maxSamples, maxSamples * (intervalMs / 1000));

  while (video.currentTime < duration && samples.length < maxSamples) {
    const frame = await analyzeFrame(
      video,
      video.videoWidth || 640,
      video.videoHeight || 480,
      detector
    );
    samples.push({
      atSec: Math.round(video.currentTime * 10) / 10,
      faceDetected: frame.faceDetected,
      engagement: frame.engagement,
      attention: frame.attention,
    });
    video.currentTime = Math.min(video.duration, video.currentTime + intervalMs / 1000);
    await new Promise((r) => setTimeout(r, 50));
  }

  return { samples, source };
}
