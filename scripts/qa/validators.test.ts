import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createCandidateSchema } from "../../src/lib/validators/candidate";
import { createJobSchema } from "../../src/lib/validators/job";
import {
  configuredSuperAdminEmail,
  isReservedSuperAdminEmail,
  organizationFilter,
} from "../../src/lib/auth/platform-admin";
import type { AuthContext } from "../../src/lib/auth/types";

describe("Validators", () => {
  it("rejects short resume on candidate create", () => {
    const parsed = createCandidateSchema.safeParse({
      name: "Test",
      resumeText: "too short",
    });
    assert.equal(parsed.success, false);
  });

  it("accepts valid candidate payload", () => {
    const parsed = createCandidateSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      resumeText: "Twenty characters minimum for resume body text here.",
    });
    assert.equal(parsed.success, true);
  });

  it("requires job title", () => {
    const parsed = createJobSchema.safeParse({
      title: "",
      description: "Role description",
    });
    assert.equal(parsed.success, false);
  });
});

describe("Platform admin helpers", () => {
  it("organizationFilter removes org scope for platform admin", () => {
    const ctx = {
      userId: "u1",
      organizationId: "org1",
      memberId: "m1",
      roleId: "r1",
      roleCode: "PLATFORM_SUPER_ADMIN",
      userEmail: "admin@test.com",
      userName: "Admin",
      isPlatformAdmin: true,
    } satisfies AuthContext;
    assert.deepEqual(organizationFilter(ctx), {});
  });

  it("isReservedSuperAdminEmail respects SUPER_ADMIN_EMAIL env", () => {
    const prev = process.env.SUPER_ADMIN_EMAIL;
    process.env.SUPER_ADMIN_EMAIL = "ops@recruitimate.test";
    assert.equal(isReservedSuperAdminEmail("ops@recruitimate.test"), true);
    assert.equal(isReservedSuperAdminEmail("other@test.com"), false);
    if (prev === undefined) delete process.env.SUPER_ADMIN_EMAIL;
    else process.env.SUPER_ADMIN_EMAIL = prev;
    void configuredSuperAdminEmail();
  });
});
