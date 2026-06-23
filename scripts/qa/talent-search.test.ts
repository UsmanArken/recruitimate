import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { searchTalentCandidates } from "../../src/lib/intelligence/talent/search-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

const CORPUS = [
  {
    id: "c1",
    name: "Jordan Lee",
    email: "jordan@example.com",
    searchDocument:
      "Backend engineer with 6 years TypeScript, Postgres, distributed systems, and Kubernetes.",
    searchSkills: ["typescript", "postgres", "distributed", "kubernetes", "backend"],
    experienceYears: 6,
  },
  {
    id: "c2",
    name: "Sam Patel",
    email: "sam@example.com",
    searchDocument: "Frontend developer focused on React and design systems.",
    searchSkills: ["react", "frontend"],
    experienceYears: 4,
  },
  {
    id: "c3",
    name: "Riley Kim",
    email: null,
    searchDocument: "Data engineer with Spark, Kafka, and Python pipelines.",
    searchSkills: ["spark", "kafka", "python", "data engineering"],
    experienceYears: 7,
  },
];

describe("Ranked talent search", () => {
  it("ranks backend distributed systems query highest for matching engineer", async () => {
    clearLlmKeys();

    const result = await searchTalentCandidates(
      "Find backend engineers with distributed systems",
      CORPUS,
      null,
      10
    );

    assert.ok(result.results.length > 0);
    assert.equal(result.results[0].candidateId, "c1");
    assert.ok(result.results[0].matchedSkills.includes("distributed"));
    assert.ok(result.parsedTerms.length > 0);
  });

  it("returns data engineering matches for spark kafka query", async () => {
    clearLlmKeys();

    const result = await searchTalentCandidates(
      "data engineering spark kafka",
      CORPUS,
      null,
      5
    );

    assert.ok(result.results.some((r) => r.candidateId === "c3"));
  });
});
