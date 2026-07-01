import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mockLaborMarketProvider } from "../../src/lib/labor-market/mock-provider";
import { resolveLaborMarketProviderId } from "../../src/lib/labor-market/config";
import { modelCareerTrajectory } from "../../src/lib/intelligence/talent/career-trajectory-engine";

describe("Mock labor market provider", () => {
  it("returns deterministic passive leads for a job context", async () => {
    const result = await mockLaborMarketProvider.searchPassiveCandidates({
      jobId: "job-test-1",
      title: "Senior Backend Engineer",
      requirements: "typescript postgres kubernetes distributed systems",
      skills: ["typescript", "postgres", "kubernetes"],
    });

    assert.equal(result.provider, "mock");
    assert.ok(result.leads.length >= 5);
    assert.ok(result.marketContext.demandScore > 0);
    assert.ok(result.marketContext.talentPoolEstimate > 0);
    for (const lead of result.leads) {
      assert.ok(lead.name.length > 0);
      assert.ok(lead.opennessLikelihood >= 0 && lead.opennessLikelihood <= 1);
      assert.ok(lead.matchScore >= 0 && lead.matchScore <= 1);
    }
  });

  it("sorts leads by match score descending", async () => {
    const result = await mockLaborMarketProvider.searchPassiveCandidates({
      jobId: "job-sort",
      title: "Data Engineer",
      requirements: "spark kafka python",
      skills: ["spark", "kafka"],
    });
    for (let i = 1; i < result.leads.length; i++) {
      assert.ok(result.leads[i - 1].matchScore >= result.leads[i].matchScore);
    }
  });
});

describe("Labor market config", () => {
  it("defaults to mock provider", () => {
    const prev = process.env.LABOR_MARKET_PROVIDER;
    delete process.env.LABOR_MARKET_PROVIDER;
    assert.equal(resolveLaborMarketProviderId(), "mock");
    if (prev) process.env.LABOR_MARKET_PROVIDER = prev;
  });
});

describe("Career trajectory modeling", () => {
  const careerText = `
Jordan Lee
Senior Software Engineer at Acme Corp (2022–Present)
Software Engineer at Beta LLC (2019–2022)
Junior Developer at Startup Inc (2017–2019)
Skills: TypeScript, React, Node.js
`;

  it("parses roles and scores growth consistency", () => {
    const result = modelCareerTrajectory(careerText);
    assert.ok(result.rolesIdentified.length >= 2);
    assert.ok(result.growthConsistencyScore > 0.4);
    assert.ok(result.tenureStabilityScore > 0);
    assert.notEqual(result.promotionVelocity, "unknown");
    assert.ok(result.explanation.includes("Growth consistency"));
  });

  it("detects upward progression signals", () => {
    const result = modelCareerTrajectory(careerText);
    const upward = result.signals.find((s) => s.label === "Upward progression");
    assert.ok(upward, "expected upward progression signal");
  });

  it("handles insufficient profile text", () => {
    const result = modelCareerTrajectory("short");
    assert.equal(result.rolesIdentified.length, 0);
    assert.equal(result.promotionVelocity, "unknown");
    assert.ok(result.signals.some((s) => s.label === "Insufficient history"));
  });

  it("flags short tenures when year spans are very brief", () => {
    const hopper = `
Alex Kim
Engineer at Co A (2024–2025)
Developer at Co B (2023–2024)
Analyst at Co C (2022–2023)
Intern at Co D (2021–2022)
`;
    const result = modelCareerTrajectory(hopper);
    assert.ok(result.tenureStabilityScore < 0.55);
  });
});
