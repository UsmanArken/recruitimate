import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { organizationFilter } from "../../src/lib/auth/platform-admin";
import {
  billingWebhookSecret,
  isBillingWebhookAuthorized,
} from "../../src/lib/services/billing.service";

describe("organizationFilter impersonation", () => {
  const baseCtx = {
    userId: "u1",
    organizationId: "platform-org",
    memberId: "m1",
    roleId: "r1",
    roleCode: "PLATFORM_SUPER_ADMIN",
    userEmail: "admin@test.io",
    userName: "Admin",
    isPlatformAdmin: true,
  };

  it("scopes platform admin to acting tenant when impersonating", () => {
    assert.deepEqual(
      organizationFilter({ ...baseCtx, actingOrganizationId: "tenant-abc" }),
      { organizationId: "tenant-abc" }
    );
  });

  it("returns empty filter for platform admin without impersonation", () => {
    assert.deepEqual(organizationFilter({ ...baseCtx, actingOrganizationId: null }), {});
  });
});

describe("billing webhook auth", () => {
  it("matches configured webhook secret", () => {
    const prevSecret = process.env.BILLING_WEBHOOK_SECRET;
    process.env.BILLING_WEBHOOK_SECRET = "test-secret";

    assert.equal(billingWebhookSecret(), "test-secret");
    assert.equal(isBillingWebhookAuthorized(null), false);
    assert.equal(isBillingWebhookAuthorized("wrong"), false);
    assert.equal(isBillingWebhookAuthorized("test-secret"), true);

    if (prevSecret === undefined) delete process.env.BILLING_WEBHOOK_SECRET;
    else process.env.BILLING_WEBHOOK_SECRET = prevSecret;
  });

  it("allows unauthenticated webhooks in dev when secret is unset", () => {
    const prevSecret = process.env.BILLING_WEBHOOK_SECRET;
    delete process.env.BILLING_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === "production") {
      assert.equal(isBillingWebhookAuthorized(null), false);
    } else {
      assert.equal(isBillingWebhookAuthorized(null), true);
    }

    if (prevSecret === undefined) delete process.env.BILLING_WEBHOOK_SECRET;
    else process.env.BILLING_WEBHOOK_SECRET = prevSecret;
  });
});
