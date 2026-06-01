import { z } from "zod";
import type { LlmProviderId, TranscriptionProviderId } from "@/lib/llm/types";

const llmProviderSchema = z.enum(["openai", "anthropic", "google", "auto"]);

const PLACEHOLDER_MARKERS = [
  "sk-...",
  "your-",
  "change-me",
  "api-key-here",
  "insert-",
  "xxx",
];

function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true;
  const trimmed = key.trim().replace(/^['"]|['"]$/g, "");
  if (!trimmed) return true;
  if (trimmed === "sk-..." || trimmed.endsWith("...")) return true;
  const lower = trimmed.toLowerCase();
  return PLACEHOLDER_MARKERS.some((m) => lower.includes(m));
}

export type LlmRuntimeConfig = {
  provider: LlmProviderId | "auto";
  resolvedProvider: LlmProviderId | null;
  openai: { apiKey?: string; chatModel: string };
  anthropic: { apiKey?: string; chatModel: string };
  google: { apiKey?: string; chatModel: string };
  transcription: { provider: TranscriptionProviderId | "none"; openaiApiKey?: string };
};

export function readLlmConfig(): LlmRuntimeConfig {
  const provider = llmProviderSchema.catch("auto").parse(process.env.LLM_PROVIDER ?? "auto");

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const googleKey =
    process.env.GOOGLE_API_KEY ??
    process.env.GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const openai = {
    apiKey: isPlaceholderKey(openaiKey) ? undefined : openaiKey!.trim(),
    chatModel: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
  };
  const anthropic = {
    apiKey: isPlaceholderKey(anthropicKey) ? undefined : anthropicKey!.trim(),
    chatModel: process.env.ANTHROPIC_CHAT_MODEL?.trim() || "claude-3-5-haiku-latest",
  };
  const google = {
    apiKey: isPlaceholderKey(googleKey) ? undefined : googleKey!.trim(),
    chatModel: process.env.GOOGLE_CHAT_MODEL?.trim() || "gemini-1.5-flash",
  };

  const transcriptionProvider =
    process.env.TRANSCRIPTION_PROVIDER === "none" ? "none" : ("openai" as const);

  const resolvedProvider = resolveProvider(provider, { openai, anthropic, google });

  return {
    provider,
    resolvedProvider,
    openai,
    anthropic,
    google,
    transcription: {
      provider: transcriptionProvider,
      openaiApiKey: openai.apiKey,
    },
  };
}

function resolveProvider(
  preference: LlmRuntimeConfig["provider"],
  keys: {
    openai: { apiKey?: string };
    anthropic: { apiKey?: string };
    google: { apiKey?: string };
  }
): LlmProviderId | null {
  const order: LlmProviderId[] =
    preference === "auto"
      ? ["openai", "anthropic", "google"]
      : [preference];

  for (const id of order) {
    if (keys[id].apiKey) return id;
  }
  return null;
}

export function getLlmConfig(): LlmRuntimeConfig {
  return readLlmConfig();
}

export function hasLlmProvider(): boolean {
  return getLlmConfig().resolvedProvider !== null;
}

export function llmSetupHint(): string {
  return "Set LLM_PROVIDER and one of OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY.";
}

/** @deprecated Use hasLlmProvider */
export function hasOpenAI(): boolean {
  const cfg = getLlmConfig();
  return Boolean(cfg.openai.apiKey);
}
