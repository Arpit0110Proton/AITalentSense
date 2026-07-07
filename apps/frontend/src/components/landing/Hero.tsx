"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { SPRING_SOFT, EASE_OUT_EXPO, fadeRise, staggerChildren } from "@/lib/motion";
import { Button } from "@/components/shared/Button";

// Motion #10 — Magnetic CTA
function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING_SOFT);
  const springY = useSpring(y, SPRING_SOFT);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      x.set(Math.max(-6, Math.min(6, dx * 0.08)));
      y.set(Math.max(-6, Math.min(6, dy * 0.08)));
    }
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <Button as="a" href={href}>
        {children}
      </Button>
    </motion.div>
  );
}

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  // Motion #7 — mouse tilt
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [7, -7]);

  // Per-layer parallax
  const backX = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const backY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);
  const midX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const midY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);
  const frontX = useTransform(smoothX, [-0.5, 0.5], [-26, 26]);
  const frontY = useTransform(smoothY, [-0.5, 0.5], [-26, 26]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const words = ["Define", "the", "role.", "Meet", "your", "shortlist."];

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center bg-cream overflow-hidden pt-20"
    >
      <div className="mx-auto max-w-landing px-6 grid grid-cols-1 gap-12 lg:grid-cols-2 items-center w-full">
        {/* Left column — 55% */}
        <div>
          {/* Headline — Motion #9 per-word rise */}
          <motion.h1
            variants={staggerChildren(0.08, 0.15)}
            initial="hidden"
            animate="visible"
            className="font-fraunces text-display-xl text-forest mb-6"
          >
            {words.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
                <motion.span
                  className={`inline-block ${word === "shortlist." ? "" : ""}`}
                  variants={{
                    hidden: { y: "110%" },
                    visible: {
                      y: 0,
                      transition: { duration: 0.7, ease: EASE_OUT_EXPO },
                    },
                  }}
                >
                  {word === "shortlist." ? (
                    <>shortlist<span className="text-olive">.</span></>
                  ) : (
                    word
                  )}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          {/* Sub-line */}
          <motion.p
            variants={fadeRise}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
            className="font-satoshi text-body-lg text-espresso max-w-[52ch] mb-8"
          >
            AI Talent Sense reads any job description, turns it into editable
            filters, and returns candidates scored 0–100 against your exact
            requirements — with the reasoning to back it up.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeRise}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.1 }}
            className="flex items-center gap-4"
          >
            <MagneticButton href="/search">Start a search</MagneticButton>
            <a
              href="#scroll-story"
              className="font-satoshi text-body text-espresso hover:text-olive transition-colors"
            >
              How it works ↓
            </a>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            className="hidden lg:block mt-16"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ transformOrigin: "top" }}
          >
            <div className="w-px h-10 bg-olive mx-auto" />
          </motion.div>
        </div>

        {/* Right column — floating JD card composition */}
        <motion.div
          variants={fadeRise}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="relative hidden lg:block h-[420px]"
          style={{ perspective: 1000 }}
        >
          <motion.div style={{ rotateY, rotateX }} className="relative h-full">
            {/* Back layer — blurred ghost */}
            <motion.div
              style={{ x: backX, y: backY }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              className="absolute top-8 left-4 w-[320px] h-[400px] rounded-card bg-sage/20 blur-[2px] -rotate-6"
            />

            {/* Mid layer — THE JD card */}
            <motion.div
              style={{ x: midX, y: midY }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.8 }}
              className="absolute top-0 left-8 w-[320px] h-[400px] rounded-card border border-tan bg-cream shadow-card p-5"
            >
              <div className="text-label text-espresso-60 mb-2">JOB DESCRIPTION</div>
              <h3 className="font-fraunces text-h3 text-forest mb-3">
                Senior Frontend Engineer
              </h3>
              <div className="space-y-2">
                <div className="h-3 bg-tan-30 rounded w-full" />
                <div className="h-3 bg-tan-30 rounded w-5/6" />
                <div className="h-3 bg-tan-30 rounded w-4/6" />
                <div className="h-3 bg-tan-30 rounded w-5/6" />
              </div>
              <div className="mt-4 space-y-1.5">
                <span className="inline-block bg-olive-10 rounded px-2 py-0.5 font-satoshi text-small text-espresso">
                  React
                </span>
                <span className="inline-block bg-olive-10 rounded px-2 py-0.5 font-satoshi text-small text-espresso ml-1">
                  5+ years
                </span>
                <span className="inline-block bg-olive-10 rounded px-2 py-0.5 font-satoshi text-small text-espresso ml-1">
                  Bengaluru or Remote
                </span>
              </div>
            </motion.div>

            {/* Front layer — chips + score ring */}
            <motion.div
              style={{ x: frontX, y: frontY }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 1.6 }}
              className="absolute top-12 right-0"
            >
              {/* Chips overlapping right edge */}
              <div className="flex flex-col gap-2 absolute right-[-20px] top-0">
                {["React", "Senior", "Remote"].map((label) => (
                  <span
                    key={label}
                    className="rounded-chip border border-olive bg-cream px-3 py-1 font-satoshi text-small text-espresso shadow-card"
                  >
                    {label}
                  </span>
                ))}
              </div>
              {/* Score ring badge */}
              <div className="absolute bottom-[-80px] left-0 w-16 h-16 rounded-full bg-cream border border-tan shadow-card flex items-center justify-center">
                <span className="font-fraunces text-[20px] font-semibold text-olive font-tabular">
                  78
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
