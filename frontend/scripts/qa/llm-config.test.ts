import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readLlmConfig } from "../../src/lib/llm/config";
import { resetLlmProviders } from "../../src/lib/llm/registry";

const envBackup = { ...process.env };

describe("llm config", () => {
  beforeEach(() => {
    resetLlmProviders();
  });

  afterEach(() => {
    process.env = { ...envBackup };
    resetLlmProviders();
  });

  it("auto resolves openai when only OpenAI key is set", () => {
    process.env.LLM_PROVIDER = "auto";
    process.env.OPENAI_API_KEY = "sk-test-key";
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const cfg = readLlmConfig();
    assert.equal(cfg.resolvedProvider, "openai");
  });

  it("respects forced anthropic provider when key present", () => {
    process.env.LLM_PROVIDER = "anthropic";
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
    delete process.env.OPENAI_API_KEY;

    const cfg = readLlmConfig();
    assert.equal(cfg.resolvedProvider, "anthropic");
  });

  it("returns null when no keys configured", () => {
    process.env.LLM_PROVIDER = "auto";
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    const cfg = readLlmConfig();
    assert.equal(cfg.resolvedProvider, null);
  });
});
