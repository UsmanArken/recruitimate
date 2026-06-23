import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionStatus,
  computeCampaignStats,
  nextStatusForEvent,
} from "../../src/lib/intelligence/outreach/tracking-engine";

describe("Outreach response tracking", () => {
  it("computes campaign funnel stats", () => {
    const stats = computeCampaignStats([
      { status: "DRAFT" },
      { status: "GENERATED" },
      { status: "SENT" },
      { status: "OPENED" },
      { status: "REPLIED" },
    ]);

    assert.equal(stats.total, 5);
    assert.equal(stats.sent, 1);
    assert.equal(stats.opened, 1);
    assert.equal(stats.replied, 1);
    assert.equal(stats.openRate, 2 / 3);
    assert.equal(stats.replyRate, 1 / 3);
  });

  it("advances message status on webhook events", () => {
    assert.equal(nextStatusForEvent("SENT", "opened"), "OPENED");
    assert.equal(nextStatusForEvent("OPENED", "replied"), "REPLIED");
    assert.equal(nextStatusForEvent("SENT", "bounced"), "BOUNCED");
  });

  it("allows forward status transitions", () => {
    assert.equal(canTransitionStatus("DRAFT", "GENERATED"), true);
    assert.equal(canTransitionStatus("SENT", "OPENED"), true);
    assert.equal(canTransitionStatus("REPLIED", "OPENED"), false);
  });
});
