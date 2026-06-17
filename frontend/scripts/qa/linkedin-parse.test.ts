import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseLinkedInProfile, isLinkedInProfileUrl } from "../../src/lib/linkedin/parse-profile";

describe("linkedin parse", () => {
  it("detects linkedin URLs", () => {
    assert.equal(isLinkedInProfileUrl("https://www.linkedin.com/in/jane-doe"), true);
    assert.equal(isLinkedInProfileUrl("https://example.com"), false);
  });

  it("normalizes pasted profile text", async () => {
    const raw = `Jane Doe
Senior Engineer
About
10 years building distributed systems.
Experience
Acme Corp — Staff Engineer
Skills
TypeScript
PostgreSQL`;

    const result = await parseLinkedInProfile(raw);
    assert.ok(result.normalizedText.length > 40);
    assert.ok(result.skills.length >= 1);
  });
});
