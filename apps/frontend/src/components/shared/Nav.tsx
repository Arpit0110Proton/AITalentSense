"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { Menu, X } from "lucide-react";
import { EASE_INOUT_SOFT, EASE_OUT_EXPO, fadeRise, staggerChildren } from "@/lib/motion";
import { Button } from "./Button";

const NAV_LINKS = [
  { label: "How it works", href: "/about" },
  { label: "History", href: "/history" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useMotionValueEvent(scrollYProgress, "change", () => {
    setScrolled(window.scrollY > 24);
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40"
        animate={
          scrolled
            ? {
                backgroundColor: "rgba(247,241,227,0.80)",
                backdropFilter: "blur(12px)",
              }
            : {
                backgroundColor: "rgba(247,241,227,0)",
                backdropFilter: "blur(0px)",
              }
        }
        transition={{ duration: 0.3 }}
      >
        {/* Scroll progress bar — landing only §8.7 #2 */}
        {isLanding && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-[2px] bg-olive origin-left"
            style={{ scaleX }}
          />
        )}

        {/* Bottom hairline when scrolled */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-tan"
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <nav className="mx-auto flex max-w-landing items-center justify-between px-6 py-4">
          {/* Wordmark §9.2 */}
          <Link href="/" className="no-underline">
            <span className="font-fraunces text-[20px] font-semibold tracking-[-0.01em] text-espresso">
              AI Talent{" "}
              <span className="italic">Sense</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="no-underline font-satoshi text-small text-espresso hover:text-olive transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Button as="a" href="/search" variant="primary">
              Start a search
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <motion.span
              animate={{
                rotate: mobileOpen ? 45 : 0,
                y: mobileOpen ? 0 : -4,
              }}
              transition={{ duration: 0.3 }}
              className="absolute h-[1.5px] w-5 bg-espresso"
            />
            <motion.span
              animate={{
                rotate: mobileOpen ? -45 : 0,
                y: mobileOpen ? 0 : 4,
              }}
              transition={{ duration: 0.3 }}
              className="absolute h-[1.5px] w-5 bg-espresso"
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile overlay menu §9.1 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-forest md:hidden"
            initial={{ clipPath: "circle(0% at calc(100% - 36px) 32px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 36px) 32px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 36px) 32px)" }}
            transition={{ duration: 0.5, ease: EASE_INOUT_SOFT }}
          >
            <motion.div
              variants={staggerChildren(0.06)}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-6"
            >
              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={fadeRise}>
                  <Link
                    href={link.href}
                    className="no-underline font-satoshi text-h2 text-cream"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={fadeRise}>
                <Button
                  as="a"
                  href="/search"
                  variant="primary"
                >
                  Start a search
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
