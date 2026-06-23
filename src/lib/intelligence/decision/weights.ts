import type { AssessmentSignal } from "../types";

function computeWeights(hasInterview: boolean, hasAssessment: boolean) {  if (hasInterview && hasAssessment) {
    return { talent: 0.3, interview: 0.4, assessment: 0.3 };
  }
  if (hasInterview) {
    return { talent: 0.4, interview: 0.6, assessment: 0 };
  }
  if (hasAssessment) {
    return { talent: 0.5, interview: 0, assessment: 0.5 };
  }
  return { talent: 1, interview: 0, assessment: 0 };
}

export function blendDecisionScores(input: {
  talentScore: number;
  interviewScore: number;
  assessmentScore: number;
  hasInterview: boolean;
  hasAssessment: boolean;
}): {
  hireConfidence: number;
  weights: ReturnType<typeof computeWeights>;
} {
  const weights = computeWeights(input.hasInterview, input.hasAssessment);
  const hireConfidence =
    input.talentScore * weights.talent +
    input.interviewScore * weights.interview +
    input.assessmentScore * weights.assessment;

  return { hireConfidence, weights };
}
