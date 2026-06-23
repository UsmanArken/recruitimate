import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateAssessmentTasks } from "../../src/lib/intelligence/assessment/assessment-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Assessment task generation", () => {
  it("generates role-specific real-world tasks", async () => {
    clearLlmKeys();

    const result = await generateAssessmentTasks({
      jobTitle: "Backend Engineer",
      jobDescription: "Build APIs for a multi-tenant hiring platform.",
      jobRequirements: "typescript postgres distributed systems",
      count: 3,
    });

    assert.ok(result.tasks.length >= 2);
    assert.ok(result.roleSummary.toLowerCase().includes("backend"));
    assert.ok(result.tasks.every((t) => t.prompt.length > 50));
    assert.ok(result.tasks.every((t) => t.rubric.length >= 3));
  });

  it("filters by task type focus", async () => {
    clearLlmKeys();

    const result = await generateAssessmentTasks({
      jobTitle: "Product Manager",
      jobDescription: "Own recruiter workflow roadmap.",
      jobRequirements: "stakeholder analytics",
      focus: "product",
      count: 2,
    });

    assert.ok(result.tasks.length > 0);
    assert.ok(result.tasks.every((t) => t.taskType === "product"));
  });
});
