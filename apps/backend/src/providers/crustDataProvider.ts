import Bottleneck from "bottleneck";
import { z } from "zod";
import type {
  CandidateProfile,
  CandidateProvider,
  FilterSet,
  Seniority,
} from "./types.js";
import { getCachedProfiles, cacheProfiles } from "../lib/cache.js";

const API_URL = "https://api.crustdata.com/person/search";
const API_VERSION = "2025-11-01";

const limiter = new Bottleneck({
  reservoir: 30,
  reservoirRefreshAmount: 30,
  reservoirRefreshInterval: 60_000,
  maxConcurrent: 2,
});

class ProviderError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "ProviderError";
  }
}

// CrustData seniority → internal seniority mapping
function mapCrustSeniority(level: string): Seniority {
  const l = (level || "").toLowerCase();
  if (l.includes("intern") || l.includes("entry")) return "junior";
  if (l.includes("associate") || l.includes("mid")) return "mid";
  if (l.includes("senior")) return "senior";
  if (l.includes("lead") || l.includes("staff") || l.includes("principal"))
    return "lead";
  if (l.includes("director") || l.includes("vp") || l.includes("cxo"))
    return "director";
  if (l.includes("junior")) return "junior";
  return "mid";
}

// Internal seniority label for CrustData filter
function seniorityToLabel(s: Seniority): string {
  switch (s) {
    case "junior":
      return "Entry";
    case "mid":
      return "Mid";
    case "senior":
      return "Senior";
    case "lead":
      return "Lead";
    case "director":
      return "Director";
  }
}

// Build request body from FilterSet per spec §5.5
function buildRequestBody(filters: FilterSet, limit: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic condition building for CrustData API
  const conditions: any[] = [];

  if (filters.titles.length > 0) {
    conditions.push({
      field: "experience.employment_details.current.title",
      type: "|",
      value: filters.titles.join(" "),
    });
  }
  if (filters.skills.length > 0) {
    conditions.push({
      field: "skills.professional_network_skills",
      type: "in",
      value: filters.skills,
    });
  }
  if (filters.seniority.length > 0) {
    conditions.push({
      field: "experience.employment_details.current.seniority_level",
      type: "in",
      value: filters.seniority.map(seniorityToLabel),
    });
  }
  if (filters.locations.length > 0) {
    conditions.push({
      field: "basic_profile.location.full_location",
      type: "|",
      value: filters.locations.join(" "),
    });
  }
  if (filters.minYears !== null) {
    conditions.push({
      field: "years_of_experience",
      type: ">=",
      value: filters.minYears,
    });
  }
  if (filters.maxYears !== null) {
    conditions.push({
      field: "years_of_experience",
      type: "<=",
      value: filters.maxYears,
    });
  }

  return {
    filters:
      conditions.length > 0
        ? { op: "and", conditions }
        : { op: "and", conditions: [] },
    limit,
    preview: false,
  };
}

// Response profile schema — permissive with passthrough
const CrustProfileSchema = z
  .object({
    basic_profile: z
      .object({
        name: z.string().optional(),
        headline: z.string().optional(),
        summary: z.string().optional(),
        location: z
          .object({ full_location: z.string().optional() })
          .optional(),
        linkedin_profile_url: z.string().nullable().optional(),
      })
      .passthrough()
      .optional(),
    experience: z
      .object({
        employment_details: z
          .object({
            current: z
              .object({
                title: z.string().optional(),
                company_name: z.string().optional(),
                seniority_level: z.string().optional(),
                industry: z.string().optional(),
              })
              .passthrough()
              .optional(),
            past: z.array(z.object({
              title: z.string().optional(),
              company_name: z.string().optional(),
              start_date: z.string().optional(),
              end_date: z.string().optional(),
            }).passthrough()).optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    education: z
      .object({
        schools: z.array(z.object({
          name: z.string().optional(),
          degree: z.string().optional(),
          end_year: z.number().optional(),
        }).passthrough()).optional(),
      })
      .passthrough()
      .optional(),
    skills: z
      .object({
        professional_network_skills: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    years_of_experience: z.number().optional(),
  })
  .passthrough();

function mapProfile(raw: z.infer<typeof CrustProfileSchema>, index: number): CandidateProfile {
  const bp = raw.basic_profile;
  const exp = raw.experience?.employment_details;
  const current = exp?.current;
  const pastRaw = exp?.past || [];
  const eduRaw = raw.education?.schools || [];
  const skillsRaw = raw.skills?.professional_network_skills || [];

  return {
    id: `crustdata-${index}-${Date.now()}`,
    name: bp?.name || "Unknown",
    headline: bp?.headline || "",
    location: bp?.location?.full_location || "",
    linkedinUrl: bp?.linkedin_profile_url || null,
    summary: bp?.summary || "",
    currentTitle: current?.title || "",
    currentCompany: current?.company_name || "",
    seniority: mapCrustSeniority(current?.seniority_level || ""),
    yearsOfExperience: raw.years_of_experience || 0,
    skills: skillsRaw,
    pastRoles: pastRaw.map((r) => ({
      title: r.title || "",
      company: r.company_name || "",
      years: estimateYears(r.start_date, r.end_date),
    })),
    education: eduRaw.map((e) => ({
      school: e.name || "",
      degree: e.degree || "",
      year: e.end_year || 0,
    })),
    source: "crustdata" as const,
  };
}

function estimateYears(start?: string, end?: string): number {
  if (!start) return 1;
  const s = new Date(start).getFullYear();
  const e = end ? new Date(end).getFullYear() : new Date().getFullYear();
  return Math.max(1, e - s);
}

export class CrustDataProvider implements CandidateProvider {
  readonly mode = "live" as const;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(filters: FilterSet, limit = 25): Promise<CandidateProfile[]> {
    // Check cache first (§5.6)
    const cached = await getCachedProfiles(filters);
    if (cached) {
      console.log("[crustdata] cache hit");
      return cached.map((p, i) => mapProfile(CrustProfileSchema.parse(p), i));
    }

    const body = buildRequestBody(filters, limit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CrustData response shape is dynamic
    let responseData: any;

    // Retry with backoff
    const delays = [2000, 4000, 8000];
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        responseData = await limiter.schedule(() => this.callApi(body));
        lastError = null;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (
          lastError.message.includes("429") &&
          attempt < 3
        ) {
          console.log(
            `[crustdata] rate limited, retry in ${delays[attempt]}ms`
          );
          await new Promise((r) => setTimeout(r, delays[attempt]));
        } else {
          break;
        }
      }
    }

    if (lastError) {
      throw new ProviderError("rate_limited", lastError.message);
    }

    const profiles = responseData?.profiles || [];
    const totalCount = responseData?.total_count || profiles.length;

    // Cache the response
    await cacheProfiles(filters, profiles, totalCount);

    return profiles.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw CrustData profile
      (p: any, i: number) => mapProfile(CrustProfileSchema.parse(p), i)
    );
  }

  private async callApi(body: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "x-api-version": API_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`CrustData API ${res.status}: ${text}`);
    }

    return res.json();
  }
}
