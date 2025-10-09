import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        pink: {
          DEFAULT: "var(--color-pink)",
          600: "var(--color-pink-600)",
        },
        cream: "var(--color-cream)",
        brown: "var(--color-brown)",
        white: "var(--color-white)",
        black: "var(--color-black)",
        red: "var(--color-red)",
        yellow: "var(--color-yellow)",
        silver: "var(--color-silver)",
        // Add primary/secondary aliases for consistency
        primary: {
          50: "#FAF5F2",
          100: "#F2E6D8",
          500: "#8B6250",
          600: "#6B4A3A",
          700: "#523829",
          800: "#3A2719",
          900: "#251708",
        },
        secondary: {
          DEFAULT: "var(--color-pink)",
          600: "var(--color-pink-600)",
        },
        accent: {
          50: "#FFF9F5",
          100: "#FFF7F3",
          DEFAULT: "var(--color-pink)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        soft: "var(--shadow-1)",
        elevated: "var(--shadow-2)",
      },
      fontFamily: {
        brand: ["var(--font-brand)", ...defaultTheme.fontFamily.sans],
        body: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
      },
    },
  },
  plugins: [forms, typography, tailwindcssAnimate],
};

export default config;
