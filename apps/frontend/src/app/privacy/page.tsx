"use client";

import { motion } from "framer-motion";
import { fadeRise, staggerChildren } from "@/lib/motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream pt-24">
      <div className="mx-auto max-w-prose px-6 py-app-desktop">
        <motion.div
          variants={staggerChildren(0.06)}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeRise}>
            <div className="eyebrow text-espresso">LEGAL</div>
            <h1 className="font-fraunces text-display-lg text-forest mb-6">
              Privacy &amp; Terms
            </h1>
          </motion.div>

          <motion.div
            variants={fadeRise}
            className="font-satoshi text-body text-espresso space-y-6"
          >
            <section>
              <h2 className="font-fraunces text-h2 text-forest mb-2">
                What we store
              </h2>
              <p>
                AI Talent Sense stores job description text you paste, the filters
                extracted from it, and the resulting candidate matches in a Supabase
                Postgres database. This data is not encrypted at-rest beyond
                Supabase&apos;s default protections.
              </p>
            </section>

            <section>
              <h2 className="font-fraunces text-h2 text-forest mb-2">
                No accounts
              </h2>
              <p>
                There is no authentication. All search history and shortlists are
                public and visible to every visitor. Do not paste confidential JDs
                or personally identifiable information you&apos;re not comfortable
                being public.
              </p>
            </section>

            <section>
              <h2 className="font-fraunces text-h2 text-forest mb-2">
                Third-party services
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Groq:</strong> JD text is sent to Groq&apos;s LLM inference
                  API for parsing and scoring. Groq&apos;s privacy policy applies.
                </li>
                <li>
                  <strong>CrustData (live mode):</strong> Filter parameters are sent
                  to CrustData&apos;s Person Search API. CrustData&apos;s privacy
                  policy applies.
                </li>
                <li>
                  <strong>Supabase:</strong> All application data is stored in
                  Supabase Postgres. Supabase&apos;s terms of service apply.
                </li>
                <li>
                  <strong>Vercel:</strong> The frontend is hosted on Vercel. Standard
                  Vercel analytics may apply.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-fraunces text-h2 text-forest mb-2">
                Data retention
              </h2>
              <p>
                Data is retained indefinitely on the free tier. CrustData API
                responses are cached for 24 hours and then deleted. There is no
                automated deletion of search history or shortlists.
              </p>
            </section>

            <section>
              <h2 className="font-fraunces text-h2 text-forest mb-2">
                Disclaimer
              </h2>
              <p>
                This is a student internship project, not a commercial product.
                It is provided as-is with no warranty. Use at your own risk.
              </p>
            </section>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
