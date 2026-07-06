"use client";

import { motion } from "framer-motion";
import { fadeRise, staggerChildren } from "@/lib/motion";
import { FileText, Sliders, Users, BarChart3 } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    number: "01",
    title: "Paste a job description",
    body: "Drop the full JD into the search box — role, requirements, location, everything. The AI reads all of it.",
  },
  {
    icon: Sliders,
    number: "02",
    title: "Review & edit filters",
    body: "Every AI guess becomes an editable chip. You control titles, skills, seniority bands, locations, and experience ranges.",
  },
  {
    icon: Users,
    number: "03",
    title: "Get scored candidates",
    body: "Candidates appear ranked 0–100. Each score breaks down into skills, seniority, industry, and location subscores.",
  },
  {
    icon: BarChart3,
    number: "04",
    title: "Save & share",
    body: "Export to CSV or save a shareable shortlist with a single link — anyone with the URL can view the frozen snapshot.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-prose px-6 py-app-desktop">
        <motion.div
          variants={staggerChildren(0.08)}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeRise}>
            <div className="eyebrow text-espresso">WHAT IT IS</div>
            <h1 className="font-fraunces text-display-lg text-forest mb-4">
              How it works
            </h1>
            <p className="font-satoshi text-body-lg text-espresso mb-12">
              AI Talent Sense is an AI-assisted candidate sourcing tool built as an
              internship assignment. It turns any job description into scored,
              ranked candidates — no signup, no paywall.
            </p>
          </motion.div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeRise}
                className="flex gap-5 mb-10"
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive/10">
                    <Icon className="h-5 w-5 text-olive" />
                  </div>
                  <div className="flex-1 w-px bg-tan mt-2" />
                </div>
                <div className="pb-4">
                  <span className="text-label text-olive">{step.number}</span>
                  <h2 className="font-fraunces text-h2 text-forest mt-1 mb-2">
                    {step.title}
                  </h2>
                  <p className="font-satoshi text-body text-espresso">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            );
          })}

          <motion.div variants={fadeRise} className="mt-8">
            <h2 className="font-fraunces text-h2 text-forest mb-3">
              Data modes
            </h2>
            <p className="font-satoshi text-body text-espresso mb-4">
              AI Talent Sense supports two interchangeable data sources:
            </p>
            <ul className="list-disc pl-5 font-satoshi text-body text-espresso space-y-2">
              <li>
                <strong>Demo mode:</strong> 750 deterministic synthetic profiles
                across 10 role families. No API key required.
              </li>
              <li>
                <strong>Live mode:</strong> Real-time profiles from CrustData&apos;s
                Person Search API. Requires a CrustData API key.
              </li>
            </ul>
          </motion.div>

          <motion.div variants={fadeRise} className="mt-8">
            <h2 className="font-fraunces text-h2 text-forest mb-3">
              Scoring
            </h2>
            <p className="font-satoshi text-body text-espresso">
              Each candidate gets four subscores (skills ×0.40, seniority ×0.25,
              industry ×0.25, location ×0.10) from Groq&apos;s LLM. If the AI is
              unavailable, a heuristic fallback kicks in — Jaccard for skills,
              band-distance for seniority — and the card is flagged.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
