import type { LlmChatProvider } from "@/lib/llm/types";

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
};

export function createAnthropicChatProvider(config: {
  apiKey: string;
  chatModel: string;
}): LlmChatProvider {
  return {
    id: "anthropic",
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
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": config.apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: config.chatModel,
            max_tokens: 4096,
            temperature: 0.2,
            system: `${system}\n\nRespond with valid JSON only.`,
            messages: [{ role: "user", content: user }],
          }),
        });

        if (!res.ok) return fallback;

        const data = (await res.json()) as AnthropicResponse;
        const text = data.content?.find((c) => c.type === "text")?.text;
        if (!text) return fallback;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch?.[0] ?? text;
        return JSON.parse(jsonText) as T;
      } catch {
        return fallback;
      }
    },
  };
}
