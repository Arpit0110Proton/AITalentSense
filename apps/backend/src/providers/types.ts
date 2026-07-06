export type Seniority = "junior" | "mid" | "senior" | "lead" | "director";

export interface FilterSet {
  titles: string[];
  skills: string[];
  seniority: Seniority[];
  locations: string[];
  industries: string[];
  minYears: number | null;
  maxYears: number | null;
}

export interface CandidateProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  linkedinUrl: string | null;
  summary: string;
  currentTitle: string;
  currentCompany: string;
  seniority: Seniority;
  yearsOfExperience: number;
  skills: string[];
  pastRoles: { title: string; company: string; years: number }[];
  education: { school: string; degree: string; year: number }[];
  source: "mock" | "crustdata";
}

export interface ScoredCandidate extends CandidateProfile {
  score: number;
  subscores: {
    skills: number;
    seniority: number;
    industry: number;
    location: number;
  };
  blurb: string;
  scoredBy: "ai" | "heuristic";
}

export interface CandidateProvider {
  readonly mode: "mock" | "live";
  search(filters: FilterSet, limit: number): Promise<CandidateProfile[]>;
}
