import { getLlmConfig } from "@/lib/llm/config";
import { createAnthropicChatProvider } from "@/lib/llm/providers/anthropic";
import { createGoogleChatProvider } from "@/lib/llm/providers/google";
import {
  createOpenAiChatProvider,
  createOpenAiTranscriptionProvider,
} from "@/lib/llm/providers/openai";
import type { LlmChatProvider, TranscriptionProvider } from "@/lib/llm/types";

let cachedProviderKey: string | null = null;
let chatProvider: LlmChatProvider | null = null;
let transcriptionProvider: TranscriptionProvider | null | undefined;

function providerCacheKey(cfg: ReturnType<typeof getLlmConfig>): string | null {
  const id = cfg.resolvedProvider;
  if (!id) return null;
  const slice = cfg[id].apiKey?.slice(-8) ?? "";
  return `${id}:${cfg[id].chatModel}:${slice}`;
}

export function getChatProvider(): LlmChatProvider | null {
  const cfg = getLlmConfig();
  const key = providerCacheKey(cfg);

  if (key && key === cachedProviderKey && chatProvider) {
    return chatProvider;
  }

  cachedProviderKey = key;
  chatProvider = null;

  const id = cfg.resolvedProvider;
  if (!id) return null;

  if (id === "openai" && cfg.openai.apiKey) {
    chatProvider = createOpenAiChatProvider({
      apiKey: cfg.openai.apiKey,
      chatModel: cfg.openai.chatModel,
    });
  } else if (id === "anthropic" && cfg.anthropic.apiKey) {
    chatProvider = createAnthropicChatProvider({
      apiKey: cfg.anthropic.apiKey,
      chatModel: cfg.anthropic.chatModel,
    });
  } else if (id === "google" && cfg.google.apiKey) {
    chatProvider = createGoogleChatProvider({
      apiKey: cfg.google.apiKey,
      chatModel: cfg.google.chatModel,
    });
  }

  return chatProvider;
}

export function getTranscriptionProvider(): TranscriptionProvider | null {
  if (transcriptionProvider !== undefined) return transcriptionProvider;

  const cfg = getLlmConfig();
  if (cfg.transcription.provider !== "openai" || !cfg.transcription.openaiApiKey) {
    transcriptionProvider = null;
    return transcriptionProvider;
  }

  transcriptionProvider = createOpenAiTranscriptionProvider(cfg.transcription.openaiApiKey);
  return transcriptionProvider;
}

/** Reset cached providers (tests). */
export function resetLlmProviders(): void {
  cachedProviderKey = null;
  chatProvider = null;
  transcriptionProvider = undefined;
}
