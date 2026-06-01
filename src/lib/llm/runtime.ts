import { badRequest } from "@/lib/api/errors";
import { getLlmConfig } from "@/lib/llm/config";
import { getChatProvider, getTranscriptionProvider } from "@/lib/llm/registry";

export function getActiveLlmProviderId() {
  return getLlmConfig().resolvedProvider;
}

export async function chatJson<T>(
  system: string,
  user: string,
  fallback: T
): Promise<T> {
  const provider = getChatProvider();
  if (!provider) return fallback;
  const result = await provider.chatJson({ system, user, fallback });
  const usedFallback =
    typeof fallback === "object" &&
    fallback !== null &&
    typeof result === "object" &&
    result !== null &&
    "explanation" in fallback &&
    "explanation" in result &&
    (result as { explanation?: string }).explanation ===
      (fallback as { explanation?: string }).explanation;
  if (usedFallback && process.env.NODE_ENV !== "production") {
    console.warn(
      JSON.stringify({
        type: "llm_fallback",
        provider: provider.id,
        hint: "LLM call returned heuristic fallback — check terminal for llm_error logs",
      })
    );
  }
  return result;
}

export async function transcribeAudio(input: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<string> {
  const provider = getTranscriptionProvider();
  if (!provider) {
    throw badRequest(
      "Transcription requires OPENAI_API_KEY and TRANSCRIPTION_PROVIDER=openai",
      "NO_TRANSCRIPTION_PROVIDER"
    );
  }
  return provider.transcribe(input);
}
