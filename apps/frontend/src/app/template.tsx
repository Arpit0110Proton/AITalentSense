"use client";

import { motion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";

// Page transition fade — §8.7 #6
// opacity 0, y:4 → 1, 0; 0.25s EASE_OUT_EXPO. Never longer — app must feel instant.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}
