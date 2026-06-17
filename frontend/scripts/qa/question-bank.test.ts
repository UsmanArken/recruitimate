import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateInterviewQuestionBank } from "../../src/lib/intelligence/interview/question-bank-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Interview question bank (heuristic)", () => {
  it("generates role-specific questions from job context", async () => {
    clearLlmKeys();

    const result = await generateInterviewQuestionBank({
      jobTitle: "Backend Engineer",
      jobDescription: "Build APIs and data pipelines for our hiring platform.",
      jobRequirements: "typescript postgres distributed systems kubernetes",
      count: 10,
    });

    assert.ok(result.questions.length >= 5);
    assert.ok(result.roleSummary.toLowerCase().includes("backend"));
    assert.ok(result.questions.every((q) => q.question.length > 15));
    assert.ok(
      result.questions.some((q) =>
        ["technical", "behavioral", "situational", "role_fit", "culture"].includes(q.category)
      )
    );
  });

  it("filters by focus category", async () => {
    clearLlmKeys();

    const result = await generateInterviewQuestionBank({
      jobTitle: "Product Manager",
      jobDescription: "Own roadmap for recruiter workflows.",
      jobRequirements: "stakeholder management analytics",
      focus: "behavioral",
      count: 8,
    });

    assert.ok(result.questions.length > 0);
    assert.ok(result.questions.every((q) => q.category === "behavioral"));
  });

  it("assigns valid difficulty levels", async () => {
    clearLlmKeys();

    const result = await generateInterviewQuestionBank({
      jobTitle: "Staff Engineer",
      jobDescription: "Lead architecture for multi-tenant SaaS.",
      jobRequirements: "system design typescript",
      count: 6,
    });

    for (const q of result.questions) {
      assert.ok(["easy", "medium", "hard"].includes(q.difficulty));
      assert.ok(q.probesFor.length > 0);
      assert.ok(q.rationale.length > 0);
    }
  });
});
