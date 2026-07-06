// lib/motion.ts — ALL motion tokens (§8.5) — single source of truth
// Every component imports from here. Never define easings/springs inline.

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const; // entrances, reveals
export const EASE_INOUT_SOFT = [0.65, 0, 0.35, 1] as const; // curtains, accordions

export const SPRING_SOFT = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
};
export const SPRING_SNAPPY = {
  type: "spring" as const,
  stiffness: 400,
  damping: 28,
};
export const SPRING_CURSOR_DOT = { stiffness: 600, damping: 40 } as const;
export const SPRING_CURSOR_RING = { stiffness: 200, damping: 25 } as const;

export const DUR = {
  fast: 0.18,
  base: 0.3,
  reveal: 0.6,
  hero: 0.7,
  ring: 1.0,
} as const;

export const fadeRise = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.reveal, ease: EASE_OUT_EXPO },
  },
};

export const staggerChildren = (stagger = 0.08, delay = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});
