"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Loader2, FileText, X } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { useToast } from "@/components/shared/Toast";
import { parseJdFile } from "@/lib/api";
import type { FilterSet } from "@/lib/api";

interface JdUploaderProps {
  onExtracted: (filters: FilterSet, extractedText: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const ACCEPTED_EXTS = new Set([".pdf", ".docx", ".txt"]);

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

export function JdUploader({ onExtracted }: JdUploaderProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      // Client-side validation
      if (file.size > MAX_SIZE) {
        showToast("File too large — 5 MB maximum.", "error");
        return;
      }
      const ext = getExtension(file.name);
      if (!ACCEPTED_TYPES.has(file.type) && !ACCEPTED_EXTS.has(ext)) {
        showToast("Unsupported file type. Use PDF, DOCX, or TXT.", "error");
        return;
      }

      setProcessing(true);
      setFileName(file.name);

      try {
        const result = await parseJdFile(file);
        onExtracted(result.filters, result.extractedText);
      } catch (err) {
        showToast(
          (err instanceof Error ? err.message : "Upload failed") +
            " — try the Paste tab instead.",
          "error"
        );
        setProcessing(false);
        setFileName(null);
      }
    },
    [onExtracted, showToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [handleFile]
  );

  const handleReset = () => {
    setProcessing(false);
    setFileName(null);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onClick={() => !processing && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center min-h-[320px] rounded-input border-2 border-dashed transition-colors duration-200 cursor-pointer ${
        dragging
          ? "border-olive bg-olive-5"
          : "border-tan hover:border-olive"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={handleInputChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {processing ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-card bg-olive-10">
              <FileText className="h-5 w-5 text-olive" />
              <span className="font-satoshi text-body text-espresso">
                {fileName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="ml-2 p-1 rounded-full hover:bg-tan-30 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-espresso-60" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-olive" />
              <span className="font-satoshi text-small text-espresso-60">
                Reading {fileName}…
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="flex flex-col items-center gap-3"
          >
            <UploadCloud className="h-10 w-10 text-tan" />
            <p className="font-satoshi text-body text-espresso text-center px-4">
              Drop a PDF, DOCX, or TXT here — or click to browse.
            </p>
            <p className="font-satoshi text-small text-espresso-60">
              Up to 5 MB.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
