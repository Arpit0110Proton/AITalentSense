"use client";

import { motion } from "framer-motion";
import { fadeRise, staggerChildren } from "@/lib/motion";
import { Database, Code, Zap, Shield, Server, Layout } from "lucide-react";

const STACK_ITEMS = [
  {
    icon: Layout,
    label: "Next.js 14",
    sublabel: "Frontend",
  },
  {
    icon: Server,
    label: "Express.js",
    sublabel: "Backend",
  },
  {
    icon: Database,
    label: "Supabase",
    sublabel: "Postgres + RLS",
  },
  {
    icon: Zap,
    label: "Groq",
    sublabel: "LLM inference",
  },
  {
    icon: Code,
    label: "TypeScript",
    sublabel: "End to end",
  },
  {
    icon: Shield,
    label: "CrustData",
    sublabel: "People API",
  },
];

export function TechStack() {
  return (
    <section className="bg-forest py-section-desktop overflow-hidden">
      <div className="mx-auto max-w-landing px-6">
        <motion.div
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="text-center mb-16"
        >
          <div className="eyebrow text-olive mb-3">UNDER THE HOOD</div>
          <h2 className="font-fraunces text-display-lg text-cream">
            Built with
          </h2>
        </motion.div>

        <motion.div
          variants={staggerChildren(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-5% 0px" }}
          className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
        >
          {STACK_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={fadeRise}
                className="group flex flex-col items-center gap-2 rounded-card border border-sage-30 bg-cream/5 p-5 backdrop-blur-sm transition-colors hover:border-olive"
              >
                <Icon className="h-6 w-6 text-olive" />
                <span className="font-fraunces text-body font-medium text-cream">
                  {item.label}
                </span>
                <span className="font-satoshi text-small text-sage text-center">
                  {item.sublabel}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
