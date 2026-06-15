import { z } from "zod";

export const videoBehavioralSampleSchema = z.object({
  atSec: z.number().min(0),
  faceDetected: z.boolean(),
  engagement: z.number().min(0).max(1),
  attention: z.number().min(0).max(1),
});

export const submitVideoMetricsSchema = z.object({
  consentAccepted: z.literal(true),
  candidateInformed: z.literal(true),
  source: z.enum(["webcam_live", "recording_playback", "motion_fallback"]),
  durationSec: z.number().min(1).max(3600),
  samples: z.array(videoBehavioralSampleSchema).min(3).max(120),
});

export type SubmitVideoMetricsInput = z.output<typeof submitVideoMetricsSchema>;
