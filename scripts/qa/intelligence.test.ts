import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeTalent } from "../../src/lib/intelligence/talent/engine";
import { analyzeInterview } from "../../src/lib/intelligence/interview/engine";
import { generateDecision } from "../../src/lib/intelligence/decision/engine";

/** Runs heuristic path (no OpenAI key in CI/local QA). */
describe("Talent intelligence (heuristic)", () => {
  it("extracts skills and experience from resume text", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const result = await analyzeTalent(
      "Senior engineer with 8 years of TypeScript, React, and PostgreSQL experience.",
      "Backend Engineer",
      "typescript postgres distributed systems"
    );

    if (prev) process.env.OPENAI_API_KEY = prev;

    assert.ok(result.skills.includes("typescript"));
    assert.equal(result.experienceYears, 8);
    assert.ok(result.roleFitScore != null);
    assert.ok(result.roleFitScore >= 0.4 && result.roleFitScore <= 1);
    assert.ok(result.strengths.length > 0);
    assert.ok(result.explanation.length > 0);
  });
});

describe("Interview intelligence (heuristic)", () => {
  it("returns bounded scores for a transcript", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const transcript =
      "I led the migration um uh to Kubernetes across three teams. " +
      "We reduced deploy time and improved reliability over six months.";

    const result = await analyzeInterview(transcript);

    if (prev) process.env.OPENAI_API_KEY = prev;

    for (const key of [
      "hesitationScore",
      "confidenceScore",
      "clarityScore",
      "consistencyScore",
      "engagementScore",
    ] as const) {
      assert.ok(result[key] >= 0 && result[key] <= 1, `${key} in range`);
    }
    assert.ok(result.cognitiveSignals.length > 0);
  });
});

describe("Decision intelligence (heuristic)", () => {
  it("synthesizes talent and interview into a recommendation", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const talent = await analyzeTalent(
      "8 years TypeScript and React. Built hiring platform at scale.",
      "Full Stack",
      "typescript react"
    );
    const interview = await analyzeInterview(
      "Clear answers on system design. Owned API and database choices."
    );
    const decision = await generateDecision(talent, interview, "Jane Doe", {
      jobId: "job-1",
      jobTitle: "Full Stack",
    });

    if (prev) process.env.OPENAI_API_KEY = prev;

    assert.ok(decision.hireConfidence != null);
    assert.ok(decision.hireConfidence >= 0 && decision.hireConfidence <= 1);
    assert.ok(
      ["strong_yes", "yes", "maybe", "no", "strong_no"].includes(
        decision.recommendation
      )
    );
    assert.ok(decision.explanation.length > 0);
    assert.equal(
      decision.signalBreakdown.talentWeight +
        decision.signalBreakdown.interviewWeight +
        (decision.signalBreakdown.assessmentWeight ?? 0),
      1
    );
  });
});
