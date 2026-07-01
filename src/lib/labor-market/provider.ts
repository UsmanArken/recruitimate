import { resolveLaborMarketProviderId } from "./config";
import { httpLaborMarketProvider } from "./http-provider";
import { mockLaborMarketProvider } from "./mock-provider";
import type { LaborMarketProvider } from "./types";

let cached: LaborMarketProvider | null = null;

export function getLaborMarketProvider(): LaborMarketProvider {
  if (cached) return cached;
  const id = resolveLaborMarketProviderId();
  cached = id === "http" ? httpLaborMarketProvider : mockLaborMarketProvider;
  return cached;
}

export function resetLaborMarketProviderCache() {
  cached = null;
}
