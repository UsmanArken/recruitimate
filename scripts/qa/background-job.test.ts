import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { TranscribeInterviewPayload } from "../../src/lib/jobs/types";

describe("Background job types", () => {
  it("defines transcribe payload shape", () => {
    const payload: TranscribeInterviewPayload = {
      applicationId: "app-1",
      interviewId: "int-1",
    };
    assert.equal(payload.applicationId, "app-1");
    assert.equal(payload.interviewId, "int-1");
  });
});

describe("Job processor exports", () => {
  it("exposes dispatch and queue drain helpers", async () => {
    const mod = await import("../../src/lib/jobs/processor");
    assert.equal(typeof mod.dispatchJob, "function");
    assert.equal(typeof mod.processQueuedJobs, "function");
  });
});
