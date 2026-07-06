"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { EASE_OUT_EXPO, DUR } from "@/lib/motion";

interface ScoreRingProps {
  score: number | null; // null = loading placeholder
  size?: number;
  className?: string;
}

export function ScoreRing({ score, size = 72, className = "" }: ScoreRingProps) {
  const r = 26;
  const stroke = 5;
  const circumference = 2 * Math.PI * r;
  const center = size / 2;
  const motionProgress = useMotionValue(0);
  const displayScore = useMotionValue(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  // Color by band: ≥75 olive, 50–74 tan-darkened, <50 clay
  const strokeColor =
    score === null
      ? "#C9B28A"
      : score >= 75
        ? "#556B2F"
        : score >= 50
          ? "#A8895B"
          : "#9C4A33";

  const pathLength = useTransform(motionProgress, [0, 1], [0, (score ?? 0) / 100]);

  useEffect(() => {
    if (score === null) return;
    const controls = animate(motionProgress, 1, {
      duration: DUR.ring,
      ease: EASE_OUT_EXPO,
    });
    const counterControls = animate(displayScore, score, {
      duration: DUR.ring,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => {
        if (counterRef.current) {
          counterRef.current.textContent = String(Math.round(v));
        }
      },
    });
    return () => {
      controls.stop();
      counterControls.stop();
    };
  }, [score, motionProgress, displayScore]);

  if (score === null) {
    // Pulsing placeholder — §11.2.2
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <motion.svg
          width={size}
          height={size}
          className="rotate-[-90deg]"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
        >
          <circle
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="#C9B28A"
            strokeWidth={stroke}
          />
        </motion.svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="rgba(201,178,138,0.30)"
          strokeWidth={stroke}
        />
        {/* Score arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ pathLength }}
          initial={{ pathLength: 0 }}
        />
      </svg>
      <span
        ref={counterRef}
        className="absolute inset-0 flex items-center justify-center font-fraunces text-score font-tabular"
        style={{ color: strokeColor }}
      >
        0
      </span>
    </div>
  );
}
