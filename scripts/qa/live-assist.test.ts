import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateLiveAssistSuggestions } from "../../src/lib/intelligence/interview/live-assist-engine";

describe("Live interview assist (heuristic)", () => {
  it("returns follow-up questions for a partial transcript", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const result = await generateLiveAssistSuggestions({
      transcript:
        "We worked on the migration and the team helped improve things. Um, it was a big project.",
      candidateName: "Jane Doe",
      jobTitle: "Backend Engineer",
      jobRequirements: "typescript postgres distributed systems",
      talentGaps: ["Kubernetes production experience"],
      talentStrengths: ["TypeScript"],
    });

    if (prev) process.env.OPENAI_API_KEY = prev;

    assert.ok(result.suggestions.length >= 2 && result.suggestions.length <= 5);
    assert.ok(result.momentSummary.length > 10);
    assert.ok(result.suggestions.every((s) => s.question.length > 10));
    assert.ok(result.suggestions.some((s) => s.category === "clarify" || s.category === "probe"));
  });

  it("rejects empty suggestions from malformed LLM output via heuristic shape", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const result = await generateLiveAssistSuggestions({
      transcript:
        "I led the API redesign and reduced p99 latency from 800ms to 120ms over six months.",
      candidateName: "Alex",
      jobTitle: "Staff Engineer",
      talentGaps: [],
      talentStrengths: ["System design"],
    });

    if (prev) process.env.OPENAI_API_KEY = prev;

    assert.ok(result.suggestions.length > 0);
    for (const s of result.suggestions) {
      assert.ok(["probe", "clarify", "deepen"].includes(s.category));
      assert.ok(["high", "medium", "low"].includes(s.priority));
    }
  });
});
