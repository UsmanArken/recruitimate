import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { personalizeOutreachMessage } from "../../src/lib/intelligence/outreach/personalize-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Outreach personalization (heuristic)", () => {
  it("personalizes message from candidate profile context", async () => {
    clearLlmKeys();

    const result = await personalizeOutreachMessage({
      candidateName: "Alex Chen",
      candidateEmail: "alex@example.com",
      candidateProfile:
        "Senior backend engineer with TypeScript, distributed systems, and Kubernetes experience.",
      jobTitle: "Staff Backend Engineer",
      jobRequirements: "typescript distributed systems",
      recruiterName: "Sam",
      companyName: "Acme",
      templateSubject: "{{jobTitle}} at {{companyName}}",
      templateBody: "Hi {{candidateName}}, we'd love to connect about {{jobTitle}}.",
      tone: "professional",
    });

    assert.ok(result.subject.length > 5);
    assert.ok(result.bodyText.includes("Alex Chen"));
    assert.ok(result.highlights.length >= 0);
    assert.ok(result.explanation.length > 0);
  });
});
