import { Router } from "express";
import { z } from "zod";
import { FilterSetSchema } from "../ai/parseJd.js";
import { scoreCandidates } from "../ai/scoreCandidates.js";
import { supabase } from "../lib/supabase.js";
import type { CandidateProfile, ScoredCandidate } from "../providers/types.js";

// FIX 5 — Zod validation for score request body
const CandidateProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  skills: z.array(z.string()),
  seniority: z.enum(["junior", "mid", "senior", "lead", "director"]),
  yearsOfExperience: z.number(),
}).passthrough();

const ScoreBodySchema = z.object({
  searchId: z.string().min(1),
  filters: FilterSetSchema,
  candidates: z.array(CandidateProfileSchema).min(1).max(5),
});

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const parsed = ScoreBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "validation",
        message: parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "),
      });
      return;
    }

    const { searchId, filters, candidates } = parsed.data;

    const scored = await scoreCandidates(candidates as unknown as CandidateProfile[], filters);

    // Merge scored batch into search_history.results (read-modify-write)
    const { data: existing } = await supabase
      .from("search_history")
      .select("results, candidate_count")
      .eq("id", searchId)
      .single();

    if (existing) {
      const currentResults = (existing.results || []) as ScoredCandidate[];
      // FIX 1 — merge-by-id instead of append to prevent duplicates
      const scoreMap = new Map(scored.map(s => [s.id, s]));
      const updatedResults = currentResults.map(c => scoreMap.get(c.id) ?? c);
      await supabase
        .from("search_history")
        .update({
          results: updatedResults,
          candidate_count: updatedResults.length,
        })
        .eq("id", searchId);
    }

    res.json({ scored });
  } catch (err) {
    next(err);
  }
});

export default router;
