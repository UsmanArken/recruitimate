import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  defaultOutreachTemplate,
  extractTemplateVariables,
  renderOutreachTemplate,
} from "../../src/lib/intelligence/outreach/template-engine";

describe("Outreach template engine", () => {
  it("renders merge variables in subject and body", () => {
    const result = renderOutreachTemplate(
      "{{jobTitle}} at {{companyName}}",
      "Hi {{candidateName}}, reach out from {{recruiterName}}.",
      {
        candidateName: "Alex Chen",
        jobTitle: "Backend Engineer",
        recruiterName: "Jordan",
        companyName: "Recruitimate",
      }
    );

    assert.equal(result.subject, "Backend Engineer at Recruitimate");
    assert.ok(result.bodyText.includes("Alex Chen"));
    assert.ok(result.variablesUsed.includes("candidateName"));
  });

  it("extracts variables from template text", () => {
    const vars = extractTemplateVariables("Hello {{candidateName}} — {{jobTitle}}");
    assert.deepEqual(vars.sort(), ["candidateName", "jobTitle"]);
  });

  it("provides a sensible default template", () => {
    const defaults = defaultOutreachTemplate();
    assert.ok(defaults.bodyMarkdown.includes("{{candidateName}}"));
    assert.ok(defaults.subject.includes("{{jobTitle}}"));
  });
});
