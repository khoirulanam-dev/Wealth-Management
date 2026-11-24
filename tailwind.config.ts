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
        // Apple iOS & macOS Design System Palette
        body: "#F2F2F7", // iOS System Grouped Background
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1C1E",
        },
        sidebar: {
          DEFAULT: "rgba(251, 251, 253, 0.95)",
          foreground: "#1C1C1E",
        },
        border: {
          DEFAULT: "rgba(0, 0, 0, 0.08)",
          soft: "rgba(0, 0, 0, 0.04)",
        },
        input: "rgba(0, 0, 0, 0.08)",
        ring: "#007AFF",
        background: "#F2F2F7",
        foreground: "#1C1C1E",
        primary: {
          DEFAULT: "#007AFF", // Apple System Blue
          light: "#47A3FF",
          dark: "#0062CC",
          soft: "#EBF5FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "rgba(0, 0, 0, 0.04)",
          foreground: "#1C1C1E",
        },
        muted: {
          DEFAULT: "rgba(0, 0, 0, 0.04)",
          foreground: "#8E8E93", // Apple Secondary Label
          light: "#AEAEB2", // Apple Tertiary Label
        },
        accent: {
          DEFAULT: "#EBF5FF",
          foreground: "#007AFF",
        },
        destructive: {
          DEFAULT: "#FF3B30", // Apple System Red
          soft: "#FFEBEA",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#34C759", // Apple System Green
          soft: "#EAF9EE",
        },
        warning: {
          DEFAULT: "#FF9500", // Apple System Orange
          soft: "#FFF5E5",
        },
        purple: {
          DEFAULT: "#AF52DE", // Apple System Purple
          soft: "#F7EDFC",
        },
        info: {
          DEFAULT: "#32ADE6", // Apple System Cyan
          soft: "#EDF8FD",
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
