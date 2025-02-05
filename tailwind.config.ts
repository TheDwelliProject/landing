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
        brand: "#ff5703"
      },
      keyframes: {
        "fade-up": {
         '0%': { transform: 'translateY(20px)', opacity: "0" },
          '100%': { transform: 'translateY(0px)', opacity: "1" },
        },
        "fade-in": {
         '0%': { opacity: "0" },
          '100%': {  opacity: "1" },
        }
      },
      animation: {
        "hero-headline": 'fade-up 0.3s linear both',
        "hero-caption": 'fade-up 0.3s linear 0.2s both',
        "hero-button": 'fade-up 0.3s linear 0.4s both',
        "hero-subtext": 'fade-up 0.3s linear 0.6s both',
        "appear": 'fade-in 0.3s linear both',
        "page-appear": 'fade-up 0.3s linear 1.5s both',
      },
    },
  },
  plugins: [],
} satisfies Config;
