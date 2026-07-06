"use client";

import { motion } from "framer-motion";
import { fadeRise, staggerChildren } from "@/lib/motion";
import { Github, Linkedin, Mail } from "lucide-react";

const LINKS = [
  {
    icon: Mail,
    label: "Email",
    href: "mailto:hello@aitalentsense.com",
    display: "hello@aitalentsense.com",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/Arpit0110Proton/AITalentSense",
    display: "github.com/Arpit0110Proton/AITalentSense",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://linkedin.com/company/aitalentsense",
    display: "linkedin.com/company/aitalentsense",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-prose px-6 py-app-desktop text-center">
        <motion.div
          variants={staggerChildren(0.08)}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeRise}>
            <h1 className="font-fraunces text-display-lg text-forest mb-3">
              Say hello.
            </h1>
            <p className="font-satoshi text-body-lg text-espresso mb-12">
              No contact form — just links.
            </p>
          </motion.div>

          <motion.div
            variants={staggerChildren(0.06)}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4"
          >
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  variants={fadeRise}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-card border border-tan-40 bg-cream px-6 py-4 no-underline font-satoshi text-body text-espresso transition-colors hover:border-olive hover:bg-olive-5 w-full max-w-sm"
                >
                  <Icon className="h-5 w-5 text-olive" />
                  <span>{link.display}</span>
                </motion.a>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
