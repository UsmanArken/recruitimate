import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PipelineStage } from "@prisma/client";
import {
  PIPELINE_STAGES,
  pipelineStageLabel,
} from "../../src/lib/pipeline/stages";
import {
  buildCandidateBrief,
  formatPercent,
} from "../../src/lib/intelligence/brief/candidate-brief";
import { updateApplicationStageSchema } from "../../src/lib/validators/pipeline";

describe("Pipeline stages", () => {
  it("defines all Prisma pipeline stages in kanban order", () => {
    const ids = PIPELINE_STAGES.map((s) => s.id);
    for (const stage of Object.values(PipelineStage)) {
      assert.ok(ids.includes(stage));
    }
    assert.equal(PIPELINE_STAGES.length, Object.values(PipelineStage).length);
  });

  it("labels stages for UI", () => {
    assert.equal(pipelineStageLabel("TALENT_REVIEW"), "Talent review");
  });
});

describe("Candidate brief", () => {
  it("assembles hire committee summary from application bundle", () => {
    const brief = buildCandidateBrief({
      stage: "DECISION",
      candidate: { name: "Jordan Lee", email: "jordan@example.com" },
      job: { title: "Backend Engineer" },
      talentProfile: {
        roleFitScore: 0.82,
        explanation: "Strong TypeScript and distributed systems background.",
        strengths: ["TypeScript", "Postgres"],
        gaps: ["Kubernetes depth"],
      },
      decision: {
        hireConfidence: 0.78,
        recommendation: "yes",
        explanation: "Solid talent and interview signals.",
        riskFactors: [{ value: "Limited leadership examples" }],
        signalBreakdown: {
          talentWeight: 0.4,
          interviewWeight: 0.4,
          assessmentWeight: 0.2,
        },
      },
      interviews: [
        {
          title: "Technical screen",
          analysis: {
            explanation: "Clear system design answers.",
            confidenceScore: 0.8,
            clarityScore: 0.76,
            consistencyScore: 0.79,
          },
        },
      ],
    });

    assert.equal(brief.candidateName, "Jordan Lee");
    assert.equal(brief.jobTitle, "Backend Engineer");
    assert.equal(brief.strengths.length, 2);
    assert.equal(formatPercent(brief.hireConfidence), "78%");
    assert.ok(brief.interviewSummary?.includes("system design"));
  });
});

describe("Pipeline validators", () => {
  it("accepts valid stage updates", () => {
    const result = updateApplicationStageSchema.safeParse({ stage: "SHORTLISTED" });
    assert.equal(result.success, true);
  });
});
