import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        // Semantic brand aliases — point at indigo/teal so existing
        // bg-indigo-600 etc keep rendering identically while new code
        // can opt into the brand-* names.
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81",
        },
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          300: "#5eead4",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
      },
      boxShadow: {
        // Subtle elevation for cards on the slate-50 app surface.
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
        pop: "0 8px 28px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.04)",
      },
      ringColor: {
        DEFAULT: "#6366f1",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 180ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
