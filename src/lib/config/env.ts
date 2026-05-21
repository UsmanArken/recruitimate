import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
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
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test" | undefined,
    };
  }
  return parsed.data;
}

export const env = loadEnv();

export function hasOpenAI(): boolean {
  const key = env.OPENAI_API_KEY;
  return Boolean(key && key !== "sk-...");
}
