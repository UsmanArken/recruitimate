import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildInterviewAnalyzedEmail,
  buildStageChangeEmail,
} from "../../src/lib/email/templates/hiring-notifications";
import { notificationsEnabled, resolveEmailProviderId } from "../../src/lib/email/config";

describe("Email notification templates", () => {
  it("builds stage change subject and body", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const { subject, text } = buildStageChangeEmail({
      candidateName: "Jordan Lee",
      jobTitle: "Backend Engineer",
      fromStage: "TALENT_REVIEW",
      toStage: "SHORTLISTED",
      applicationId: "app-1",
      candidateId: "cand-1",
      actorName: "Alex",
    });

    assert.ok(subject.includes("Jordan Lee"));
    assert.ok(subject.includes("Shortlisted"));
    assert.ok(text.includes("Talent review"));
    assert.ok(text.includes("/candidates/cand-1/applications/app-1"));
  });

  it("builds interview analyzed alert", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    const { subject, text } = buildInterviewAnalyzedEmail({
      candidateName: "Jordan Lee",
      jobTitle: "Backend Engineer",
      interviewTitle: "Technical screen",
      hireConfidence: 0.82,
      recommendation: "yes",
      applicationId: "app-1",
      candidateId: "cand-1",
    });

    assert.ok(subject.includes("Interview analyzed"));
    assert.ok(text.includes("82%"));
    assert.ok(text.includes("Technical screen"));
  });
});

describe("Email notification config", () => {
  it("defaults to log provider", () => {
    delete process.env.EMAIL_PROVIDER;
    assert.equal(resolveEmailProviderId(), "log");
  });

  it("notifications enabled by default", () => {
    delete process.env.NOTIFICATIONS_ENABLED;
    assert.equal(notificationsEnabled(), true);
  });
});
