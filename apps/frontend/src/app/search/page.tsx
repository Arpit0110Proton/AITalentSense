"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { EASE_OUT_EXPO, SPRING_SNAPPY, fadeRise, staggerChildren } from "@/lib/motion";
import { Button } from "@/components/shared/Button";
import { FilterChips } from "@/components/app/FilterChips";
import { JdUploader } from "@/components/app/JdUploader";
import { useToast } from "@/components/shared/Toast";
import { parseJd, searchCandidates } from "@/lib/api";
import type { FilterSet } from "@/lib/api";

// Module-level store for passing data to results page without refetch
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- shared mutable store for cross-page data passing
(globalThis as any).__ats_search_store = (globalThis as any).__ats_search_store || {};

type EntryMode = "upload" | "paste" | "manual";

const TAB_LABELS: Record<EntryMode, string> = {
  upload: "Upload JD",
  paste: "Paste JD",
  manual: "Manual filters",
};

const HEADINGS: Record<EntryMode, string> = {
  upload: "Upload the job description.",
  paste: "Paste the job description.",
  manual: "Build filters manually.",
};

const EMPTY_FILTERS: FilterSet = {
  titles: [],
  skills: [],
  seniority: [],
  locations: [],
  industries: [],
  minYears: null,
  maxYears: null,
};

export default function SearchPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [entryMode, setEntryMode] = useState<EntryMode>("upload");
  const [jdText, setJdText] = useState("");
  const [filters, setFilters] = useState<FilterSet | null>(null);
  const [parsing, setParsing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [slowWarn, setSlowWarn] = useState(false);

  const charCount = jdText.length;
  const isOverLimit = charCount > 15000;

  // Manual mode search guardrail
  const manualHasMinFilters =
    (filters?.titles?.length || 0) +
      (filters?.skills?.length || 0) +
      (filters?.seniority?.length || 0) >
    0;
  const searchDisabled =
    searching ||
    (entryMode === "manual" && !manualHasMinFilters);

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

    // Synthesize JD text for manual mode
    let effectiveJdText = jdText;
    if (entryMode === "manual" && !jdText) {
      const parts: string[] = [];
      if (filters.titles.length) parts.push(filters.titles.join(", "));
      if (filters.seniority.length) parts.push(`(${filters.seniority.join("/")})`);
      if (filters.skills.length) parts.push(`— ${filters.skills.slice(0, 5).join(", ")}`);
      if (filters.locations.length) parts.push(`in ${filters.locations.join(", ")}`);
      effectiveJdText = "Manual search: " + (parts.join(" ") || "(no filters set)");
    }

    try {
      const result = await searchCandidates(effectiveJdText, filters);
      // Store data for results page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cross-page data store
      (globalThis as any).__ats_search_store[result.searchId] = {
        candidates: result.candidates,
        filters,
        mode: result.mode,
        jdText: effectiveJdText,
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

  const handleUploadExtracted = (extractedFilters: FilterSet, extractedText: string) => {
    setFilters(extractedFilters);
    setJdText(extractedText);
  };

  const handleManualStart = () => {
    setFilters({ ...EMPTY_FILTERS });
  };

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-app px-6 py-app-desktop">
        {/* Segmented tabs */}
        <div className="mb-6">
          <div className="inline-flex rounded-chip border border-tan bg-cream p-1 gap-0">
            {(["upload", "paste", "manual"] as EntryMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setEntryMode(mode)}
                className={`relative px-5 py-2 rounded-chip font-satoshi text-small font-medium transition-all duration-200 ${
                  entryMode === mode
                    ? "bg-olive text-cream shadow-card"
                    : "bg-transparent text-espresso hover:text-olive"
                }`}
              >
                {TAB_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        <div className="eyebrow text-espresso">NEW SEARCH</div>
        <h1 className="font-fraunces text-h1 text-forest mb-8">
          {HEADINGS[entryMode]}
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

        {/* Entry surface — tab content with fade transition */}
        <AnimatePresence mode="wait">
          {entryMode === "upload" && !filters && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <JdUploader onExtracted={handleUploadExtracted} />
            </motion.div>
          )}

          {entryMode === "paste" && !filters && (
            <motion.div
              key="paste"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE_OUT_EXPO } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
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
              </motion.div>
            </motion.div>
          )}

          {entryMode === "manual" && !filters && (
            <motion.div
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, ease: EASE_OUT_EXPO } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex flex-col items-start gap-4"
            >
              <p className="font-satoshi text-body text-espresso-60">
                Build the search filters yourself. No JD required.
              </p>
              <Button onClick={handleManualStart}>
                Start with empty filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2 — Filter rail (shared across all modes) */}
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
                  {entryMode === "manual"
                    ? "Add titles, skills, seniority, and more to refine your search."
                    : "The AI proposed these — edit, add, or remove before searching."}
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
                <Button
                  onClick={handleSearch}
                  disabled={searchDisabled}
                  title={
                    entryMode === "manual" && !manualHasMinFilters
                      ? "Add at least one title, skill, or seniority to search."
                      : undefined
                  }
                >
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
