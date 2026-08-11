import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: "#000000",
          900: "#0a0a0a",
          800: "#141414",
          700: "#1c1c1c",
          600: "#262626",
        },
        king: {
          red: "#CE1126",
          "red-bright": "#E10600",
          "red-deep": "#9B0C1C",
          gold: "#D4AF37",
          "gold-bright": "#F5C542",
          "gold-deep": "#A8892D",
          silver: "#C8C8C8",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-poppins)",
          "system-ui",
          "sans-serif",
        ],
        welcome: [
          "var(--font-welcome)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.55)",
        red: "0 8px 28px rgba(206, 17, 38, 0.35)",
        gold: "0 4px 20px rgba(212, 175, 55, 0.25)",
      },
      backgroundImage: {
        "brand-glow":
          "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(206,17,38,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(212,175,55,0.1), transparent 50%)",
        "red-gold":
          "linear-gradient(90deg, #CE1126 0%, #D4AF37 100%)",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
