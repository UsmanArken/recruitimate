import OpenAI from "openai";
import type { LlmChatProvider, TranscriptionProvider } from "@/lib/llm/types";

export function createOpenAiChatProvider(config: {
  apiKey: string;
  chatModel: string;
}): LlmChatProvider {
  const client = new OpenAI({ apiKey: config.apiKey });

  return {
    id: "openai",
    async chatJson<T>({
      system,
      user,
      fallback,
    }: {
      system: string;
      user: string;
      fallback: T;
    }): Promise<T> {
      try {
        const response = await client.chat.completions.create({
          model: config.chatModel,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return fallback;
        return JSON.parse(content) as T;
      } catch {
        return fallback;
      }
    },
  };
}

export function createOpenAiTranscriptionProvider(apiKey: string): TranscriptionProvider {
  const client = new OpenAI({ apiKey });

  return {
    id: "openai",
    async transcribe({ buffer, fileName, mimeType }) {
      const file = new File([new Uint8Array(buffer)], fileName, { type: mimeType });
      const result = await client.audio.transcriptions.create({
        model: "whisper-1",
        file,
        response_format: "text",
      });
      return typeof result === "string" ? result : String(result);
    },
  };
}
