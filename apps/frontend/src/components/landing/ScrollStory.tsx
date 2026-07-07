"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeRise, staggerChildren, EASE_OUT_EXPO } from "@/lib/motion";
import { FileText, Sliders, Users } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "Define the role",
    body: "Upload a JD, paste the description, or build filters manually. The AI extracts role, skills, seniority, and location automatically.",
    chips: ["React", "Senior", "5+ yrs", "Bengaluru"],
  },
  {
    icon: Sliders,
    title: "Edit the filters",
    body: "Every AI guess becomes an editable chip. Add, remove, and tweak before searching.",
    chips: ["TypeScript", "Lead", "Remote", "Fintech"],
  },
  {
    icon: Users,
    title: "Get scored candidates",
    body: "Candidates scored 0–100 against your requirements, with reasoning. Save as a shareable shortlist.",
    chips: ["Export CSV", "Share link", "Score breakdown"],
  },
];

export function ScrollStory() {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="scroll-story"
      className="bg-forest py-section-desktop overflow-hidden"
    >
      <div className="mx-auto max-w-landing px-6">
        <motion.div
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="text-center mb-16"
        >
          <div className="eyebrow text-olive mb-3">THE 30-SECOND VERSION</div>
          <h2 className="font-fraunces text-display-lg text-cream">
            Three steps. One shortlist.
          </h2>
        </motion.div>

        {/* Mobile / reduced-motion fallback — stacked cards */}
        <motion.div
          variants={staggerChildren(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px" }}
          className="grid gap-8 md:grid-cols-3"
        >
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                variants={fadeRise}
                className="rounded-card bg-cream/5 border border-sage-30 p-8 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive/20">
                    <Icon className="h-5 w-5 text-olive" />
                  </div>
                  <span className="font-fraunces text-[32px] font-light text-olive/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-fraunces text-h2 text-cream mb-3">
                  {step.title}
                </h3>
                <p className="font-satoshi text-body text-sage mb-4">
                  {step.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.chips.map((chip) => (
                    <motion.span
                      key={chip}
                      initial={reducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                      className="rounded-chip border border-olive/30 px-3 py-1 font-satoshi text-small text-sage"
                    >
                      {chip}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
