"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { EASE_OUT_EXPO, SPRING_SNAPPY, fadeRise, staggerChildren } from "@/lib/motion";
import { Button } from "@/components/shared/Button";
import { FilterChips } from "@/components/app/FilterChips";
import { useToast } from "@/components/shared/Toast";
import { parseJd, searchCandidates } from "@/lib/api";
import type { FilterSet } from "@/lib/api";

// Module-level store for passing data to results page without refetch
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared mutable store for cross-page data passing
(globalThis as any).__ats_search_store = (globalThis as any).__ats_search_store || {};

export default function SearchPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [jdText, setJdText] = useState("");
  const [filters, setFilters] = useState<FilterSet | null>(null);
  const [parsing, setParsing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [slowWarn, setSlowWarn] = useState(false);

  const charCount = jdText.length;
  const isOverLimit = charCount > 15000;

  const handleExtract = async () => {
    if (charCount < 10 || isOverLimit) {
      showToast("JD must be between 10 and 15,000 characters", "error");
      return;
    }

    setParsing(true);
    setSlowWarn(false);
    const timer = setTimeout(() => setSlowWarn(true), 4000);

    try {
      const result = await parseJd(jdText);
      setFilters(result.filters);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to parse JD",
        "error"
      );
    } finally {
      setParsing(false);
      clearTimeout(timer);
      setSlowWarn(false);
    }
  };

  const handleSearch = async () => {
    if (!filters) return;
    setSearching(true);
    setSlowWarn(false);
    const timer = setTimeout(() => setSlowWarn(true), 4000);

    try {
      const result = await searchCandidates(jdText, filters);
      // Store data for results page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cross-page data store
      (globalThis as any).__ats_search_store[result.searchId] = {
        candidates: result.candidates,
        filters,
        mode: result.mode,
        jdText,
      };
      router.push(`/results/${result.searchId}`);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Search failed",
        "error"
      );
      setSearching(false);
      clearTimeout(timer);
      setSlowWarn(false);
    }
  };

  const handleStartOver = () => {
    if (hasEdited) {
      if (!confirm("You have unsaved filter edits. Start over?")) return;
    }
    setJdText("");
    setFilters(null);
    setHasEdited(false);
  };

  const handleFilterChange = (newFilters: FilterSet) => {
    setFilters(newFilters);
    setHasEdited(true);
  };

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-app px-6 py-app-desktop">
        <div className="eyebrow text-espresso">NEW SEARCH</div>
        <h1 className="font-fraunces text-h1 text-forest mb-8">
          Paste the job description.
        </h1>

        {/* Slow server warning */}
        <AnimatePresence>
          {slowWarn && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-card border border-tan-40 bg-cream px-4 py-3 font-satoshi text-small text-sage"
            >
              Waking the free-tier server… hang tight.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 1 — Paste textarea */}
        <motion.div
          animate={{ opacity: parsing ? 0.55 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              readOnly={parsing}
              placeholder="Paste the full JD — role, requirements, location, everything. The AI reads all of it."
              className="w-full min-h-[320px] rounded-input border border-tan bg-cream p-5 font-satoshi text-body text-espresso placeholder:text-espresso-60 outline-none resize-y focus:border-olive focus:ring-2 focus:ring-olive focus:ring-offset-2"
            />
            <span
              className={`absolute bottom-3 right-3 font-satoshi text-small ${
                isOverLimit ? "text-clay" : "text-espresso-60"
              }`}
            >
              {charCount.toLocaleString()}
            </span>
          </div>

          {!filters && (
            <div className="mt-4">
              <Button
                onClick={handleExtract}
                disabled={parsing || charCount < 10 || isOverLimit}
              >
                {parsing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reading the JD…
                  </>
                ) : (
                  "Extract filters"
                )}
              </Button>
            </div>
          )}
        </motion.div>

        {/* Phase 2 — Filter rail */}
        <AnimatePresence>
          {filters && (
            <motion.div
              variants={staggerChildren(0.04)}
              initial="hidden"
              animate="visible"
              className="mt-8"
            >
              <motion.div variants={fadeRise}>
                <div className="eyebrow text-espresso mb-2">FILTERS</div>
                <p className="font-satoshi text-small text-espresso-60 mb-4">
                  The AI proposed these — edit, add, or remove before searching.
                </p>
              </motion.div>

              <motion.div variants={fadeRise}>
                <FilterChips
                  filters={filters}
                  onChange={handleFilterChange}
                />
              </motion.div>

              <motion.div
                variants={fadeRise}
                className="mt-6 flex items-center gap-3"
              >
                <Button onClick={handleSearch} disabled={searching}>
                  {searching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Searching…
                    </>
                  ) : (
                    "Search candidates"
                  )}
                </Button>
                <Button variant="secondary" onClick={handleStartOver}>
                  Start over
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
