import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Adminator 2026 Palette
        body: "#F0F4F8",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        sidebar: {
          DEFAULT: "#FFFFFF",
          foreground: "#1E293B",
        },
        border: {
          DEFAULT: "#E4E8EF",
          soft: "#EEF1F5",
        },
        input: "#E4E8EF",
        ring: "#2563EB",
        background: "#F0F4F8",
        foreground: "#1E293B",
        primary: {
          DEFAULT: "#2563EB",
          light: "#3B82F6",
          dark: "#1D4ED8",
          soft: "#EFF6FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "#1E293B",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
          light: "#94A3B8",
        },
        accent: {
          DEFAULT: "#EFF6FF",
          foreground: "#2563EB",
        },
        destructive: {
          DEFAULT: "#EF4444",
          soft: "#FEF2F2",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981",
          soft: "#ECFDF5",
        },
        warning: {
          DEFAULT: "#F59E0B",
          soft: "#FFFBEB",
        },
        purple: {
          DEFAULT: "#8B5CF6",
          soft: "#F5F3FF",
        },
        info: {
          DEFAULT: "#0EA5E9",
          soft: "#F0F9FF",
        },
      },
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)",
        lg: "0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.05)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
