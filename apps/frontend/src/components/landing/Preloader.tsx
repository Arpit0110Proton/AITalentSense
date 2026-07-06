"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT_EXPO, EASE_INOUT_SOFT } from "@/lib/motion";

export function Preloader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("ats-seen")) return;
    setShow(true);
    sessionStorage.setItem("ats-seen", "1");
    const timer = setTimeout(() => setShow(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.45, ease: EASE_INOUT_SOFT, delay: 0.8 }}
        >
          <div className="flex gap-3">
            {["AI", "Talent", "Sense"].map((word, i) => (
              <span key={word} className="overflow-hidden">
                <motion.span
                  className={`block font-fraunces text-display-lg text-cream ${
                    word === "Sense" ? "italic" : ""
                  }`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: EASE_OUT_EXPO,
                    delay: i * 0.09,
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
