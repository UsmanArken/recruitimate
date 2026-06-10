import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractNameFromResume,
  fileNameToCandidateName,
  resolveCandidateDisplayName,
} from "../../src/lib/resume/parse-contact";

describe("parse-contact", () => {
  it("strips folder path from file name fallback", () => {
    assert.equal(fileNameToCandidateName("Data/Umair Resume 1.pdf"), "Umair");
  });

  it("extracts person name from noisy single line", () => {
    const text = "Data/Umair Resume 1 p190030 Umair Azad\nSoftware Engineer";
    assert.equal(resolveCandidateDisplayName(text, "Data/Umair Resume 1.pdf"), "Umair Azad");
  });

  it("uses clean line when present", () => {
    const text = "Umair Azad\numair@example.com\nExperience";
    assert.equal(extractNameFromResume(text, "resume.pdf"), "Umair Azad");
  });
});
