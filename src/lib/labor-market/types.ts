export type LaborMarketProviderId = "mock" | "http";

export type LaborMarketJobContext = {
  jobId: string;
  title: string;
  requirements: string | null;
  skills: string[];
};

export type LaborMarketContext = {
  demandScore: number;
  talentPoolEstimate: number;
  scarceSkills: string[];
  averageOpenness: number;
  explanation: string;
};

export type PassiveLeadFromMarket = {
  externalRef: string;
  name: string;
  headline: string;
  location: string | null;
  skills: string[];
  opennessLikelihood: number;
  marketDemandScore: number;
  skillScarcity: number;
  matchScore: number;
  explanation: string;
};

export type LaborMarketSearchResult = {
  provider: LaborMarketProviderId;
  marketContext: LaborMarketContext;
  leads: PassiveLeadFromMarket[];
};

export interface LaborMarketProvider {
  id: LaborMarketProviderId;
  searchPassiveCandidates(context: LaborMarketJobContext): Promise<LaborMarketSearchResult>;
}
