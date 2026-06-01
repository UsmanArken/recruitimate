import { jsonOk } from "@/lib/api/response";
import { runApiRoute } from "@/lib/api/run-api-route";
import { getLlmConfig, hasLlmProvider } from "@/lib/llm";

/** Dev helper: verify which LLM provider Recruitimate resolved from .env */
export async function GET(req: Request) {
  return runApiRoute(req, async () => {
    const cfg = getLlmConfig();
    return jsonOk({
      configured: hasLlmProvider(),
      preference: cfg.provider,
      resolvedProvider: cfg.resolvedProvider,
      models: {
        openai: cfg.openai.apiKey ? cfg.openai.chatModel : null,
        anthropic: cfg.anthropic.apiKey ? cfg.anthropic.chatModel : null,
        google: cfg.google.apiKey ? cfg.google.chatModel : null,
      },
      keysPresent: {
        openai: Boolean(cfg.openai.apiKey),
        anthropic: Boolean(cfg.anthropic.apiKey),
        google: Boolean(cfg.google.apiKey),
      },
    });
  });
}
