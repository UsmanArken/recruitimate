import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateDecision } from "../../src/lib/intelligence/decision/engine";
import { blendDecisionScores } from "../../src/lib/intelligence/decision/weights";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Assessment in decision layer", () => {
  it("blends assessment weight with talent and interview", () => {
    const { hireConfidence, weights } = blendDecisionScores({
      talentScore: 0.7,
      interviewScore: 0.8,
      assessmentScore: 0.9,
      hasInterview: true,
      hasAssessment: true,
    });

    assert.equal(weights.talent + weights.interview + weights.assessment, 1);
    assert.ok(hireConfidence > 0.75 && hireConfidence < 0.85);
  });

  it("includes assessment in hire confidence without interview", async () => {
    clearLlmKeys();

    const decision = await generateDecision(
      {
        skills: ["typescript"],
        experienceYears: 5,
        roleFitScore: 0.7,
        strengths: [],
        gaps: [],
        hiddenSignals: [],
        explanation: "",
      },
      null,
      "Alex Chen",
      { jobId: "job-1", jobTitle: "Backend Engineer" },
      { overallScore: 0.85 }
    );

    assert.ok(decision.hireConfidence != null);
    assert.ok(decision.signalBreakdown.assessmentWeight > 0);
    assert.ok(decision.signalBreakdown.assessmentScore > 0);
    assert.equal(
      decision.signalBreakdown.talentWeight +
        decision.signalBreakdown.interviewWeight +
        decision.signalBreakdown.assessmentWeight,
      1
    );
  });
});
