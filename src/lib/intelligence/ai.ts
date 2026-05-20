import OpenAI from "openai";

export function getOpenAIClient(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === "sk-...") return null;
  return new OpenAI({ apiKey: key });
}

export async function chatJson<T>(
  system: string,
  user: string,
  fallback: T
): Promise<T> {
  const client = getOpenAIClient();
  if (!client) return fallback;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
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
}
