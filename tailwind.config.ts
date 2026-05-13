import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: "#F4F1EA",
        "cream-light": "#F6F4EF",
        charcoal: "#1C1B19",
        orange: "#FF5703",
        pink: "#D0318D",
        green: "#00C978",
        blue: "#56AFF9",
        amber: "#FFB100",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument-serif)", "ui-serif", "serif"],
      },
      letterSpacing: {
        tighter: "-0.05em",
        hero: "-0.05em",
      },
    },
  },
  plugins: [],
} satisfies Config;
