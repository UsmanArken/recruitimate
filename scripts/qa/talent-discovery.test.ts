import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDiscoveryDocument,
  discoveryIngestExplanation,
} from "../../src/lib/intelligence/talent/discovery-engine";
import { extractSkillsFromText } from "../../src/lib/intelligence/talent/skill-keywords";

describe("Talent discovery indexing", () => {
  it("builds search document from resume and LinkedIn", () => {
    const doc = buildDiscoveryDocument({
      name: "Alex Chen",
      resumeText: "Senior backend engineer with 8 years TypeScript, Postgres, distributed systems.",
      linkedInText: "Led microservices migration at scale.",
    });

    assert.ok(doc.searchDocument.includes("distributed systems"));
    assert.ok(doc.searchSkills.includes("typescript"));
    assert.ok(doc.searchSkills.includes("distributed"));
    assert.equal(doc.experienceYears, 8);
  });

  it("explains ingest by source", () => {
    const msg = discoveryIngestExplanation("linkedin", 3);
    assert.ok(msg.includes("LinkedIn"));
    assert.ok(msg.includes("3 skill"));
  });

  it("extracts skills from free text", () => {
    const skills = extractSkillsFromText(
      "kubernetes docker aws backend engineer with react experience"
    );
    assert.ok(skills.includes("kubernetes"));
    assert.ok(skills.includes("react"));
    assert.ok(skills.includes("backend"));
  });
});
