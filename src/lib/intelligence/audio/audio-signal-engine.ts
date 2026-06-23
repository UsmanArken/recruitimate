import { readFile } from "fs/promises";
import path from "path";
import type {
  AudioPauseSignal,
  AudioSignalResult,
  AudioToneShift,
  Signal,
} from "../types";
import { absoluteRecordingPath } from "@/lib/storage/interview-recordings";

const WINDOW_MS = 50;
const MIN_PAUSE_MS = 700;
const TONE_SHIFT_RATIO = 1.75;

type PcmData = {
  samples: Float32Array;
  sampleRate: number;
};

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function levelFromRms(rms: number): "low" | "medium" | "high" {
  if (rms < 0.03) return "low";
  if (rms < 0.1) return "medium";
  return "high";
}

/** Minimal RIFF WAV decoder for 16-bit PCM mono/stereo. */
export function decodeWavPcm(buffer: Buffer): PcmData | null {
  if (buffer.length < 44 || buffer.toString("ascii", 0, 4) !== "RIFF") return null;

  let offset = 12;
  let sampleRate = 0;
  let numChannels = 1;
  let bitsPerSample = 16;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === "fmt ") {
      numChannels = buffer.readUInt16LE(chunkStart + 2);
      sampleRate = buffer.readUInt32LE(chunkStart + 4);
      bitsPerSample = buffer.readUInt16LE(chunkStart + 14);
    } else if (chunkId === "data") {
      dataOffset = chunkStart;
      dataSize = chunkSize;
      break;
    }

    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (dataOffset < 0 || sampleRate <= 0 || bitsPerSample !== 16) return null;

  const frameCount = Math.floor(dataSize / (bitsPerSample / 8) / numChannels);
  const samples = new Float32Array(frameCount);

  for (let i = 0; i < frameCount; i++) {
    let sum = 0;
    for (let ch = 0; ch < numChannels; ch++) {
      const sampleOffset = dataOffset + (i * numChannels + ch) * 2;
      if (sampleOffset + 2 > buffer.length) break;
      const int16 = buffer.readInt16LE(sampleOffset);
      sum += int16 / 32768;
    }
    samples[i] = sum / numChannels;
  }

  return { samples, sampleRate };
}

