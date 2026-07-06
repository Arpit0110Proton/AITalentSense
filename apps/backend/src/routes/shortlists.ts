import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// POST /api/shortlists
router.post("/", async (req, res, next) => {
  try {
    const { name, searchId, candidates } = req.body;
    if (!name || typeof name !== "string" || name.length < 1 || name.length > 80) {
      res.status(400).json({ error: "validation", message: "name is required (1–80 chars)" });
      return;
    }
    if (!candidates || !Array.isArray(candidates)) {
      res.status(400).json({ error: "validation", message: "candidates array is required" });
      return;
    }

    const { data, error } = await supabase
      .from("shortlists")
      .insert({
        name,
        search_id: searchId || null,
        candidates,
      })
      .select("id")
      .single();

    if (error || !data) {
      res.status(500).json({ error: "db_error", message: "Failed to create shortlist" });
      return;
    }

    res.json({ id: data.id });
  } catch (err) {
    next(err);
  }
});

// GET /api/shortlists/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("shortlists")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "not_found", message: "Shortlist not found" });
      return;
    }

    res.json({
      id: data.id,
      name: data.name,
      candidates: data.candidates,
      createdAt: data.created_at,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
