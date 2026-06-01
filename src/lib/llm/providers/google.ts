import type { LlmChatProvider } from "@/lib/llm/types";

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

export function createGoogleChatProvider(config: {
  apiKey: string;
  chatModel: string;
}): LlmChatProvider {
  return {
    id: "google",
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
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.chatModel)}:generateContent?key=${encodeURIComponent(config.apiKey)}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `${system}\n\nRespond with valid JSON only.` }] },
            contents: [{ role: "user", parts: [{ text: user }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          console.error(
            JSON.stringify({
              type: "llm_error",
              provider: "google",
              model: config.chatModel,
              status: res.status,
              body: errBody.slice(0, 500),
            })
          );
          return fallback;
        }

        const data = (await res.json()) as GeminiResponse;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return fallback;

        return JSON.parse(text) as T;
      } catch {
        return fallback;
      }
    },
  };
}
