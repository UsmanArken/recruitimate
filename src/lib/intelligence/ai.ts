/**
 * Backward-compatible re-exports. Prefer `@/lib/llm` for new code.
 */
export {
  chatJson,
  transcribeAudio,
  getActiveLlmProviderId,
  getLlmConfig,
  hasLlmProvider,
  hasOpenAI,
  llmSetupHint,
} from "@/lib/llm";

import OpenAI from "openai";
import { getLlmConfig } from "@/lib/llm";

/** @deprecated Use getChatProvider() from the LLM registry. */
export function getOpenAIClient(): OpenAI | null {
  const key = getLlmConfig().openai.apiKey;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}
