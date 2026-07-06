import { z } from "zod";
import { groqScore, GROQ_MODEL } from "./groqClients.js";
import { heuristicScore } from "./heuristicFallback.js";
import type {
  CandidateProfile,
  FilterSet,
  ScoredCandidate,
} from "../providers/types.js";

const EvaluationSchema = z.object({
  evaluations: z.array(
    z.object({
      id: z.string(),
      skills: z.number(),
      seniority: z.number(),
      industry: z.number(),
      location: z.number(),
      blurb: z.string(),
    })
  ),
});

const SYSTEM_PROMPT = `You are an expert technical recruiter evaluating candidates against a role. For EACH candidate provided, return four subscores from 0-100 and a one-line reason.
Respond ONLY with JSON: {"evaluations": [{"id": string, "skills": number, "seniority": number, "industry": number, "location": number, "blurb": string}]}
Scoring guide:
- skills: overlap and depth of the candidate's skills vs the required skills. 90+ = has essentially all required skills; 50 = about half; 10 = barely any.
- seniority: how well their level and years match what the role needs. Overqualified scores higher than underqualified but not 100.
- industry: relevance of the industries they've worked in to the role's industry. If the role specifies no industry, judge general product-company relevance and center around 70.
- location: 100 = exact city match or both remote; 70 = same country; 40 = different country but remote-plausible; if the role specifies no location, return 70 for everyone.
- blurb: max 28 words, concrete and specific ("8y React at two fintechs, led a design system" not "great candidate"), mention the strongest match signal and one gap if any.
Return an evaluation for every candidate id you were given, no extras.`;

function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)));
}

async function scoreBatch(
  candidates: CandidateProfile[],
  filters: FilterSet
): Promise<ScoredCandidate[]> {
  const userPayload = {
    role: filters,
    candidates: candidates.map((c) => ({
      id: c.id,
      headline: c.headline,
      location: c.location,
      yearsOfExperience: c.yearsOfExperience,
      seniority: c.seniority,
      skills: c.skills,
      currentTitle: c.currentTitle,
      currentCompany: c.currentCompany,
      summary: c.summary,
    })),
  };

  let lastError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const messages: { role: "system" | "user"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(userPayload) },
    ];

    if (attempt > 0 && lastError) {
      messages.push({
        role: "user",
        content: `Your previous reply failed validation: ${lastError}. Reply with ONLY the corrected JSON.`,
      });
    }

    try {
      const response = await groqScore.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq");

      const parsed = JSON.parse(content);
      const validated = EvaluationSchema.parse(parsed);

      const evalMap = new Map(
        validated.evaluations.map((e) => [e.id, e])
      );

      return candidates.map((c) => {
        const ev = evalMap.get(c.id);
        if (!ev) {
          // Missing eval — fallback to heuristic for this candidate
          return heuristicScore(c, filters);
        }
        const subscores = {
          skills: clamp(ev.skills),
          seniority: clamp(ev.seniority),
          industry: clamp(ev.industry),
          location: clamp(ev.location),
        };
        const score = Math.round(
          0.4 * subscores.skills +
          0.25 * subscores.seniority +
          0.25 * subscores.industry +
          0.1 * subscores.location
        );
        return {
          ...c,
          score,
          subscores,
          blurb: ev.blurb,
          scoredBy: "ai" as const,
        };
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        lastError = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
      } else {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }
  }

  // Both attempts failed — heuristic fallback for this batch
  console.warn("[scoring] AI failed twice, using heuristic for batch");
  return candidates.map((c) => heuristicScore(c, filters));
}

export async function scoreCandidates(
  candidates: CandidateProfile[],
  filters: FilterSet
): Promise<ScoredCandidate[]> {
  const results: ScoredCandidate[] = [];
  const batchSize = 5;

  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const scored = await scoreBatch(batch, filters);
    results.push(...scored);

    // 300ms gap between batches — gentle to free tier
    if (i + batchSize < candidates.length) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  return results;
}
