import type { LaborMarketProviderId } from "./types";

export function resolveLaborMarketProviderId(): LaborMarketProviderId {
  const raw = process.env.LABOR_MARKET_PROVIDER?.trim().toLowerCase();
  if (raw === "http") return "http";
  return "mock";
}

export function laborMarketHttpConfig() {
  return {
    baseUrl: process.env.LABOR_MARKET_API_URL?.trim() ?? "",
    apiKey: process.env.LABOR_MARKET_API_KEY?.trim() ?? "",
    timeoutMs: Number(process.env.LABOR_MARKET_TIMEOUT_MS ?? 8000),
  };
}

export function isLaborMarketHttpConfigured(): boolean {
  const cfg = laborMarketHttpConfig();
  return Boolean(cfg.baseUrl);
}
