"use client";

import { motion } from "framer-motion";
import { Download, Save } from "lucide-react";
import { Button } from "@/components/shared/Button";

type SortOption = "score" | "name";

interface SortBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  count: number;
  scoringComplete: boolean;
  scoringProgress: string;
  onExport: () => void;
  onSaveShortlist: () => void;
}

export function SortBar({
  sort,
  onSortChange,
  count,
  scoringComplete,
  scoringProgress,
  onExport,
  onSaveShortlist,
}: SortBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <span className="font-satoshi text-small text-espresso-60">
          {count} candidate{count !== 1 && "s"}
        </span>
        {!scoringComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-satoshi text-small text-sage"
          >
            {scoringProgress}
          </motion.span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {/* Sort segmented control — §11.2.5 */}
        <div className="flex items-center gap-1">
          <span className="font-satoshi text-small text-espresso-60 mr-1">Sort:</span>
          <button
            onClick={() => onSortChange("score")}
            className={`rounded-button px-3 py-1.5 font-satoshi text-small transition-colors ${
              sort === "score"
                ? "bg-olive text-cream"
                : "bg-transparent text-espresso hover:bg-olive-10"
            }`}
          >
            Score ↓
          </button>
          <button
            onClick={() => onSortChange("name")}
            className={`rounded-button px-3 py-1.5 font-satoshi text-small transition-colors ${
              sort === "name"
                ? "bg-olive text-cream"
                : "bg-transparent text-espresso hover:bg-olive-10"
            }`}
          >
            Name A–Z
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:flex-none">
          <Button
            variant="secondary"
            onClick={onExport}
            disabled={!scoringComplete}
            title={scoringComplete ? "Export CSV" : "Scoring in progress…"}
            className="!px-3 !py-1.5 !text-small flex-1 sm:flex-initial justify-center"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>

          <Button
            onClick={onSaveShortlist}
            disabled={!scoringComplete}
            className="!px-3 !py-1.5 !text-small flex-1 sm:flex-initial justify-center"
          >
            <Save className="h-3.5 w-3.5" />
            Save shortlist
          </Button>
        </div>
      </div>
    </div>
  );
}
