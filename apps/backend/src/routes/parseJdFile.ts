import { Router } from "express";
import multer from "multer";
// Use the inner module — the default entry runs a bundled test file at import time
// that ENOENTs in production.
// @ts-expect-error — no declaration for sub-path
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import { parseJd } from "../ai/parseJd.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Allowed MIME types
const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

// Allowed extensions
const ALLOWED_EXTS = new Set([".pdf", ".docx", ".txt"]);

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "validation", message: "No file provided. Upload a PDF, DOCX, or TXT file." });
      return;
    }

    const ext = getExtension(file.originalname);
    if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
      res.status(400).json({
        error: "validation",
        message: "Unsupported file type. Upload a PDF, DOCX, or TXT file.",
      });
      return;
    }

    let extractedText = "";

    if (file.mimetype === "application/pdf") {
      const result = await pdfParse(file.buffer);
      extractedText = result.text;
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } else {
      // text/plain
      extractedText = file.buffer.toString("utf8");
    }

    extractedText = extractedText.trim();

    if (extractedText.length < 25) {
      res.status(422).json({
        error: "extraction_too_short",
        message:
          "Couldn't read enough text from this file (minimum 25 characters required). Try pasting the text instead.",
      });
      return;
    }

    // Truncate to 15,000 chars if needed (parseJd allows up to 15,000)
    if (extractedText.length > 15000) {
      extractedText = extractedText.slice(0, 15000);
    }

    const filters = await parseJd(extractedText);
    res.json({ filters, extractedText });
  } catch (err) {
    next(err);
  }
});

export default router;
