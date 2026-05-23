import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createCandidateSchema } from "../../src/lib/validators/candidate";
import { createNoteSchema, parseTagsInput } from "../../src/lib/validators/note";
import { createJobSchema } from "../../src/lib/validators/job";
import {
  isReservedSuperAdminEmail,
  organizationFilter,
} from "../../src/lib/auth/platform-admin";

describe("Validators", () => {
  it("rejects short resume on candidate create", () => {
    const result = createCandidateSchema.safeParse({
      name: "Jane",
      jobId: "job-1",
      resumeText: "too short",
    });
    assert.equal(result.success, false);
  });

  it("accepts valid candidate payload", () => {
    const result = createCandidateSchema.safeParse({
      name: "Jane Doe",
      jobId: "clxyz123456789",
      resumeText: "x".repeat(25),
    });
    assert.equal(result.success, true);
  });

  it("requires open position on create", () => {
    const result = createCandidateSchema.safeParse({
      name: "Jane",
      resumeText: "x".repeat(25),
    });
    assert.equal(result.success, false);
  });

  it("requires job title", () => {
    const result = createJobSchema.safeParse({ title: "", description: "desc" });
    assert.equal(result.success, false);
  });

  it("accepts valid note with tags", () => {
    const result = createNoteSchema.safeParse({
      content: "Strong phone screen.",
      tags: ["phone-screen", "follow-up"],
    });
    assert.equal(result.success, true);
  });

  it("parses comma-separated tags", () => {
    assert.deepEqual(parseTagsInput("Phone Screen, follow-up, follow-up"), [
      "phone-screen",
      "follow-up",
    ]);
  });
});

describe("Platform admin helpers", () => {
  it("organizationFilter removes org scope for platform admin", () => {
    assert.deepEqual(
      organizationFilter({
        userId: "u1",
        organizationId: "org1",
        memberId: "m1",
        roleId: "r1",
        roleCode: "PLATFORM_SUPER_ADMIN",
        userEmail: "admin@test.io",
        userName: "Admin",
        isPlatformAdmin: true,
      }),
      {}
    );
  });

  it("isReservedSuperAdminEmail respects SUPER_ADMIN_EMAIL env", () => {
    const prev = process.env.SUPER_ADMIN_EMAIL;
    process.env.SUPER_ADMIN_EMAIL = "admin@test.io";
    assert.equal(isReservedSuperAdminEmail("admin@test.io"), true);
    assert.equal(isReservedSuperAdminEmail("other@test.io"), false);
    if (prev === undefined) delete process.env.SUPER_ADMIN_EMAIL;
    else process.env.SUPER_ADMIN_EMAIL = prev;
  });
});
