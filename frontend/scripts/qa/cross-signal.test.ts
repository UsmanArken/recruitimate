import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateCrossSignals } from "../../src/lib/intelligence/interview/cross-signal-engine";
import { detectLiveInconsistencies } from "../../src/lib/intelligence/interview/inconsistency-engine";
import { generateLiveAssistSuggestions } from "../../src/lib/intelligence/interview/live-assist-engine";

function clearLlmKeys() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GOOGLE_API_KEY;
}

describe("Cross-signal validation (heuristic)", () => {
  it("flags experience gap between resume and live transcript", async () => {
    clearLlmKeys();

    const result = await validateCrossSignals({
      transcript:
        "I've been working professionally for about 3 years. Mostly frontend with React.",
      resumeText:
        "Senior engineer with 8 years of TypeScript, React, and PostgreSQL experience.",
      candidateName: "Jane Doe",
      jobTitle: "Backend Engineer",
      skills: ["typescript", "react", "postgresql"],
      experienceYears: 8,
      talentGaps: ["Kubernetes"],
      talentStrengths: ["TypeScript"],
    });

    assert.ok(result.alerts.length > 0);
    assert.ok(result.alerts.some((a) => a.type === "experience_gap" || a.type === "skill_gap"));
    assert.ok(result.summary.length > 5);
  });

  it("detects resume strength denied in live answers", async () => {
    clearLlmKeys();

    const result = await validateCrossSignals({
      transcript:
        "I have never used Kubernetes in production and I'm not familiar with it at all.",
      resumeText: "8 years experience. Expert in Kubernetes, Docker, and cloud-native systems.",
      candidateName: "Alex",
      jobTitle: "Platform Engineer",
      skills: ["kubernetes", "docker"],
      experienceYears: 8,
      talentStrengths: ["Kubernetes"],
      talentGaps: [],
    });

    assert.ok(
      result.alerts.some(
        (a) => a.type === "contradiction" || a.label.toLowerCase().includes("strength")
      )
    );
  });
});

describe("Live inconsistency flags (heuristic)", () => {
  it("flags conflicting year mentions in transcript", async () => {
    clearLlmKeys();

    const result = await detectLiveInconsistencies({
      transcript:
        "I have 5 years of backend experience. Earlier I said I only had 2 years in distributed systems.",
    });

    assert.ok(result.flags.length > 0);
    assert.ok(result.flags.some((f) => f.label.toLowerCase().includes("experience")));
  });

  it("flags ownership wording shifts", async () => {
    clearLlmKeys();

    const result = await detectLiveInconsistencies({
      transcript:
        "I led the entire migration project end to end. I also helped the team and assisted with planning.",
    });

    assert.ok(result.flags.some((f) => f.label.toLowerCase().includes("ownership")));
  });
});

describe("Combined live assist (P2-002–004)", () => {
  it("returns suggestions plus mismatch alerts and inconsistency flags", async () => {
    clearLlmKeys();

    const result = await generateLiveAssistSuggestions({
      transcript:
        "We worked on the migration. I have 3 years experience. I led it but also just helped the team.",
      candidateName: "Jane Doe",
      jobTitle: "Backend Engineer",
      jobRequirements: "typescript postgres",
      resumeText: "8 years TypeScript and PostgreSQL. Led platform migrations at scale.",
      skills: ["typescript", "postgresql"],
      experienceYears: 8,
      talentGaps: ["Kubernetes production experience"],
      talentStrengths: ["TypeScript"],
    });

    assert.ok(result.suggestions.length >= 2);
    assert.ok(Array.isArray(result.mismatchAlerts));
    assert.ok(Array.isArray(result.inconsistencyFlags));
    assert.ok(result.crossSignalSummary.length > 0);
  });
});
