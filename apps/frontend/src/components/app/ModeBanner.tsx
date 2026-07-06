"use client";

import { motion } from "framer-motion";
import { Info, Radio } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";

interface ModeBannerProps {
  mode: "mock" | "live";
}

export function ModeBanner({ mode }: ModeBannerProps) {
  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      className="flex items-center gap-3 rounded-card border border-tan-40 bg-cream px-4 py-3 mb-6"
    >
      {mode === "mock" ? (
        <>
          <Info className="h-4 w-4 flex-shrink-0 text-olive" />
          <span className="font-satoshi text-small text-espresso">
            <strong>Showing demo data.</strong> Add a CrustData API key to switch to live results.
          </span>
        </>
      ) : (
        <>
          <Radio className="h-4 w-4 flex-shrink-0 text-olive" />
          <span className="font-satoshi text-small text-espresso">
            <strong>Live data via CrustData.</strong>
          </span>
        </>
      )}
    </motion.div>
  );
}
