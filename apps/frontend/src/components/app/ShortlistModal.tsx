"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { Button } from "@/components/shared/Button";
import { useToast } from "@/components/shared/Toast";
import { createShortlist } from "@/lib/api";
import type { ScoredCandidate } from "@/lib/api";

interface ShortlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: ScoredCandidate[];
  searchId: string;
  defaultName: string;
}

export function ShortlistModal({
  isOpen,
  onClose,
  candidates,
  searchId,
  defaultName,
}: ShortlistModalProps) {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { id } = await createShortlist(name.trim(), searchId, candidates);
      const url = `${window.location.origin}/shortlist/${id}`;
      setSavedUrl(url);
      showToast("Shortlist saved");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save shortlist",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!savedUrl) return;
    try {
      await navigator.clipboard.writeText(savedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleClose = () => {
    setSavedUrl(null);
    setCopied(false);
    setName(defaultName);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-forest-60"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-md rounded-modal bg-cream p-6 shadow-lift"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-olive-10"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-espresso" />
              </button>

              <h2 className="font-fraunces text-h2 text-forest mb-1">
                Save shortlist
              </h2>
              <p className="font-satoshi text-small text-espresso-60 mb-4">
                {candidates.length} candidate{candidates.length !== 1 && "s"} will be saved
              </p>

              {!savedUrl ? (
                <>
                  <label className="text-label text-espresso-60 mb-1.5 block">
                    NAME
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    className="w-full rounded-input border border-tan bg-cream px-3 py-2 font-satoshi text-body text-espresso outline-none focus:border-olive focus:ring-2 focus:ring-olive focus:ring-offset-1 mb-4"
                  />
                  <Button
                    onClick={handleSave}
                    disabled={saving || !name.trim()}
                    className="w-full"
                  >
                    {saving ? "Saving…" : "Save"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="rounded-input border border-tan bg-olive-10 px-3 py-2 mb-3">
                    <p className="font-satoshi text-small text-espresso break-all">
                      {savedUrl}
                    </p>
                  </div>
                  <Button onClick={handleCopy} className="w-full">
                    {copied ? "Copied ✓" : "Copy link"}
                  </Button>
                </>
              )}

              <p className="mt-3 font-satoshi text-[11px] text-espresso-60 text-center">
                Anyone with this link can view the shortlist.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
