import { Router } from "express";
import { getProvider } from "../providers/factory.js";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { jdText, filters } = req.body;
    if (!jdText || !filters) {
      res.status(400).json({ error: "validation", message: "jdText and filters are required" });
      return;
    }

    const provider = getProvider();

    // Search for candidates (immediate response — unscored)
    const candidates = await provider.search(filters, 25);

    // Create search_history row
    const { data: row, error: insertErr } = await supabase
      .from("search_history")
      .insert({
        jd_text: jdText,
        filters,
        mode: provider.mode,
        results: candidates,
        candidate_count: candidates.length,
      })
      .select("id")
      .single();

    if (insertErr || !row) {
      res.status(500).json({ error: "db_error", message: "Failed to create search record" });
      return;
    }

    res.json({
      searchId: row.id,
      mode: provider.mode,
      candidates,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
