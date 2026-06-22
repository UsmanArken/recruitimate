import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { suggestCandidatesForJob } from "../../src/lib/intelligence/talent/suggest-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Suggested candidates for job", () => {
  it("suggests internal talent not already on the job", async () => {
    clearLlmKeys();

    const result = await suggestCandidatesForJob(
      "job-1",
      "Backend Engineer",
      "typescript postgres distributed systems kubernetes",
      [
        {
          id: "c1",
          name: "Jordan Lee",
          email: "jordan@example.com",
          searchDocument:
            "Backend engineer with TypeScript, Postgres, distributed systems, Kubernetes.",
          searchSkills: ["typescript", "postgres", "distributed", "kubernetes"],
          experienceYears: 6,
          alreadyApplied: false,
        },
        {
          id: "c2",
          name: "Sam Patel",
          email: "sam@example.com",
          searchDocument: "React frontend specialist.",
          searchSkills: ["react", "frontend"],
          experienceYears: 3,
          alreadyApplied: true,
        },
      ],
      5
    );

    assert.equal(result.suggestions.length, 1);
    assert.equal(result.suggestions[0].candidateId, "c1");
    assert.ok(result.suggestions[0].matchScore > 0.4);
    assert.ok(result.suggestions[0].matchedSkills.includes("typescript"));
  });

  it("returns empty when all candidates already applied", async () => {
    clearLlmKeys();

    const result = await suggestCandidatesForJob(
      "job-1",
      "Backend Engineer",
      "typescript",
      [
        {
          id: "c1",
          name: "Jordan",
          email: null,
          searchDocument: "TypeScript backend developer",
          searchSkills: ["typescript"],
          experienceYears: 5,
          alreadyApplied: true,
        },
      ],
      5
    );

    assert.equal(result.suggestions.length, 0);
    assert.ok(result.explanation.includes("No eligible"));
  });
});
