import { Router } from "express";
import { scoreCandidates } from "../ai/scoreCandidates.js";
import { supabase } from "../lib/supabase.js";
import type { CandidateProfile, FilterSet, ScoredCandidate } from "../providers/types.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { searchId, filters, candidates } = req.body as {
      searchId: string;
      filters: FilterSet;
      candidates: CandidateProfile[];
    };

    if (!searchId || !filters || !candidates || !Array.isArray(candidates)) {
      res.status(400).json({ error: "validation", message: "searchId, filters, and candidates are required" });
      return;
    }

    if (candidates.length > 5) {
      res.status(400).json({ error: "validation", message: "Maximum 5 candidates per score call" });
      return;
    }

    const scored = await scoreCandidates(candidates, filters);

    // Merge scored batch into search_history.results (read-modify-write)
    const { data: existing } = await supabase
      .from("search_history")
      .select("results, candidate_count")
      .eq("id", searchId)
      .single();

    if (existing) {
      const currentResults = (existing.results || []) as ScoredCandidate[];
      const updatedResults = [...currentResults, ...scored];
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
