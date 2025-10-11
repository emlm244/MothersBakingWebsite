import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          muted: "var(--color-surface-muted)",
        },
        primary: {
          50: "var(--color-coral-50)",
          100: "var(--color-coral-100)",
          300: "var(--color-coral-300)",
          500: "var(--color-coral-500)",
          600: "var(--color-coral-600)",
          700: "var(--color-coral-700)",
        },
        secondary: {
          50: "var(--color-teal-50)",
          100: "var(--color-teal-100)",
          400: "var(--color-teal-400)",
          500: "var(--color-teal-500)",
          600: "var(--color-teal-600)",
        },
        accent: {
          sand: "var(--color-sand-200)",
        },
        slate: {
          400: "var(--color-slate-400)",
          600: "var(--color-slate-600)",
          800: "var(--color-slate-800)",
        },
        navy: {
          900: "var(--color-navy-900)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        destructive: "var(--color-error)",
        white: "#ffffff",
        black: "#000000",
      },
      dropShadow: {
        card: "var(--shadow-sm)",
        hero: "var(--shadow-lg)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        soft: "var(--shadow-sm)",
        elevated: "var(--shadow-lg)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
        body: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "var(--color-slate-600)",
            "--tw-prose-headings": "var(--color-slate-800)",
            "--tw-prose-links": "var(--color-coral-600)",
            "--tw-prose-bold": "var(--color-slate-800)",
            "--tw-prose-code": "var(--color-teal-600)",
            "--tw-prose-quotes": "var(--color-slate-600)",
            a: {
              textDecoration: "none",
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
  plugins: [forms, typography, tailwindcssAnimate],
};

export default config;
