"use client";

import { motion } from "framer-motion";
import { fadeRise } from "@/lib/motion";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export function EmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
  onCtaClick,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeRise}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <h2 className="font-fraunces text-h2 text-forest mb-3">{title}</h2>
      <p className="font-satoshi text-body text-espresso max-w-prose mb-6">
        {body}
      </p>
      {ctaLabel &&
        (ctaHref ? (
          <Button as="a" href={ctaHref}>
            {ctaLabel}
          </Button>
        ) : (
          <Button onClick={onCtaClick}>{ctaLabel}</Button>
        ))}
    </motion.div>
  );
}
