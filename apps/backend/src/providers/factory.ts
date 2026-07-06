import type { CandidateProvider } from "./types.js";
import { MockProvider } from "./mockProvider.js";
import { CrustDataProvider } from "./crustDataProvider.js";

export function getProvider(): CandidateProvider {
  const key = process.env.CRUSTDATA_API_KEY?.trim();
  return key ? new CrustDataProvider(key) : new MockProvider();
}
