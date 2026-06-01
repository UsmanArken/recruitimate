import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  LLM_PROVIDER: z.enum(["openai", "anthropic", "google", "auto"]).optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  TRANSCRIPTION_PROVIDER: z.enum(["openai", "none"]).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "production") {
      console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
      throw new Error("Invalid environment configuration");
    }
    return {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      LLM_PROVIDER: process.env.LLM_PROVIDER as
        | "openai"
        | "anthropic"
        | "google"
        | "auto"
        | undefined,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      TRANSCRIPTION_PROVIDER: process.env.TRANSCRIPTION_PROVIDER as "openai" | "none" | undefined,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test" | undefined,
    };
  }
  return parsed.data;
}

export const env = loadEnv();

export { hasLlmProvider, hasOpenAI, llmSetupHint } from "@/lib/llm/config";
