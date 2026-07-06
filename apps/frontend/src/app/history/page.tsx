"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { fadeRise, staggerChildren } from "@/lib/motion";
import { EmptyState } from "@/components/shared/EmptyState";
import { getHistory } from "@/lib/api";

interface HistoryEntry {
  id: string;
  jdPreview: string;
  filters: {
    titles?: string[];
    skills?: string[];
    locations?: string[];
    seniority?: string[];
  };
  mode: "mock" | "live";
  candidateCount: number;
  createdAt: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function HistoryPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory(20)
      .then((data) => {
        setSearches(data.searches);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-app px-6 py-app-desktop">
        <div className="eyebrow text-espresso">HISTORY</div>
        <h1 className="font-fraunces text-h1 text-forest">
          Every search, everyone&apos;s.
        </h1>
        <p className="font-satoshi text-small text-espresso-60 mt-1 mb-8">
          AI Talent Sense has no accounts — history is global and public by design.
        </p>

        {loading ? (
          <div className="animate-pulse font-satoshi text-body text-espresso-60 text-center py-12">
            Loading…
          </div>
        ) : searches.length === 0 ? (
          <EmptyState
            title="No searches yet."
            body="Be the first — paste a JD and start searching."
            ctaLabel="Start a search"
            ctaHref="/search"
          />
        ) : (
          <motion.div
            variants={staggerChildren(0.04)}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {searches.map((search) => {
              const chips = [
                ...(search.filters.titles?.slice(0, 2) || []),
                ...(search.filters.skills?.slice(0, 2) || []),
              ];
              const remainingCount =
                (search.filters.titles?.length || 0) +
                (search.filters.skills?.length || 0) +
                (search.filters.locations?.length || 0) +
                (search.filters.seniority?.length || 0) -
                chips.length;

              return (
                <motion.button
                  key={search.id}
                  variants={fadeRise}
                  onClick={() => router.push(`/results/${search.id}`)}
                  className="w-full text-left rounded-card border border-tan-40 bg-cream px-5 py-4 transition-colors hover:bg-olive-5 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-satoshi text-body text-espresso line-clamp-2">
                        {search.jdPreview}…
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {chips.map((c) => (
                          <span
                            key={c}
                            className="rounded-chip bg-olive-10 px-2 py-0.5 font-satoshi text-[11px] text-espresso"
                          >
                            {c}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span className="rounded-chip bg-tan-30 px-2 py-0.5 font-satoshi text-[11px] text-espresso-60">
                            +{remainingCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className={`rounded-chip px-2 py-0.5 text-label ${
                          search.mode === "live"
                            ? "border border-olive text-olive"
                            : "border border-tan text-tan"
                        }`}
                      >
                        {search.mode === "live" ? "LIVE" : "DEMO"}
                      </span>
                      <span className="flex items-center gap-1 font-satoshi text-small text-espresso-60">
                        <Clock className="h-3 w-3" />
                        {relativeTime(search.createdAt)}
                      </span>
                      <span className="font-satoshi text-small text-espresso-60">
                        {search.candidateCount} candidates
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
