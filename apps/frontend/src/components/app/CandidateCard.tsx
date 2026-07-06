"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, ExternalLink, ChevronDown, AlertCircle } from "lucide-react";
import { EASE_OUT_EXPO, EASE_INOUT_SOFT } from "@/lib/motion";
import { ScoreRing } from "./ScoreRing";
import type { ScoredCandidate, CandidateProfile } from "@/lib/api";

type CardCandidate = ScoredCandidate | (CandidateProfile & { score?: undefined });

interface CandidateCardProps {
  candidate: CardCandidate;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

export function CandidateCard({
  candidate,
  isOpen,
  onToggle,
  index,
}: CandidateCardProps) {
  const scored = candidate.score !== undefined ? (candidate as ScoredCandidate) : null;
  const skills = candidate.skills.slice(0, 6);
  const hasOverflow = candidate.skills.length > 6;

  return (
    <motion.div
      layout
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.55,
        ease: EASE_OUT_EXPO,
        delay: index * 0.06,
      }}
      className="group rounded-card border border-tan-40 bg-cream shadow-card transition-all duration-[250ms] hover:shadow-lift hover:-translate-y-[2px]"
    >
      {/* Main card */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 grid gap-4 items-start"
        style={{ gridTemplateColumns: "72px 1fr auto" }}
      >
        {/* Score ring */}
        <ScoreRing score={scored?.score ?? null} />

        {/* Main content */}
        <div className="min-w-0">
          <h3 className="font-fraunces text-h3 text-forest truncate">
            {candidate.name}
          </h3>
          <p className="font-satoshi text-small text-espresso-80 truncate mt-0.5">
            {candidate.headline}
          </p>
          {scored && (
            <p className="font-satoshi text-body text-espresso mt-1.5 line-clamp-2">
              {scored.blurb}
            </p>
          )}
          {!scored && (
            <div className="mt-1.5 h-4 w-3/4 rounded bg-tan-30 animate-pulse" />
          )}
          {/* Skill pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-block rounded-chip bg-olive-10 px-2 py-0.5 font-satoshi text-[11px] text-espresso"
              >
                {skill}
              </span>
            ))}
            {hasOverflow && (
              <span className="inline-block rounded-chip bg-tan-30 px-2 py-0.5 font-satoshi text-[11px] text-espresso-60">
                +{candidate.skills.length - 6}
              </span>
            )}
          </div>
        </div>

        {/* Meta right */}
        <div className="flex flex-col items-end gap-1.5 text-right">
          <span className="flex items-center gap-1 font-satoshi text-small text-espresso-60">
            <MapPin className="h-3.5 w-3.5" />
            {candidate.location || "—"}
          </span>
          <span className="flex items-center gap-1 font-satoshi text-small text-espresso-60">
            <Clock className="h-3.5 w-3.5" />
            {candidate.yearsOfExperience} yrs
          </span>
          {candidate.linkedinUrl ? (
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-satoshi text-small text-olive no-underline hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              LinkedIn <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="font-satoshi text-small text-espresso-60">
              No LinkedIn on file
            </span>
          )}
          {scored?.scoredBy === "heuristic" && (
            <span
              className="inline-flex items-center gap-1 font-satoshi text-[11px] text-sage"
              title="Heuristic score — AI scorer was unavailable."
            >
              <AlertCircle className="h-3 w-3" />
              Heuristic
            </span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.35 }}
          >
            <ChevronDown className="h-4 w-4 text-espresso-60" />
          </motion.div>
        </div>
      </button>

      {/* Accordion detail — §11.2.4 */}
      <AnimatePresence>
        {isOpen && scored && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_INOUT_SOFT }}
            className="overflow-hidden"
          >
            <div className="border-t border-tan-30 px-5 py-4 grid gap-6 md:grid-cols-2">
              {/* Subscore bars */}
              <div className="space-y-3">
                <h4 className="text-label text-espresso-60">SUBSCORES</h4>
                {(
                  [
                    { label: "Skills", key: "skills" as const, weight: "×0.40" },
                    { label: "Seniority", key: "seniority" as const, weight: "×0.25" },
                    { label: "Industry", key: "industry" as const, weight: "×0.25" },
                    { label: "Location", key: "location" as const, weight: "×0.10" },
                  ] as const
                ).map((sub, i) => (
                  <div key={sub.key} className="flex items-center gap-3">
                    <span className="font-satoshi text-small text-espresso w-20">
                      {sub.label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-tan-30 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-olive"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: scored.subscores[sub.key] / 100 }}
                        transition={{
                          duration: 0.6,
                          ease: EASE_OUT_EXPO,
                          delay: i * 0.05,
                        }}
                        style={{ transformOrigin: "left" }}
                      />
                    </div>
                    <span className="font-satoshi text-small text-espresso-60 w-8 text-right">
                      {scored.subscores[sub.key]}
                    </span>
                    <span className="text-label text-espresso-60">{sub.weight}</span>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Summary */}
                {candidate.summary && (
                  <div>
                    <h4 className="text-label text-espresso-60 mb-1">SUMMARY</h4>
                    <p className="font-satoshi text-small text-espresso">
                      {candidate.summary}
                    </p>
                  </div>
                )}

                {/* Past roles timeline */}
                {candidate.pastRoles.length > 0 && (
                  <div>
                    <h4 className="text-label text-espresso-60 mb-2">EXPERIENCE</h4>
                    <div className="relative pl-4">
                      <div className="absolute left-1 top-1.5 bottom-1.5 w-px bg-tan" />
                      {candidate.pastRoles.map((role, i) => (
                        <div key={i} className="relative pb-3 last:pb-0">
                          <div className="absolute left-[-12px] top-1.5 h-2 w-2 rounded-full bg-olive" />
                          <p className="font-satoshi text-small text-espresso">
                            {role.title} @ {role.company} · {role.years}y
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {candidate.education.length > 0 && (
                  <div>
                    <h4 className="text-label text-espresso-60 mb-1">EDUCATION</h4>
                    {candidate.education.map((edu, i) => (
                      <p key={i} className="font-satoshi text-small text-espresso">
                        {edu.degree} — {edu.school}
                        {edu.year > 0 && ` (${edu.year})`}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
