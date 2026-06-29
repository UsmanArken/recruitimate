import { z } from "zod";
import {
  HiringOutcomeStatus,
  OnboardingStatus,
  RecommendationFeedbackRating,
} from "@prisma/client";

export const recordOutcomeSchema = z.object({
  status: z.nativeEnum(HiringOutcomeStatus),
  onboardingStatus: z.nativeEnum(OnboardingStatus).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const recommendationFeedbackSchema = z.object({
  rating: z.nativeEnum(RecommendationFeedbackRating),
  comment: z.string().trim().max(1000).optional(),
});

export type RecordOutcomeInput = z.infer<typeof recordOutcomeSchema>;
export type RecommendationFeedbackInput = z.infer<
  typeof recommendationFeedbackSchema
>;
