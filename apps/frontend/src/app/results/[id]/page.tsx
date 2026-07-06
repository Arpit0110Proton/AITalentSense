"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { SPRING_SOFT, fadeRise } from "@/lib/motion";
import { ModeBanner } from "@/components/app/ModeBanner";
import { CandidateCard } from "@/components/app/CandidateCard";
import { SortBar } from "@/components/app/SortBar";
import { ShortlistModal } from "@/components/app/ShortlistModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { useToast } from "@/components/shared/Toast";
import { scoreBatch, getSearch } from "@/lib/api";
import { buildCsv } from "@/lib/csv";
import type { CandidateProfile, ScoredCandidate, FilterSet } from "@/lib/api";

type SortOption = "score" | "name";

export default function ResultsPage() {
  const params = useParams();
  const searchId = params.id as string;
  const { showToast } = useToast();

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [scored, setScored] = useState<Map<string, ScoredCandidate>>(new Map());
  const [filters, setFilters] = useState<FilterSet | null>(null);
  const [mode, setMode] = useState<"mock" | "live">("mock");
  const [sort, setSort] = useState<SortOption>("score");
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [scoringComplete, setScoringComplete] = useState(false);
  const [scoredCount, setScoredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slowScoring, setSlowScoring] = useState(false);
  const scoringStartRef = useRef<number>(0);
  const hasStartedScoring = useRef(false);

  // Load data — either from module-level store or API
  useEffect(() => {
    const loadData = async () => {
      // Check module-level store first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cross-page data store
      const store = (globalThis as any).__ats_search_store?.[searchId];
      if (store) {
        setCandidates(store.candidates);
        setFilters(store.filters);
        setMode(store.mode);
        setLoading(false);
        // Clean up store
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- cross-page data store
        delete (globalThis as any).__ats_search_store[searchId];
        return;
      }

      // Cold URL — fetch from API
      try {
        const data = await getSearch(searchId);
        setFilters(data.filters);
        setMode(data.mode);

        if (data.results && data.results.length > 0) {
          // Already scored — show directly, no re-scoring
          const scoredMap = new Map<string, ScoredCandidate>();
          for (const c of data.results) {
            scoredMap.set(c.id, c);
          }
          setCandidates(data.results);
          setScored(scoredMap);
          setScoredCount(data.results.length);
          setScoringComplete(true);
        } else {
          setCandidates([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results");
        setLoading(false);
      }
    };

    loadData();
  }, [searchId]);

  // Progressive scoring — fires after candidates load
  const runScoring = useCallback(async () => {
    if (!filters || candidates.length === 0 || hasStartedScoring.current || scoringComplete) return;
    hasStartedScoring.current = true;
    scoringStartRef.current = Date.now();

    const batchSize = 5;
    const allScored = new Map<string, ScoredCandidate>();

    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      try {
        const result = await scoreBatch(searchId, filters, batch);
        for (const s of result.scored) {
          allScored.set(s.id, s);
        }
        setScored(new Map(allScored));
        setScoredCount(allScored.size);

        // Check if scoring is slow
        if (Date.now() - scoringStartRef.current > 20000) {
          setSlowScoring(true);
        }
      } catch (err) {
        console.error("Scoring batch failed:", err);
        showToast("Some scores may be heuristic estimates", "error");
      }
    }

    setScoringComplete(true);
    setSlowScoring(false);
  }, [candidates, filters, searchId, scoringComplete, showToast]);

  useEffect(() => {
    if (!loading && candidates.length > 0 && !scoringComplete) {
      runScoring();
    }
  }, [loading, candidates, scoringComplete, runScoring]);

  // Build display list
  const displayList: (ScoredCandidate | CandidateProfile)[] = (() => {
    if (scoringComplete) {
      const allScored = candidates.map((c) => scored.get(c.id) || c);
      if (sort === "score") {
        return [...allScored].sort((a, b) => {
          const sa = "score" in a ? (a as ScoredCandidate).score : -1;
          const sb = "score" in b ? (b as ScoredCandidate).score : -1;
          return sb - sa;
        });
      }
      return [...allScored].sort((a, b) => a.name.localeCompare(b.name));
    }
    // During scoring, keep arrival order but show scored data when available
    return candidates.map((c) => scored.get(c.id) || c);
  })();

  const scoredCandidates = Array.from(scored.values());
  const firstTitle = filters?.titles?.[0] || "Results";

  const handleExport = () => {
    if (!scoringComplete) return;
    const sorted = [...scoredCandidates].sort((a, b) => b.score - a.score);
    buildCsv(sorted, firstTitle);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-app px-6 py-app-desktop text-center">
          <div className="animate-pulse font-satoshi text-body text-espresso-60">
            Loading results…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-app px-6 py-app-desktop">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-card border border-clay bg-cream px-4 py-3 flex items-center gap-3 mb-6"
          >
            <AlertTriangle className="h-4 w-4 text-clay" />
            <span className="font-satoshi text-small text-espresso">{error}</span>
            <button
              onClick={handleRetry}
              className="ml-auto font-satoshi text-small text-olive underline"
            >
              Retry
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-app px-6 py-app-desktop">
          <EmptyState
            title="No matches — yet."
            body="Try broadening your filters — remove a location, widen the seniority range, or add more skill variations."
            ctaLabel="Edit filters"
            ctaHref="/search"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-app px-6 py-app-desktop">
        {/* Header */}
        <motion.div variants={fadeRise} initial="hidden" animate="visible">
          <div className="eyebrow text-espresso">RESULTS</div>
          <h1 className="font-fraunces text-h1 text-forest">
            {firstTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
            <span className="font-satoshi text-small text-espresso-60">
              {candidates.length} candidates · sorted by fit
            </span>
            {filters && (
              <div className="flex flex-wrap gap-1.5">
                {[
                  ...filters.titles.slice(0, 2),
                  ...filters.skills.slice(0, 2),
                  ...filters.locations.slice(0, 1),
                ].map((f) => (
                  <span
                    key={f}
                    className="rounded-chip bg-olive-10 px-2 py-0.5 font-satoshi text-[11px] text-espresso"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
            <Link
              href="/search"
              className="font-satoshi text-small text-olive ml-2"
            >
              Edit filters
            </Link>
          </div>
        </motion.div>

        {/* Mode banner */}
        <ModeBanner mode={mode} />

        {/* Scoring progress */}
        {!scoringComplete && (
          <div className="mb-4">
            <div className="h-0.5 w-full rounded-full bg-tan-30 overflow-hidden">
              <motion.div
                className="h-full bg-olive"
                animate={{ width: `${(scoredCount / candidates.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {slowScoring && (
              <p className="mt-1 font-satoshi text-small text-sage">
                The free tier is warming up — hang tight.
              </p>
            )}
          </div>
        )}

        {/* Sort bar */}
        <SortBar
          sort={sort}
          onSortChange={setSort}
          count={candidates.length}
          scoringComplete={scoringComplete}
          scoringProgress={`Scoring ${scoredCount} of ${candidates.length}…`}
          onExport={handleExport}
          onSaveShortlist={() => setShowShortlistModal(true)}
        />

        {/* Candidate cards */}
        <LayoutGroup>
          <div className="space-y-3">
            {displayList.map((c, i) => {
              const isScored = "score" in c;
              return (
                <motion.div key={c.id} layout transition={SPRING_SOFT}>
                  <CandidateCard
                    candidate={c}
                    isOpen={openCardId === c.id}
                    onToggle={() =>
                      setOpenCardId(openCardId === c.id ? null : c.id)
                    }
                    index={i}
                  />
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>

        {/* Shortlist modal */}
        <ShortlistModal
          isOpen={showShortlistModal}
          onClose={() => setShowShortlistModal(false)}
          candidates={scoredCandidates.sort((a, b) => b.score - a.score)}
          searchId={searchId}
          defaultName={`${firstTitle} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        />
      </div>
    </div>
  );
}
