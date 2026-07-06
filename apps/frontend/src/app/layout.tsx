import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import localFont from "next/font/local";
import { MotionConfig } from "framer-motion";
import { GrainOverlay } from "@/components/shared/GrainOverlay";
import { Nav } from "@/components/shared/Nav";
import { Footer } from "@/components/shared/Footer";
import { ModeProvider } from "@/components/shared/ModeProvider";
import { ToastProvider } from "@/components/shared/Toast";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Variable.woff2",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-VariableItalic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Talent Sense — AI-Assisted Candidate Sourcing",
  description:
    "Paste a job description, get editable search filters, and receive candidates scored 0–100 against your exact requirements — with the reasoning to back it up.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${satoshi.variable}`}>
      <body className="font-satoshi bg-cream text-espresso antialiased">
        <MotionConfig reducedMotion="user">
          <ModeProvider>
            <ToastProvider>
              <GrainOverlay />
              <Nav />
              <main>{children}</main>
              <Footer />
            </ToastProvider>
          </ModeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
