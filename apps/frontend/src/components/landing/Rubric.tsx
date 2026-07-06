"use client";

import { motion } from "framer-motion";
import { fadeRise, staggerChildren, EASE_OUT_EXPO } from "@/lib/motion";

const RUBRIC_ITEMS = [
  {
    label: "Skills",
    weight: "×0.40",
    description: "Overlap between candidate skills and JD requirements.",
  },
  {
    label: "Seniority",
    weight: "×0.25",
    description: "Band-distance from the required seniority level.",
  },
  {
    label: "Industry",
    weight: "×0.25",
    description: "Relevance of past industries to the role's domain.",
  },
  {
    label: "Location",
    weight: "×0.10",
    description: "Exact city, same country, or remote match.",
  },
];

export function Rubric() {
  return (
    <section className="bg-cream py-section-desktop">
      <div className="mx-auto max-w-landing px-6">
        <motion.div
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="text-center mb-16"
        >
          <div className="eyebrow text-espresso mb-3">HOW IT THINKS</div>
          <h2 className="font-fraunces text-display-lg text-forest">
            The rubric
          </h2>
          <p className="font-satoshi text-body text-espresso max-w-prose mx-auto mt-3">
            Every candidate gets four subscores, weighted and combined into a
            single 0–100 fit score. No black box — you see the math.
          </p>
        </motion.div>

        <motion.div
          variants={staggerChildren(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px" }}
          className="grid gap-5 md:grid-cols-4"
        >
          {RUBRIC_ITEMS.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeRise}
              className="rounded-card border border-tan-40 bg-cream p-6 text-center"
            >
              <span className="font-fraunces text-display-lg text-olive">
                {item.weight}
              </span>
              <h3 className="font-fraunces text-h3 text-forest mt-2 mb-2">
                {item.label}
              </h3>
              <p className="font-satoshi text-small text-espresso-60">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Formula */}
        <motion.div
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block rounded-card border border-tan bg-olive-5 px-6 py-4">
            <code className="font-satoshi text-body text-espresso">
              score = 0.40 × skills + 0.25 × seniority + 0.25 × industry + 0.10 × location
            </code>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
