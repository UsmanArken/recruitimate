export type DecisionWeights = {
  talent: number;
  interview: number;
  assessment: number;
};

/// Default prior used when an org has no retrained model yet.
export const DEFAULT_LEARNED_WEIGHTS: DecisionWeights = {
  talent: 0.3,
  interview: 0.4,
  assessment: 0.3,
};

function computeWeights(
  hasInterview: boolean,
  hasAssessment: boolean,
  learned?: DecisionWeights | null
): DecisionWeights {
  if (learned) {
    const talent = Math.max(learned.talent, 0);
    const interview = hasInterview ? Math.max(learned.interview, 0) : 0;
    const assessment = hasAssessment ? Math.max(learned.assessment, 0) : 0;
    const sum = talent + interview + assessment;
    if (sum <= 0) return { talent: 1, interview: 0, assessment: 0 };
    return { talent: talent / sum, interview: interview / sum, assessment: assessment / sum };
  }

  if (hasInterview && hasAssessment) {
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
  learnedWeights?: DecisionWeights | null;
}): {
  hireConfidence: number;
  weights: DecisionWeights;
} {
  const weights = computeWeights(
    input.hasInterview,
    input.hasAssessment,
    input.learnedWeights
  );
  const hireConfidence =
    input.talentScore * weights.talent +
    input.interviewScore * weights.interview +
    input.assessmentScore * weights.assessment;

  return { hireConfidence, weights };
}
