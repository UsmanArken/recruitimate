import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeInterviewerQuality } from "../../src/lib/intelligence/interview/interviewer-quality-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

const SAMPLE_TRANSCRIPT = `
Interviewer: Thanks for joining. Can you walk me through your backend experience?
Candidate: I worked on APIs with TypeScript and Postgres for about four years.
Interviewer: Tell me more about how you handled scale.
Candidate: We sharded reads and used caching, um, for the main product flows.
Interviewer: Where are you from originally?
Candidate: I grew up in Chicago and moved here for work.
Interviewer: Are you married? Do you have kids?
Candidate: I'd prefer to focus on my technical background.
`.trim();

describe("Interviewer quality analysis (heuristic)", () => {
  it("scores coverage probing and bias risk in range", async () => {
    clearLlmKeys();

    const result = await analyzeInterviewerQuality({
      transcript: SAMPLE_TRANSCRIPT,
      jobTitle: "Backend Engineer",
      jobRequirements: "typescript postgres distributed systems kubernetes",
    });

    for (const key of ["coverageScore", "probingScore", "biasRiskScore"] as const) {
      assert.ok(result[key] >= 0 && result[key] <= 1, `${key} in range`);
    }
    assert.ok(result.explanation.length > 5);
  });

  it("flags coverage gaps for missing requirements", async () => {
    clearLlmKeys();

    const result = await analyzeInterviewerQuality({
      transcript: "We talked about teamwork and communication styles for an hour.",
      jobTitle: "Backend Engineer",
      jobRequirements: "typescript postgres kubernetes",
    });

    assert.ok(result.coverageGaps.length > 0);
    assert.ok(result.coverageScore < 0.6);
  });

  it("detects advisory bias patterns in interviewer prompts", async () => {
    clearLlmKeys();

    const result = await analyzeInterviewerQuality({
      transcript: SAMPLE_TRANSCRIPT,
      jobTitle: "Backend Engineer",
      jobRequirements: "typescript postgres",
    });

    assert.ok(result.biasFlags.length > 0);
    assert.ok(result.biasRiskScore > 0.15);
  });

  it("recognizes probing follow-ups positively", async () => {
    clearLlmKeys();

    const result = await analyzeInterviewerQuality({
      transcript: `
Interviewer: Can you elaborate on the system design?
Candidate: We used event-driven architecture.
Interviewer: What specifically were the trade-offs?
Candidate: Latency vs consistency.
Interviewer: How did you measure success?
Candidate: p99 latency and error budgets.
`.trim(),
      jobTitle: "Staff Engineer",
      jobRequirements: "system design typescript",
    });

    assert.ok(result.probingScore >= 0.2);
    assert.ok(result.probingSignals.length > 0);
  });
});
