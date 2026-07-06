import { Router } from "express";

const router = Router();

const startTime = Date.now();
const mode = process.env.CRUSTDATA_API_KEY?.trim() ? "live" : "mock";

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    mode,
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
});

export default router;
