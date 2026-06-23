import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateAssessmentSubmission } from "../../src/lib/intelligence/assessment/evaluation-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Assessment evaluation", () => {
  it("scores submission against rubric", async () => {
    clearLlmKeys();

    const result = await evaluateAssessmentSubmission({
      task: {
        title: "API reliability",
        prompt: "Design a caching strategy for a high-traffic API.",
        taskType: "code",
        skillsTested: ["typescript", "distributed", "postgres"],
        rubric: [
          { id: "architecture", label: "Architecture", weight: 0.5, description: "Sound design" },
          { id: "tradeoffs", label: "Trade-offs", weight: 0.5, description: "Risks acknowledged" },
        ],
      },
      responseText:
        "I would add Redis caching for hot read paths, use postgres read replicas for distributed " +
        "read scaling, and document trade-offs around cache invalidation and stale reads. " +
        "The rollout plan includes feature flags and observability metrics for typescript services.",
      candidateName: "Alex",
    });

    assert.ok(result.overallScore >= 0.4 && result.overallScore <= 1);
    assert.equal(result.criterionScores.length, 2);
    assert.ok(result.strengths.length > 0);
    assert.ok(result.explanation.length > 0);
  });
});
