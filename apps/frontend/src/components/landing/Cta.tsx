"use client";

import { motion } from "framer-motion";
import { fadeRise } from "@/lib/motion";
import { Button } from "@/components/shared/Button";

export function Cta() {
  return (
    <section className="bg-cream py-section-desktop">
      <div className="mx-auto max-w-landing px-6">
        <motion.div
          variants={fadeRise}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10% 0px" }}
          className="text-center"
        >
          <h2 className="font-fraunces text-display-lg text-forest mb-4">
            Ready to try it?
          </h2>
          <p className="font-satoshi text-body-lg text-espresso max-w-prose mx-auto mb-8">
            No signup. No API key. Paste a job description and see your
            shortlist in under a minute.
          </p>
          <Button as="a" href="/search">
            Start a search
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
