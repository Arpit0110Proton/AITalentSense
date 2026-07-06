import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F1E3",
        forest: "#273214",
        olive: {
          DEFAULT: "#556B2F",
          10: "rgba(85,107,47,0.10)",
          40: "rgba(85,107,47,0.40)",
        },
        sage: {
          DEFAULT: "#8A9B63",
          30: "rgba(138,155,99,0.30)",
        },
        tan: {
          DEFAULT: "#C9B28A",
          40: "rgba(201,178,138,0.40)",
          30: "rgba(201,178,138,0.30)",
        },
        espresso: {
          DEFAULT: "#3B2F2A",
          60: "rgba(59,47,42,0.60)",
          70: "rgba(59,47,42,0.70)",
          80: "rgba(59,47,42,0.80)",
        },
        clay: "#9C4A33",
        "cream-80": "rgba(247,241,227,0.80)",
        "forest-60": "rgba(39,50,20,0.60)",
        "olive-5": "rgba(85,107,47,0.05)",
        "tan-darkened": "#A8895B",
      },
      fontFamily: {
        fraunces: ["var(--font-fraunces)", "serif"],
        satoshi: ["var(--font-satoshi)", "sans-serif"],
      },
      fontSize: {
        "display-xl": [
          "clamp(56px, 8vw, 96px)",
          { lineHeight: "1.02", letterSpacing: "-0.025em", fontWeight: "640" },
        ],
        "display-lg": [
          "clamp(40px, 5vw, 64px)",
          { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        h1: [
          "40px",
          { lineHeight: "1.1", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        h2: [
          "30px",
          { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "560" },
        ],
        h3: [
          "22px",
          { lineHeight: "1.25", letterSpacing: "0", fontWeight: "560" },
        ],
        "body-lg": [
          "18px",
          { lineHeight: "1.65", letterSpacing: "0", fontWeight: "460" },
        ],
        body: [
          "16px",
          { lineHeight: "1.6", letterSpacing: "0", fontWeight: "450" },
        ],
        small: [
          "14px",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "450" },
        ],
        label: [
          "12px",
          { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "560" },
        ],
        score: [
          "34px",
          { lineHeight: "1", letterSpacing: "0", fontWeight: "620" },
        ],
      },
      spacing: {
        "section-desktop": "128px",
        "section-mobile": "72px",
        "app-desktop": "48px",
        "app-mobile": "24px",
      },
      maxWidth: {
        landing: "1200px",
        app: "1040px",
        prose: "680px",
      },
      borderRadius: {
        card: "16px",
        chip: "999px",
        button: "12px",
        input: "10px",
        modal: "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(59,47,42,0.06), 0 8px 24px rgba(59,47,42,0.08)",
        lift: "0 2px 4px rgba(59,47,42,0.08), 0 16px 40px rgba(59,47,42,0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
