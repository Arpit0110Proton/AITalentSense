import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// GET /api/history?limit=20
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(50, parseInt(String(req.query.limit || "20"), 10));
    const { data, error } = await supabase
      .from("search_history")
      .select("id, jd_text, filters, mode, candidate_count, created_at, job_title")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      res.status(500).json({ error: "db_error", message: error.message });
      return;
    }

    const searches = (data || []).map((row) => ({
      id: row.id,
      jdPreview: (row.jd_text as string).slice(0, 120),
      filters: row.filters,
      mode: row.mode,
      candidateCount: row.candidate_count,
      createdAt: row.created_at,
      jobTitle: (row.job_title as string | null) || null,
    }));

    res.json({ searches });
  } catch (err) {
    next(err);
  }
});

// GET /api/search/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("search_history")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "not_found", message: "Search not found" });
      return;
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
