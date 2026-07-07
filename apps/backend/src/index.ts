import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import parseJdRouter from "./routes/parseJd.js";
import parseJdFileRouter from "./routes/parseJdFile.js";
import searchRouter from "./routes/search.js";
import scoreRouter from "./routes/score.js";
import historyRouter from "./routes/history.js";
import shortlistsRouter from "./routes/shortlists.js";

// --- Environment validation (fail fast on boot) ---
const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GROQ_API_KEY_PARSE",
  "GROQ_API_KEY_SCORE",
] as const;

const missing = REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error(
    `\n❌ Missing required environment variables:\n${missing.map((k) => `   - ${k}`).join("\n")}\n\nCopy .env.example to .env and fill in the values.\n`
  );
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || "8080", 10);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:3000";
const mode = process.env.CRUSTDATA_API_KEY?.trim() ? "live" : "mock";

console.log(`[provider] running in ${mode} mode`);

const app: express.Express = express();

// --- Middleware ---
app.use(
  cors({
    origin: [ALLOWED_ORIGIN, "http://localhost:3000"],
  })
);
app.use(express.json({ limit: "1mb" }));

// Request logging
app.use((req, _res, next) => {
  const start = Date.now();
  _res.on("finish", () => {
    console.log(`${req.method} ${req.path} ${_res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// --- Routes ---
app.use("/health", healthRouter);
app.use("/api/parse-jd", parseJdRouter);
app.use("/api/parse-jd-file", parseJdFileRouter);
app.use("/api/search", searchRouter);
app.use("/api/score", scoreRouter);
app.use("/api/history", historyRouter);
app.use("/api/shortlists", shortlistsRouter);

// GET /api/search/:id is handled by historyRouter mounted on /api/history
// but we also need it at /api/search/:id — add a separate mount
app.get("/api/search/:id", async (req, res, next) => {
  try {
    const { supabase } = await import("./lib/supabase.js");
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

// --- Central error handler ---
interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

app.use(
  (
    err: AppError,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const statusCode = err.statusCode || 500;
    const code = err.code || "internal_error";
    console.error(`[error] ${code}: ${err.message}`);
    res.status(statusCode).json({ error: code, message: err.message });
  }
);

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
});

export { app, mode };
