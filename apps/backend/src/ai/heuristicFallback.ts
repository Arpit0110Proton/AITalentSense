import type { FilterSet, Seniority } from "../providers/types.js";
import type { ScoredCandidate, CandidateProfile } from "../providers/types.js";

const SENIORITY_INDEX: Record<Seniority, number> = {
  junior: 0,
  mid: 1,
  senior: 2,
  lead: 3,
  director: 4,
};

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function heuristicScore(
  candidate: CandidateProfile,
  filters: FilterSet
): ScoredCandidate {
  // Skills: Jaccard × 100
  const skillsScore = Math.round(
    jaccardSimilarity(candidate.skills, filters.skills) * 100
  );

  // Seniority: 100 - 25 × |bandIndex(candidate) - nearest bandIndex(required)|, floor 0
  let seniorityScore: number;
  if (filters.seniority.length === 0) {
    seniorityScore = 70;
  } else {
    const candidateIdx = SENIORITY_INDEX[candidate.seniority];
    const minDist = Math.min(
      ...filters.seniority.map((s) => Math.abs(candidateIdx - SENIORITY_INDEX[s]))
    );
    seniorityScore = Math.max(0, 100 - 25 * minDist);
  }

  // Industry: 80 if match, 55 otherwise, 70 if filter has none
  let industryScore: number;
  if (filters.industries.length === 0) {
    industryScore = 70;
  } else {
    const candidateIndustries = [
      ...candidate.pastRoles.map(() => ""), // no industry on pastRoles in this context
    ];
    // Check headline/company for industry clues — simplified: check if any filter industry appears in summary
    const allText = `${candidate.summary} ${candidate.headline} ${candidate.currentCompany}`.toLowerCase();
    const hasMatch = filters.industries.some((ind) =>
      allText.includes(ind.toLowerCase())
    );
    industryScore = hasMatch ? 80 : 55;
  }

  // Location: exact 100, same country 70, else 40, unspecified 70
  let locationScore: number;
  if (filters.locations.length === 0) {
    locationScore = 70;
  } else {
    const candidateLoc = candidate.location.toLowerCase();
    const exactMatch = filters.locations.some(
      (l) => candidateLoc.includes(l.toLowerCase()) || l.toLowerCase().includes("remote") && candidateLoc.includes("remote")
    );
    if (exactMatch) {
      locationScore = 100;
    } else {
      // Check same country
      const candidateCountryHints = candidateLoc.split(",").map((s) => s.trim());
      const sameCountry = filters.locations.some((l) =>
        candidateCountryHints.some((ch) => l.toLowerCase().includes(ch))
      );
      locationScore = sameCountry ? 70 : 40;
    }
  }

  // Shared skills for blurb
  const sharedSkills = candidate.skills.filter((s) =>
    filters.skills.some((fs) => fs.toLowerCase() === s.toLowerCase())
  );

  const subscores = {
    skills: Math.min(100, Math.max(0, skillsScore)),
    seniority: Math.min(100, Math.max(0, seniorityScore)),
    industry: Math.min(100, Math.max(0, industryScore)),
    location: Math.min(100, Math.max(0, locationScore)),
  };

  const score = Math.round(
    0.4 * subscores.skills +
    0.25 * subscores.seniority +
    0.25 * subscores.industry +
    0.1 * subscores.location
  );

  const blurb = `${candidate.yearsOfExperience}y ${candidate.currentTitle}; matches ${sharedSkills.slice(0, 3).join(", ") || "few skills"}. (Heuristic score — AI scorer unavailable.)`;

  return {
    ...candidate,
    score,
    subscores,
    blurb,
    scoredBy: "heuristic",
  };
}
