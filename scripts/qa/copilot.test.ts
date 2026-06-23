import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  detectCopilotIntent,
  COPILOT_STARTER_PROMPTS,
} from "../../src/lib/intelligence/copilot/intent-engine";
import { buildTopCandidatesReply } from "../../src/lib/intelligence/copilot/top-candidates-handler";
import { compareCandidates } from "../../src/lib/intelligence/copilot/compare-handler";
import { summarizeInterview } from "../../src/lib/intelligence/copilot/interview-summary-handler";
import { runCopilotChat } from "../../src/lib/intelligence/copilot/copilot-engine";
import { copilotChatSchema } from "../../src/lib/validators/copilot";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Copilot intent detection", () => {
  it("detects top candidates intent", () => {
    assert.equal(detectCopilotIntent("Show top candidates for this role"), "top_candidates");
    assert.equal(detectCopilotIntent("Who should we shortlist?"), "top_candidates");
  });

  it("detects compare intent", () => {
    assert.equal(detectCopilotIntent("Why is A better than B?"), "compare_candidates");
    assert.equal(detectCopilotIntent("Compare Jordan vs Sam"), "compare_candidates");
  });

  it("detects interview summary intent", () => {
    assert.equal(detectCopilotIntent("Summarize this interview"), "interview_summary");
    assert.equal(detectCopilotIntent("Give me a recap of the interview"), "interview_summary");
  });

  it("falls back to general", () => {
    assert.equal(detectCopilotIntent("What is our hiring process?"), "general");
  });

  it("exposes starter prompts for UI", () => {
    assert.equal(COPILOT_STARTER_PROMPTS.length, 3);
  });
});

describe("Copilot handlers", () => {
  it("ranks pipeline by hire confidence", () => {
    const result = buildTopCandidatesReply("Backend Engineer", [
      {
        applicationId: "app-1",
        candidateId: "c-1",
        name: "Jordan",
        roleFitScore: 0.7,
        hireConfidence: 0.85,
        recommendation: "strong_yes",
        strengths: ["TypeScript"],
      },
      {
        applicationId: "app-2",
        candidateId: "c-2",
        name: "Sam",
        roleFitScore: 0.9,
        hireConfidence: 0.6,
        recommendation: "maybe",
        strengths: ["React"],
      },
    ]);

    assert.equal(result.intent, "top_candidates");
    assert.ok(result.reply.includes("Jordan"));
    assert.equal(result.citations[0].label, "Jordan");
  });

  it("compares two candidates heuristically", async () => {
    clearLlmKeys();

    const result = await compareCandidates(
      "Backend Engineer",
      {
        name: "Jordan",
        applicationId: "app-1",
        candidateId: "c-1",
        roleFitScore: 0.8,
        hireConfidence: 0.82,
        recommendation: "yes",
        strengths: ["TypeScript", "Postgres"],
        gaps: [],
      },
      {
        name: "Sam",
        applicationId: "app-2",
        candidateId: "c-2",
        roleFitScore: 0.75,
        hireConfidence: 0.7,
        recommendation: "maybe",
        strengths: ["React"],
        gaps: ["distributed systems"],
      }
    );

    assert.equal(result.intent, "compare_candidates");
    assert.ok(result.reply.includes("Jordan"));
    assert.equal(result.citations.length, 2);
  });

  it("summarizes interview from analysis signals", async () => {
    clearLlmKeys();

    const result = await summarizeInterview({
      candidateName: "Jordan",
      jobTitle: "Backend Engineer",
      interviewTitle: "Technical screen",
      analysisExplanation: "Strong system design answers with clear trade-offs.",
      confidenceScore: 0.82,
      clarityScore: 0.78,
      consistencyScore: 0.8,
      riskFlags: ["Limited Kubernetes depth"],
    });

    assert.equal(result.intent, "interview_summary");
    assert.ok(result.reply.includes("Jordan"));
    assert.ok(result.reply.includes("system design"));
  });
});

describe("Copilot orchestrator", () => {
  it("asks for job context when ranking without pipeline", async () => {
    clearLlmKeys();

    const result = await runCopilotChat({
      message: "Show top candidates for this role",
    });

    assert.equal(result.intent, "top_candidates");
    assert.ok(result.reply.toLowerCase().includes("role"));
  });

  it("runs top candidates when pipeline provided", async () => {
    const result = await runCopilotChat({
      message: "Show top candidates for this role",
      jobTitle: "Backend Engineer",
      pipeline: [
        {
          applicationId: "app-1",
          candidateId: "c-1",
          name: "Jordan",
          roleFitScore: 0.8,
          hireConfidence: 0.9,
          recommendation: "yes",
          strengths: [],
        },
      ],
    });

    assert.equal(result.intent, "top_candidates");
    assert.ok(result.reply.includes("Jordan"));
  });
});

describe("Copilot validator", () => {
  it("requires message length", () => {
    assert.equal(copilotChatSchema.safeParse({ message: "x" }).success, false);
    assert.equal(
      copilotChatSchema.safeParse({ message: "Show top candidates" }).success,
      true
    );
  });
});
