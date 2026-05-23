import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getResumeExtension,
  isAllowedResumeFile,
  normalizeResumeText,
  RESUME_UPLOAD,
} from "../../src/lib/resume/extract-text";

describe("Resume extract helpers", () => {
  it("detects allowed extensions", () => {
    assert.equal(isAllowedResumeFile("cv.pdf"), true);
    assert.equal(isAllowedResumeFile("cv.DOCX"), true);
    assert.equal(isAllowedResumeFile("cv.doc"), false);
    assert.equal(getResumeExtension("path/to/file.pdf"), ".pdf");
  });

  it("normalizes whitespace and caps length", () => {
    const raw = "  Hello   \n\n\n\n  World  ";
    const normalized = normalizeResumeText(raw);
    assert.equal(normalized, "Hello\n\nWorld");
    assert.ok(normalized.length <= RESUME_UPLOAD.maxTextLength);
  });
});
