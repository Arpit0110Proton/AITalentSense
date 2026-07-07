// lib/api.ts — typed fetch wrappers to backend

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Shared types mirroring backend (kept in sync manually — no monorepo type sharing per spec §2)
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
  subscores: { skills: number; seniority: number; industry: number; location: number };
  blurb: string;
  scoredBy: "ai" | "heuristic";
}

// --- Fetch helpers ---

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message || `API error ${res.status}`);
  }
  return res.json();
}

export function checkHealth() {
  return apiFetch<{ status: string; mode: "mock" | "live"; uptime: number }>(
    "/health"
  );
}

export function parseJd(jdText: string) {
  return apiFetch<{ filters: FilterSet }>("/api/parse-jd", {
    method: "POST",
    body: JSON.stringify({ jdText }),
  });
}

export function searchCandidates(jdText: string, filters: FilterSet, limit = 25) {
  return apiFetch<{
    searchId: string;
    mode: "mock" | "live";
    candidates: CandidateProfile[];
  }>("/api/search", {
    method: "POST",
    body: JSON.stringify({ jdText, filters, limit }),
  });
}

export function scoreBatch(
  searchId: string,
  filters: FilterSet,
  candidates: CandidateProfile[]
) {
  return apiFetch<{ scored: ScoredCandidate[] }>("/api/score", {
    method: "POST",
    body: JSON.stringify({ searchId, filters, candidates }),
  });
}

export function getHistory(limit = 20) {
  return apiFetch<{
    searches: {
      id: string;
      jdPreview: string;
      filters: FilterSet;
      mode: "mock" | "live";
      candidateCount: number;
      createdAt: string;
      jobTitle: string | null;
    }[];
  }>(`/api/history?limit=${limit}`);
}

export function getSearch(id: string) {
  return apiFetch<{
    id: string;
    jd_text: string;
    filters: FilterSet;
    mode: "mock" | "live";
    results: ScoredCandidate[];
    candidate_count: number;
    created_at: string;
  }>(`/api/search/${id}`);
}

export function createShortlist(
  name: string,
  searchId: string,
  candidates: ScoredCandidate[]
) {
  return apiFetch<{ id: string }>("/api/shortlists", {
    method: "POST",
    body: JSON.stringify({ name, searchId, candidates }),
  });
}

export function getShortlist(id: string) {
  return apiFetch<{
    id: string;
    name: string;
    candidates: ScoredCandidate[];
    createdAt: string;
  }>(`/api/shortlists/${id}`);
}

export function warmUpBackend() {
  // Fire-and-forget — no await, no UI dependency (§14)
  fetch(`${BASE}/health`).catch(() => {});
}

export { BASE };

// FEATURE 2 — Upload JD file (FormData, not JSON)
export async function parseJdFile(file: File): Promise<{ filters: FilterSet; extractedText: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE}/api/parse-jd-file`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(body.message || `API error ${res.status}`);
  }
  return res.json();
}
