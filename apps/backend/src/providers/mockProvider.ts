import { supabase } from "../lib/supabase.js";
import { estimateYears } from "../lib/dates.js";
import type {
  CandidateProfile,
  CandidateProvider,
  FilterSet,
  Seniority,
} from "./types.js";

// Role family keyword mapping for title matching
const ROLE_FAMILY_KEYWORDS: Record<string, string[]> = {
  frontend: ["frontend", "front-end", "front end", "ui engineer", "react", "vue", "angular"],
  backend: ["backend", "back-end", "back end", "server", "api", "node", "java", "python", "go"],
  fullstack: ["fullstack", "full-stack", "full stack"],
  "data-science": ["data scien", "data analyst", "analytics", "statistician"],
  "ml-engineering": ["machine learning", "ml engineer", "ai engineer", "deep learning", "nlp"],
  "devops-sre": ["devops", "sre", "site reliability", "platform engineer", "infrastructure"],
  mobile: ["mobile", "ios", "android", "react native", "flutter"],
  "product-management": ["product manager", "product management", "pm", "product lead"],
  design: ["design", "ux", "ui/ux", "product design"],
  qa: ["qa", "quality", "test engineer", "sdet", "automation engineer"],
  sales: ["sales", "account executive", "business development", "ae", "bdr", "sdr", "sales manager"],
  marketing: ["marketing", "seo", "growth", "brand", "social media", "content", "marketing manager"],
  legal: ["legal", "lawyer", "counsel", "compliance", "attorney", "contract"],
  cybersecurity: ["cybersecurity", "security", "infosec", "penetration", "soc", "firewall", "cryptography"],
  hr: ["hr", "human resources", "recruiter", "talent acquisition", "people ops", "people operations"],
};

function matchRoleFamily(titles: string[], skills: string[]): string {
  const combined = [...titles, ...skills].map((s) => s.toLowerCase()).join(" ");
  for (const [family, keywords] of Object.entries(ROLE_FAMILY_KEYWORDS)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      return family;
    }
  }
  return "fullstack"; // reasonable default
}

function profileJsonToCandidate(
  id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- raw JSONB from Supabase
  profile: any
): CandidateProfile {
  const bp = profile.basic_profile || {};
  const exp = profile.experience?.employment_details || {};
  const current = exp.current || {};
  const pastRaw = exp.past || [];
  const eduRaw = profile.education?.schools || [];
  const skillsRaw = profile.skills?.professional_network_skills || [];

  return {
    id,
    name: bp.name || "Unknown",
    headline: bp.headline || "",
    location: bp.location?.full_location || "",
    linkedinUrl: bp.linkedin_profile_url || null,
    summary: bp.summary || "",
    currentTitle: current.title || "",
    currentCompany: current.company_name || "",
    seniority: mapSeniority(current.seniority_level || ""),
    yearsOfExperience: profile.years_of_experience || 0,
    skills: skillsRaw,
    pastRoles: pastRaw.map(
      (r: { title?: string; company_name?: string; start_date?: string; end_date?: string }) => ({
        title: r.title || "",
        company: r.company_name || "",
        years: estimateYears(r.start_date, r.end_date),
      })
    ),
    education: eduRaw.map(
      (e: { name?: string; degree?: string; end_year?: number }) => ({
        school: e.name || "",
        degree: e.degree || "",
        year: e.end_year || 0,
      })
    ),
    source: "mock" as const,
  };
}

function mapSeniority(level: string): Seniority {
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



export class MockProvider implements CandidateProvider {
  readonly mode = "mock" as const;

  async search(filters: FilterSet, limit = 25): Promise<CandidateProfile[]> {
    const allResults = new Map<string, CandidateProfile>();

    // Pass 1 — strict: skills overlap + seniority + location + years
    const pass1 = await this.queryPass1(filters, limit);
    for (const row of pass1) {
      allResults.set(row.id, profileJsonToCandidate(row.id, row.profile));
    }

    // Pass 2 — relaxed: drop location + years
    if (allResults.size < 8) {
      const pass2 = await this.queryPass2(filters, limit);
      for (const row of pass2) {
        if (!allResults.has(row.id)) {
          allResults.set(row.id, profileJsonToCandidate(row.id, row.profile));
        }
      }
    }

    // Pass 3 — loose: skills only
    if (allResults.size < 8) {
      const pass3 = await this.queryPass3(filters, limit);
      for (const row of pass3) {
        if (!allResults.has(row.id)) {
          allResults.set(row.id, profileJsonToCandidate(row.id, row.profile));
        }
      }
    }

    // Pass 4 — floor: role_family match
    if (allResults.size < 8) {
      const pass4 = await this.queryPass4(filters, limit);
      for (const row of pass4) {
        if (!allResults.has(row.id)) {
          allResults.set(row.id, profileJsonToCandidate(row.id, row.profile));
        }
      }
    }

    return Array.from(allResults.values()).slice(0, limit);
  }

  private async queryPass1(
    filters: FilterSet,
    limit: number
  ): Promise<{ id: string; profile: Record<string, unknown> }[]> {
    let query = supabase
      .from("mock_profiles")
      .select("id, profile")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters.skills.length > 0) {
      query = query.overlaps("skills", filters.skills);
    }
    if (filters.seniority.length > 0) {
      query = query.in("seniority", filters.seniority);
    }
    if (filters.locations.length > 0) {
      const cities = filters.locations.map((l) =>
        l.toLowerCase().includes("remote") ? "Remote" : l.split(",")[0].trim()
      );
      query = query.in("city", cities);
    }
    if (filters.minYears !== null) {
      query = query.gte("years_of_experience", filters.minYears);
    }
    if (filters.maxYears !== null) {
      query = query.lte("years_of_experience", filters.maxYears);
    }

    const { data } = await query;
    return (data || []) as { id: string; profile: Record<string, unknown> }[];
  }

  private async queryPass2(
    filters: FilterSet,
    limit: number
  ): Promise<{ id: string; profile: Record<string, unknown> }[]> {
    let query = supabase
      .from("mock_profiles")
      .select("id, profile")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters.skills.length > 0) {
      query = query.overlaps("skills", filters.skills);
    }
    if (filters.seniority.length > 0) {
      query = query.in("seniority", filters.seniority);
    }

    const { data } = await query;
    return (data || []) as { id: string; profile: Record<string, unknown> }[];
  }

  private async queryPass3(
    filters: FilterSet,
    limit: number
  ): Promise<{ id: string; profile: Record<string, unknown> }[]> {
    let query = supabase
      .from("mock_profiles")
      .select("id, profile")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters.skills.length > 0) {
      query = query.overlaps("skills", filters.skills);
    }

    const { data } = await query;
    return (data || []) as { id: string; profile: Record<string, unknown> }[];
  }

  private async queryPass4(
    filters: FilterSet,
    limit: number
  ): Promise<{ id: string; profile: Record<string, unknown> }[]> {
    const family = matchRoleFamily(filters.titles, filters.skills);
    const { data } = await supabase
      .from("mock_profiles")
      .select("id, profile")
      .eq("role_family", family)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data || []) as { id: string; profile: Record<string, unknown> }[];
  }
}
