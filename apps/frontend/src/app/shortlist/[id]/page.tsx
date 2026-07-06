"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGroup } from "framer-motion";
import { Download } from "lucide-react";
import { fadeRise } from "@/lib/motion";
import { CandidateCard } from "@/components/app/CandidateCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/shared/Button";
import { getShortlist } from "@/lib/api";
import { buildCsv } from "@/lib/csv";
import type { ScoredCandidate } from "@/lib/api";

export default function ShortlistPage() {
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [candidates, setCandidates] = useState<ScoredCandidate[]>([]);
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  useEffect(() => {
    getShortlist(id)
      .then((data) => {
        setName(data.name);
        setCandidates(data.candidates || []);
        setCreatedAt(data.createdAt);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  const handleExport = () => {
    const sorted = [...candidates].sort((a, b) => b.score - a.score);
    buildCsv(sorted, name || "shortlist");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-app px-6 py-app-desktop text-center">
          <div className="animate-pulse font-satoshi text-body text-espresso-60">
            Loading shortlist…
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-cream pt-24">
        <div className="mx-auto max-w-app px-6 py-app-desktop">
          <EmptyState
            title="This shortlist doesn't exist."
            body="It may have been removed, or the URL is incorrect."
            ctaLabel="Start a search"
            ctaHref="/search"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-app px-6 py-app-desktop">
        <motion.div variants={fadeRise} initial="hidden" animate="visible">
          <div className="eyebrow text-espresso">SHORTLIST</div>
          <h1 className="font-fraunces text-h1 text-forest">{name}</h1>
          <p className="font-satoshi text-small text-espresso-60 mt-1 mb-4">
            Saved{" "}
            {createdAt &&
              new Date(createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
            · {candidates.length} candidate{candidates.length !== 1 && "s"} · shared view
          </p>
        </motion.div>

        {/* Snapshot banner */}
        <div className="rounded-card border border-sage-30 bg-cream px-4 py-3 mb-6 font-satoshi text-small text-espresso-60">
          This is a saved snapshot — scores were computed when the shortlist was created.
        </div>

        {/* Export */}
        <div className="flex justify-end mb-4">
          <Button
            variant="secondary"
            onClick={handleExport}
            className="!px-3 !py-1.5 !text-small"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Cards */}
        <LayoutGroup>
          <div className="space-y-3">
            {candidates
              .sort((a, b) => b.score - a.score)
              .map((c, i) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  isOpen={openCardId === c.id}
                  onToggle={() =>
                    setOpenCardId(openCardId === c.id ? null : c.id)
                  }
                  index={i}
                />
              ))}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
