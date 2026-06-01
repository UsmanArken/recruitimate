export type LlmProviderId = "openai" | "anthropic" | "google";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type LlmChatProvider = {
  id: LlmProviderId;
  chatJson<T>(input: {
    system: string;
    user: string;
    fallback: T;
  }): Promise<T>;
};

export type TranscriptionProviderId = "openai";

export type TranscriptionProvider = {
  id: TranscriptionProviderId;
  transcribe(input: { buffer: Buffer; fileName: string; mimeType: string }): Promise<string>;
};
