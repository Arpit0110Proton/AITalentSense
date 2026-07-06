import { Router } from "express";
import { parseJd } from "../ai/parseJd.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { jdText } = req.body;
    if (!jdText || typeof jdText !== "string") {
      res.status(400).json({ error: "validation", message: "jdText is required" });
      return;
    }
    if (jdText.length < 10 || jdText.length > 15000) {
      res.status(400).json({
        error: "validation",
        message: "JD must be between 10 and 15,000 characters",
      });
      return;
    }

    const filters = await parseJd(jdText);
    res.json({ filters });
  } catch (err) {
    next(err);
  }
});

export default router;
