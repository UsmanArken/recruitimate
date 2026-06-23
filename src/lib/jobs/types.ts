import type { BackgroundJobType } from "@prisma/client";

export type TranscribeInterviewPayload = {
  applicationId: string;
  interviewId: string;
};

export type AnalyzeInterviewPayload = {
  applicationId: string;
  interviewId: string;
};

export type JobPayloadMap = {
  TRANSCRIBE_INTERVIEW: TranscribeInterviewPayload;
  ANALYZE_INTERVIEW: AnalyzeInterviewPayload;
};

export type JobPayload<T extends BackgroundJobType = BackgroundJobType> =
  T extends keyof JobPayloadMap ? JobPayloadMap[T] : never;

export type JobEnqueueResult = {
  jobId: string;
  status: "queued";
  type: BackgroundJobType;
};