export function analyzePcmSignals(pcm: PcmData): Omit<AudioSignalResult, "source" | "explanation"> {
  const { samples, sampleRate } = pcm;
  const windowSize = Math.max(1, Math.floor((sampleRate * WINDOW_MS) / 1000));
  const minPauseWindows = Math.ceil(MIN_PAUSE_MS / WINDOW_MS);
  const windowCount = Math.ceil(samples.length / windowSize);

  const rmsValues: number[] = [];
  for (let w = 0; w < windowCount; w++) {
    const start = w * windowSize;
    const end = Math.min(samples.length, start + windowSize);
    let sumSq = 0;
    for (let i = start; i < end; i++) sumSq += samples[i] * samples[i];
    rmsValues.push(Math.sqrt(sumSq / Math.max(1, end - start)));
  }

  const peak = Math.max(...rmsValues, 0.001);
  const silenceThreshold = peak * 0.08;

  const pauses: AudioPauseSignal[] = [];
  let pauseStart: number | null = null;
  let pauseWindows = 0;

  for (let w = 0; w < rmsValues.length; w++) {
    const isSilent = rmsValues[w] < silenceThreshold;
    if (isSilent) {
      if (pauseStart == null) pauseStart = w;
      pauseWindows++;
    } else if (pauseStart != null) {
      if (pauseWindows >= minPauseWindows) {
        const startSec = (pauseStart * windowSize) / sampleRate;
        const endSec = (w * windowSize) / sampleRate;
        const durationSec = endSec - startSec;
        pauses.push({
          startSec: round2(startSec),
          endSec: round2(endSec),
          durationSec: round2(durationSec),
          label:
            durationSec >= 2.5
              ? "Extended pause"
              : durationSec >= 1.2
                ? "Notable pause"
                : "Brief pause",
        });
      }
      pauseStart = null;
      pauseWindows = 0;
    }
  }

  const speechRms: { index: number; rms: number }[] = [];
  for (let w = 0; w < rmsValues.length; w++) {
    if (rmsValues[w] >= silenceThreshold) {
      speechRms.push({ index: w, rms: rmsValues[w] });
    }
  }

  const toneShifts: AudioToneShift[] = [];
  for (let i = 1; i < speechRms.length; i++) {
    const prev = speechRms[i - 1];
    const curr = speechRms[i];
    const ratio = curr.rms / Math.max(prev.rms, 0.001);
    if (ratio >= TONE_SHIFT_RATIO || ratio <= 1 / TONE_SHIFT_RATIO) {
      const atSec = round2((curr.index * windowSize) / sampleRate);
      toneShifts.push({
        atSec,
        fromLevel: levelFromRms(prev.rms),
        toLevel: levelFromRms(curr.rms),
        evidence: `Energy shifted ${ratio >= 1 ? "up" : "down"} (~${round2(Math.abs(ratio))}×) around ${atSec}s`,
      });
    }
  }

  const durationSec = round2(samples.length / sampleRate);
  const pauseDurations = pauses.map((p) => p.durationSec);
  const longestPauseSec = pauseDurations.length ? Math.max(...pauseDurations) : 0;
  const avgPauseSec = pauseDurations.length
    ? pauseDurations.reduce((a, b) => a + b, 0) / pauseDurations.length
    : 0;

  const pauseDensityScore = clamp01(
    pauses.length / Math.max(durationSec / 30, 1) + longestPauseSec / 10
  );

  const rmsSpread =
    speechRms.length > 1
      ? Math.max(...speechRms.map((s) => s.rms)) - Math.min(...speechRms.map((s) => s.rms))
      : 0;
  const energyVariabilityScore = clamp01(rmsSpread / peak + toneShifts.length * 0.05);

  const signals: Signal[] = [];
  if (longestPauseSec >= 2) {
    signals.push({
      label: "Extended silence",
      value: `Longest detected pause: ${longestPauseSec}s`,
      evidence: "PCM silence windows in recording.",
      confidence: "high",
    });
  }
  if (toneShifts.length >= 3) {
    signals.push({
      label: "Energy variability",
      value: `${toneShifts.length} tone/energy shifts detected`,
      evidence: "Amplitude changes between speech segments.",
      confidence: "medium",
    });
  }
  if (pauses.length === 0 && durationSec > 30) {
    signals.push({
      label: "Steady pacing",
      value: "Few extended pauses detected in audio",
      evidence: "Continuous speech energy across recording.",
      confidence: "medium",
    });
  }

  return {
    durationSec,
    pauseCount: pauses.length,
    avgPauseSec: round2(avgPauseSec),
    longestPauseSec: round2(longestPauseSec),
    pauses: pauses.slice(0, 12),
    toneShifts: toneShifts.slice(0, 8),
    pauseDensityScore,
    energyVariabilityScore,
    signals,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function analyzeTranscriptFallback(transcript: string): Omit<AudioSignalResult, "source" | "explanation"> {
  const sentences = transcript.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  const fillers = (transcript.match(/\b(um|uh|er|hmm|like|you know)\b/gi) ?? []).length;
  const words = transcript.split(/\s+/).length;
  const estimatedDurationSec = round2(words / 2.2);

  const pauses: AudioPauseSignal[] = [];
  for (let i = 0; i < sentences.length - 1; i++) {
    const sentence = sentences[i];
    if (/\b(um|uh|let me think|give me a moment)\b/i.test(sentence) || sentence.length < 20) {
      const atSec = round2((i + 1) * (estimatedDurationSec / Math.max(sentences.length, 1)));
      pauses.push({
        startSec: atSec,
        endSec: round2(atSec + 1.2),
        durationSec: 1.2,
        label: "Inferred hesitation pause",
      });
    }
  }

  const toneShifts: AudioToneShift[] = [];
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  for (let i = 1; i < lengths.length; i++) {
    const ratio = lengths[i] / Math.max(lengths[i - 1], 1);
    if (ratio >= 2 || ratio <= 0.5) {
      toneShifts.push({
        atSec: round2((i * estimatedDurationSec) / Math.max(sentences.length, 1)),
        fromLevel: ratio >= 2 ? "low" : "high",
        toLevel: ratio >= 2 ? "high" : "low",
        evidence: "Response length shift between adjacent answers (transcript proxy).",
      });
    }
  }

  const pauseDensityScore = clamp01(fillers / Math.max(words / 40, 1) + pauses.length * 0.08);
  const energyVariabilityScore = clamp01(toneShifts.length * 0.12 + fillers * 0.02);

  return {
    durationSec: estimatedDurationSec,
    pauseCount: pauses.length,
    avgPauseSec: pauses.length
      ? round2(pauses.reduce((a, p) => a + p.durationSec, 0) / pauses.length)
      : 0,
    longestPauseSec: pauses.length ? Math.max(...pauses.map((p) => p.durationSec)) : 0,
    pauses: pauses.slice(0, 8),
    toneShifts: toneShifts.slice(0, 6),
    pauseDensityScore,
    energyVariabilityScore,
    signals: [
      {
        label: "Transcript pacing",
        value:
          fillers > 4
            ? `${fillers} filler words — possible hesitation in speech`
            : "Relatively fluent transcript pacing",
        evidence: "Inferred from transcript text (audio PCM decode unavailable).",
        confidence: "low",
      },
    ],
  };
}

export async function extractAudioSignals(
  relativePath: string,
  transcript?: string | null
): Promise<AudioSignalResult> {
  const absolute = absoluteRecordingPath(relativePath);
  const buffer = await readFile(absolute);
  const ext = path.extname(relativePath).toLowerCase();

  if (ext === ".wav") {
    const pcm = decodeWavPcm(buffer);
    if (pcm) {
      const metrics = analyzePcmSignals(pcm);
      return {
        ...metrics,
        source: "wav_pcm",
        explanation: `Pause and tone signals extracted from WAV PCM (${pcm.sampleRate} Hz).`,
      };
    }
  }

  const fallback = analyzeTranscriptFallback(transcript ?? "");
  return {
    ...fallback,
    source: "transcript_fallback",
    explanation:
      ext === ".wav"
        ? "Could not decode WAV PCM — used transcript pacing fallback."
        : `Format ${ext || "unknown"} — upload WAV for full PCM analysis; using transcript pacing fallback.`,
  };
}

/** Build a mono 16-bit PCM WAV buffer for tests. */
export function buildTestWavFromAmplitudes(sampleRate: number, amplitudes: number[]): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = amplitudes.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE((sampleRate * numChannels * bitsPerSample) / 8, 28);
  buffer.writeUInt16LE((numChannels * bitsPerSample) / 8, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < amplitudes.length; i++) {
    const amp = amplitudes[i] ?? 0;
    const int16 = Math.max(-32768, Math.min(32767, Math.round(amp * 32767)));
    buffer.writeInt16LE(int16, 44 + i * 2);
  }

  return buffer;
}
