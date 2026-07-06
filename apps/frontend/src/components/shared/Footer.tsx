"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeRise } from "@/lib/motion";
import { useMode } from "./ModeProvider";

const PAGE_LINKS = [
  { label: "Search", href: "/search" },
  { label: "History", href: "/history" },
  { label: "About", href: "/about" },
  { label: "Privacy & Terms", href: "/privacy" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const mode = useMode();

  return (
    <motion.footer
      variants={fadeRise}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      className="bg-forest"
    >
      <div className="mx-auto max-w-landing px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Column 1: Wordmark + tagline */}
          <div>
            <span className="font-fraunces text-[20px] font-semibold tracking-[-0.01em] text-cream">
              AI Talent{" "}
              <span className="italic">Sense</span>
            </span>
            <p className="mt-3 font-satoshi text-small text-sage">
              AI-assisted candidate sourcing, scored against your JD.
            </p>
          </div>

          {/* Column 2: Page links */}
          <div className="flex flex-col gap-2">
            {PAGE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline font-satoshi text-small text-sage hover:text-cream transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Column 3: Credits + mode */}
          <div className="flex flex-col gap-3">
            <span className="text-label text-sage">
              BUILT BY ARPIT SINGH · INTERNSHIP ASSIGNMENT · 2026
            </span>
            {mode && (
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-chip px-3 py-1 text-label ${
                  mode === "live"
                    ? "border border-olive text-olive"
                    : "border border-tan text-tan"
                }`}
              >
                Data mode: {mode === "live" ? "Live" : "Demo"}
              </span>
            )}
          </div>
        </div>

        {/* Bottom hairline §9.3 */}
        <div className="mt-12 border-t border-sage-30 pt-6">
          <p className="font-satoshi text-small text-sage opacity-60">
            © {new Date().getFullYear()} AI Talent Sense
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
