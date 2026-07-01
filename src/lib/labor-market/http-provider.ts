import { mockLaborMarketProvider } from "./mock-provider";
import { isLaborMarketHttpConfigured, laborMarketHttpConfig } from "./config";
import type {
  LaborMarketJobContext,
  LaborMarketProvider,
  LaborMarketSearchResult,
} from "./types";

/**
 * HTTP labor-market provider — calls an external API when configured.
 * Falls back to mock data if the request fails.
 */
export const httpLaborMarketProvider: LaborMarketProvider = {
  id: "http",

  async searchPassiveCandidates(context: LaborMarketJobContext): Promise<LaborMarketSearchResult> {
    if (!isLaborMarketHttpConfigured()) {
      const fallback = await mockLaborMarketProvider.searchPassiveCandidates(context);
      return {
        ...fallback,
        provider: "http",
        marketContext: {
          ...fallback.marketContext,
          explanation: `${fallback.marketContext.explanation} (HTTP provider not configured — mock fallback.)`,
        },
      };
    }

    const cfg = laborMarketHttpConfig();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      const res = await fetch(`${cfg.baseUrl.replace(/\/$/, "")}/passive-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
        },
        body: JSON.stringify({
          jobId: context.jobId,
          title: context.title,
          requirements: context.requirements,
          skills: context.skills,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`Labor market API ${res.status}`);

      const data = (await res.json()) as LaborMarketSearchResult;
      return { ...data, provider: "http" };
    } catch {
      const fallback = await mockLaborMarketProvider.searchPassiveCandidates(context);
      return {
        ...fallback,
        provider: "http",
        marketContext: {
          ...fallback.marketContext,
          explanation: `${fallback.marketContext.explanation} (External API unavailable — mock fallback.)`,
        },
      };
    } finally {
      clearTimeout(timer);
    }
  },
};
