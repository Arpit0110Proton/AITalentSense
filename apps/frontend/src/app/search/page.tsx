"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { EASE_OUT_EXPO, SPRING_SNAPPY, fadeRise, staggerChildren } from "@/lib/motion";
import { Button } from "@/components/shared/Button";
import { FilterChips } from "@/components/app/FilterChips";
import { JdUploader } from "@/components/app/JdUploader";
import { useToast } from "@/components/shared/Toast";
import { parseJd, searchCandidates, getSearch } from "@/lib/api";
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

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [entryMode, setEntryMode] = useState<EntryMode>("upload");

  // Upload tab workspace memory
  const [uploadFilters, setUploadFilters] = useState<FilterSet | null>(null);
  const [uploadJdText, setUploadJdText] = useState("");

  // Paste tab workspace memory
  const [pasteFilters, setPasteFilters] = useState<FilterSet | null>(null);
  const [pasteJdText, setPasteJdText] = useState("");

  // Manual tab workspace memory
  const [manualFilters, setManualFilters] = useState<FilterSet | null>(null);

  const [parsing, setParsing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [slowWarn, setSlowWarn] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Pre-load search for editing if 'edit' query param is present
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;

    setLoadingEdit(true);
    getSearch(editId)
      .then((data) => {
        if (data.jd_text && data.jd_text.startsWith("Manual search: ")) {
          setManualFilters(data.filters);
          setEntryMode("manual");
        } else {
          setPasteFilters(data.filters);
          setPasteJdText(data.jd_text);
          setEntryMode("paste");
        }
        // Clean URL query params to prevent reload loop
        window.history.replaceState(null, "", "/search");
      })
      .catch((err) => {
        showToast(
          err instanceof Error ? err.message : "Failed to load existing search filters",
          "error"
        );
      })
      .finally(() => {
        setLoadingEdit(false);
      });
  }, [searchParams, showToast]);

  const charCount = pasteJdText.length;
  const isOverLimit = charCount > 15000;

  // Active filters getter based on the current mode
  const currentFilters =
    entryMode === "upload" ? uploadFilters :
    entryMode === "paste" ? pasteFilters :
    manualFilters;

  // Manual mode search guardrail
  const manualHasMinFilters =
    (currentFilters?.titles?.length || 0) +
      (currentFilters?.skills?.length || 0) +
      (currentFilters?.seniority?.length || 0) >
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
      const result = await parseJd(pasteJdText);
      setPasteFilters(result.filters);
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
    if (!currentFilters) return;
    setSearching(true);
    setSlowWarn(false);
    const timer = setTimeout(() => setSlowWarn(true), 4000);

    // Get active JD text to submit based on mode
    let effectiveJdText = "";
    if (entryMode === "upload") {
      effectiveJdText = uploadJdText;
    } else if (entryMode === "paste") {
      effectiveJdText = pasteJdText;
    } else {
      // Synthesize JD text for manual mode
      const parts: string[] = [];
      if (currentFilters.titles.length) parts.push(currentFilters.titles.join(", "));
      if (currentFilters.seniority.length) parts.push(`(${currentFilters.seniority.join("/")})`);
      if (currentFilters.skills.length) parts.push(`— ${currentFilters.skills.slice(0, 5).join(", ")}`);
      if (currentFilters.locations.length) parts.push(`in ${currentFilters.locations.join(", ")}`);
      effectiveJdText = "Manual search: " + (parts.join(" ") || "(no filters set)");
    }

    try {
      const result = await searchCandidates(effectiveJdText, currentFilters);
      // Store data for results page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cross-page data store
      (globalThis as any).__ats_search_store[result.searchId] = {
        candidates: result.candidates,
        filters: currentFilters,
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
    if (entryMode === "upload") {
      setUploadFilters(null);
      setUploadJdText("");
    } else if (entryMode === "paste") {
      setPasteFilters(null);
      setPasteJdText("");
    } else {
      setManualFilters(null);
    }
    setHasEdited(false);
  };

  const handleFilterChange = (newFilters: FilterSet) => {
    if (entryMode === "upload") {
      setUploadFilters(newFilters);
    } else if (entryMode === "paste") {
      setPasteFilters(newFilters);
    } else {
      setManualFilters(newFilters);
    }
    setHasEdited(true);
  };

  const handleUploadExtracted = (extractedFilters: FilterSet, extractedText: string) => {
    setUploadFilters(extractedFilters);
    setUploadJdText(extractedText);
  };

  const handleManualStart = () => {
    setManualFilters({ ...EMPTY_FILTERS });
  };

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-app px-6 py-app-desktop text-center">
          <div className="animate-pulse font-satoshi text-body text-espresso-60">
            Loading existing search filters…
          </div>
        </div>
      </div>
    );
  }

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

        {/* Entry surface — active tab input surface */}
        <AnimatePresence mode="wait">
          {entryMode === "upload" && (
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

          {entryMode === "paste" && (
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
                    value={pasteJdText}
                    onChange={(e) => setPasteJdText(e.target.value)}
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

          {entryMode === "manual" && !manualFilters && (
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

          {entryMode === "manual" && manualFilters && (
            <motion.div
              key="manual-active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-satoshi text-small text-espresso-60"
            >
              Manual filters active. Add or edit chips below, or click Start Over.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2 — Filter rail (specific to the active tab, rendered below its input surface) */}
        <AnimatePresence>
          {currentFilters && (
            <motion.div
              variants={staggerChildren(0.04)}
              initial="hidden"
              animate="visible"
              className="mt-8 border-t border-tan-40 pt-8"
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
                  filters={currentFilters}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream pt-24 text-center">
        <div className="animate-pulse font-satoshi text-body text-espresso-60">
          Loading search…
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
